const fs = require('fs')
const path = require('path')

const ASSETS_ROOT = path.join(__dirname, '../../assets')
const PREVIEW_ROOT = path.join(ASSETS_ROOT, 'pdf-previews')

function previewPathFor(originalPath) {
  const relativePath = path.relative(ASSETS_ROOT, originalPath)
  if (relativePath.startsWith('..')) return originalPath

  const parsed = path.parse(relativePath)
  const previewPath = path.join(PREVIEW_ROOT, parsed.dir, `${parsed.name}.jpg`)
  return fs.existsSync(previewPath) ? previewPath : originalPath
}

function imageMime(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  return 'image/jpeg'
}

module.exports = {
  ASSETS_ROOT,
  previewPathFor,
  imageMime,
}
