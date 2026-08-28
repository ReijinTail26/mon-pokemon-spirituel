const assert = require('assert')
const { requireTrustedOrigin } = require('../src/middleware/requireTrustedOrigin')

function run({ method, origin }) {
  let nextCalled = false
  let statusCode = null
  let payload = null
  const req = { method, get: name => name.toLowerCase() === 'origin' ? origin : undefined }
  const res = {
    status(code) { statusCode = code; return this },
    json(value) { payload = value; return this },
  }
  requireTrustedOrigin(req, res, () => { nextCalled = true })
  return { nextCalled, statusCode, payload }
}

const previousOrigin = process.env.WEB_ORIGIN
process.env.WEB_ORIGIN = 'https://mon-pokemon-spirituel.netlify.app'

assert.strictEqual(run({ method: 'GET' }).nextCalled, true)
assert.strictEqual(run({ method: 'POST', origin: 'https://mon-pokemon-spirituel.netlify.app' }).nextCalled, true)
assert.strictEqual(run({ method: 'POST', origin: 'https://site-malveillant.example' }).statusCode, 403)
assert.strictEqual(run({ method: 'DELETE' }).payload.error.code, 'UNTRUSTED_ORIGIN')

if (previousOrigin === undefined) delete process.env.WEB_ORIGIN
else process.env.WEB_ORIGIN = previousOrigin

console.log('securityMiddleware.test.js OK')
