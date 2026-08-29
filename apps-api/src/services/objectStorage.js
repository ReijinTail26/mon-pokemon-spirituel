const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')
const { Readable } = require('stream')

const STORAGE_DRIVER = String(process.env.STORAGE_DRIVER || 'local').toLowerCase()

function isR2() {
  return STORAGE_DRIVER === 'r2'
}

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`MISSING_${name}`)
  return value
}

function rfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, character =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  )
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest()
}

function r2Config() {
  const endpoint = new URL(required('R2_ENDPOINT'))
  return {
    endpoint,
    bucket: required('R2_BUCKET_NAME'),
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
    region: process.env.R2_REGION || 'auto',
  }
}

function amzTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function objectUrl(endpoint, bucket, key) {
  const basePath = endpoint.pathname.replace(/\/$/, '')
  const encodedKey = String(key).split('/').map(rfc3986).join('/')
  return new URL(`${basePath}/${rfc3986(bucket)}/${encodedKey}`, `${endpoint.protocol}//${endpoint.host}`)
}

function signingKey(secret, date, region) {
  const dateKey = hmac(`AWS4${secret}`, date)
  const regionKey = hmac(dateKey, region)
  const serviceKey = hmac(regionKey, 's3')
  return hmac(serviceKey, 'aws4_request')
}

async function signedR2Request({ method, key, body = Buffer.alloc(0), contentType, contentDisposition }) {
  const config = r2Config()
  const url = objectUrl(config.endpoint, config.bucket, key)
  const timestamp = amzTimestamp()
  const date = timestamp.slice(0, 8)
  const payloadHash = sha256(body)
  const headers = {
    host: url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': timestamp,
  }
  if (contentType) headers['content-type'] = contentType
  if (contentDisposition) headers['content-disposition'] = contentDisposition

  const signedHeaderNames = Object.keys(headers).sort()
  const canonicalHeaders = signedHeaderNames.map(name => `${name}:${headers[name].trim()}\n`).join('')
  const canonicalRequest = [
    method,
    url.pathname,
    '',
    canonicalHeaders,
    signedHeaderNames.join(';'),
    payloadHash,
  ].join('\n')
  const scope = `${date}/${config.region}/s3/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', timestamp, scope, sha256(canonicalRequest)].join('\n')
  const signature = crypto.createHmac('sha256', signingKey(config.secretAccessKey, date, config.region))
    .update(stringToSign).digest('hex')

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaderNames.join(';')}, Signature=${signature}`
  delete headers.host

  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    Number(process.env.R2_REQUEST_TIMEOUT_MS || 45000)
  )

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : body,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`R2_${method}_TIMEOUT`)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
  if (!response.ok && response.status !== 404) {
    const detail = (await response.text()).slice(0, 1000)
    throw new Error(`R2_${method}_FAILED_${response.status}: ${detail}`)
  }
  return response
}

async function putObject({ key, body, contentType, contentDisposition, localPath }) {
  if (!Buffer.isBuffer(body)) body = Buffer.from(body)
  if (isR2()) {
    await signedR2Request({ method: 'PUT', key, body, contentType, contentDisposition })
    return
  }
  await fs.mkdir(path.dirname(localPath), { recursive: true })
  await fs.writeFile(localPath, body)
}

async function getObject({ key, localPath }) {
  if (isR2()) {
    const response = await signedR2Request({ method: 'GET', key })
    if (response.status === 404) return null
    return Buffer.from(await response.arrayBuffer())
  }
  try {
    return await fs.readFile(localPath)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function deleteObject({ key, localPath }) {
  if (isR2()) {
    await signedR2Request({ method: 'DELETE', key })
    return
  }
  await fs.rm(localPath, { force: true })
}

async function sendObject(res, { key, localPath, contentType, filename, download = false, cacheControl = 'private, no-store' }) {
  if (isR2()) {
    const response = await signedR2Request({ method: 'GET', key })
    if (response.status === 404) return false

    res.setHeader('Content-Type', contentType || response.headers.get('content-type') || 'application/octet-stream')
    const contentLength = response.headers.get('content-length')
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', cacheControl)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (download && filename) {
      res.setHeader('Content-Disposition', `attachment; filename="${String(filename).replace(/["\\\r\n]/g, '_')}"`)
    }

    if (!response.body) return false
    await new Promise((resolve, reject) => {
      Readable.fromWeb(response.body)
        .on('error', reject)
        .pipe(res)
        .on('finish', resolve)
        .on('error', reject)
    })
    return true
  }

  const bytes = await getObject({ key, localPath })
  if (!bytes) return false
  res.setHeader('Content-Type', contentType || 'application/octet-stream')
  res.setHeader('Content-Length', bytes.length)
  res.setHeader('Cache-Control', cacheControl)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (download && filename) {
    res.setHeader('Content-Disposition', `attachment; filename="${String(filename).replace(/["\\\r\n]/g, '_')}"`)
  }
  res.send(bytes)
  return true
}

function generatedObjectKey(assessmentId, filename) {
  return `assessments/${assessmentId}/deliverables/${path.basename(filename)}`
}

function sheetObjectKey(assessmentId, filename) {
  return `assessments/${assessmentId}/sheets/${path.basename(filename)}`
}

module.exports = {
  deleteObject,
  generatedObjectKey,
  getObject,
  isR2,
  putObject,
  sendObject,
  sheetObjectKey,
}
