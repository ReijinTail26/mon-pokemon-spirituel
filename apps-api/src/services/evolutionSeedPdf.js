const fs = require('fs/promises')
const path = require('path')

function readJpegInfo(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('EVOLUTION_SEED_MUST_BE_JPEG')
  }

  let offset = 2
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = bytes[offset + 1]
    offset += 2
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) continue
    if (marker >= 0xd0 && marker <= 0xd7) continue
    if (offset + 2 > bytes.length) break

    const length = bytes.readUInt16BE(offset)
    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)
    if (isStartOfFrame) {
      if (length < 8 || offset + length > bytes.length) break
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
        components: bytes[offset + 7],
      }
    }

    if (length < 2) break
    offset += length
  }

  throw new Error('EVOLUTION_SEED_JPEG_DIMENSIONS_NOT_FOUND')
}

function buildJpegPdf(jpegBytes) {
  const { width, height, components } = readJpegInfo(jpegBytes)
  const colorSpace = components === 1 ? '/DeviceGray' : components === 4 ? '/DeviceCMYK' : '/DeviceRGB'
  const content = Buffer.from(`q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`, 'ascii')
  const chunks = []
  const offsets = [0]
  let position = 0

  const append = (value) => {
    const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value, 'binary')
    chunks.push(chunk)
    position += chunk.length
  }
  const object = (number, ...parts) => {
    offsets[number] = position
    append(`${number} 0 obj\n`)
    for (const part of parts) append(part)
    append('\nendobj\n')
  }

  append('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
  object(4,
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace ${colorSpace} /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
    jpegBytes,
    '\nendstream'
  )
  object(5, `<< /Length ${content.length} >>\nstream\n`, content, 'endstream')

  const xrefPosition = position
  append('xref\n0 6\n')
  append('0000000000 65535 f \n')
  for (let index = 1; index <= 5; index += 1) {
    append(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`)
  }
  append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF\n`)

  return { bytes: Buffer.concat(chunks), width, height }
}

function resolveVisualSeedPath(creativePackage) {
  const model = creativePackage?.visual_seed?.model
  if (!model?.folder || !model?.file) throw new Error('EVOLUTION_SEED_IMAGE_NOT_SELECTED')

  const extension = path.extname(model.file).toLowerCase()
  if (extension !== '.jpg' && extension !== '.jpeg') throw new Error('EVOLUTION_SEED_MUST_BE_JPEG')

  const relativeFolder = String(model.folder).replace(/^assets[\\/]/, '')
  return path.join(__dirname, '../../assets', relativeFolder, path.basename(model.file))
}

async function createEvolutionSeedPdf({ assessmentId, creativePackage }) {
  const sourcePath = resolveVisualSeedPath(creativePackage)
  const jpegBytes = await fs.readFile(sourcePath)
  const pdf = buildJpegPdf(jpegBytes)
  const filename = 'seed-evolutif.pdf'
  return {
    filename,
    file_reference: `/generated-dossiers/${assessmentId}/${filename}`,
    bytes: pdf.bytes,
    source_width: pdf.width,
    source_height: pdf.height,
    embedded_without_recompression: true,
  }
}

module.exports = { buildJpegPdf, createEvolutionSeedPdf, readJpegInfo }
