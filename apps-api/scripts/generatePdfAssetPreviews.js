const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const API_ROOT = path.join(__dirname, '..')
const ASSETS_ROOT = path.join(API_ROOT, 'assets')
const PREVIEW_ROOT = path.join(ASSETS_ROOT, 'pdf-previews')
const EVOLUTION_JPEG_ROOT = path.join(ASSETS_ROOT, 'evolution-jpeg')
const ACCEPTED = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function findImageMagick() {
  for (const command of ['magick', 'convert']) {
    const probe = spawnSync(command, ['-version'], { stdio: 'ignore' })
    if (probe.status === 0) return command
  }
  throw new Error('IMAGE_MAGICK_NOT_AVAILABLE')
}

function walk(folderPath) {
  if (!fs.existsSync(folderPath)) return []
  const files = []
  for (const entry of fs.readdirSync(folderPath, { withFileTypes: true })) {
    const entryPath = path.join(folderPath, entry.name)
    if (entry.isDirectory()) files.push(...walk(entryPath))
    else if (entry.isFile() && ACCEPTED.has(path.extname(entry.name).toLowerCase())) files.push(entryPath)
  }
  return files
}

function convertedPath(root, sourcePath, sourceRoot) {
  const relative = path.relative(sourceRoot, sourcePath)
  const parsed = path.parse(relative)
  return path.join(root, parsed.dir, `${parsed.name}.jpg`)
}

function convert(command, sourcePath, targetPath, args) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  const result = spawnSync(command, [sourcePath, ...args, targetPath], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`IMAGE_PREVIEW_FAILED: ${sourcePath}: ${(result.stderr || result.stdout || '').slice(0, 500)}`)
  }
}

function main() {
  fs.mkdirSync(PREVIEW_ROOT, { recursive: true })
  fs.mkdirSync(EVOLUTION_JPEG_ROOT, { recursive: true })

  const sources = [
    path.join(ASSETS_ROOT, 'backgrounds'),
    path.join(ASSETS_ROOT, 'visual-seeds'),
  ]
  const files = sources.flatMap(walk)
  if (files.length === 0) {
    console.log('Aucun asset lourd prÃ©sent : gÃ©nÃ©ration des previews ignorÃ©e.')
    return
  }

  const command = findImageMagick()
  let previewCount = 0
  let evolutionJpegCount = 0
  const failures = []

  for (const sourcePath of files) {
    const previewPath = convertedPath(PREVIEW_ROOT, sourcePath, ASSETS_ROOT)
    try {
      convert(command, sourcePath, previewPath, [
        '-auto-orient',
        '-thumbnail', '1600x1600>',
        '-background', 'white',
        '-alpha', 'remove',
        '-alpha', 'off',
        '-strip',
        '-interlace', 'Plane',
        '-sampling-factor', '4:2:0',
        '-quality', '78',
      ])
      previewCount += 1
    } catch (error) {
      failures.push({ sourcePath, operation: 'preview', error })
      console.warn(`[asset-preview] Fichier ignorÃ© (${sourcePath}): ${error.message}`)
      continue
    }

    const isVisualSeed = sourcePath.startsWith(path.join(ASSETS_ROOT, 'visual-seeds') + path.sep)
    const isPng = path.extname(sourcePath).toLowerCase() === '.png'
    if (isVisualSeed && isPng) {
      const targetPath = convertedPath(
        path.join(EVOLUTION_JPEG_ROOT, 'visual-seeds'),
        sourcePath,
        path.join(ASSETS_ROOT, 'visual-seeds')
      )
      try {
        convert(command, sourcePath, targetPath, [
          '-auto-orient',
          '-background', 'white',
          '-alpha', 'remove',
          '-alpha', 'off',
          '-sampling-factor', '4:4:4',
          '-quality', '95',
        ])
        evolutionJpegCount += 1
      } catch (error) {
        failures.push({ sourcePath, operation: 'evolution-jpeg', error })
        console.warn(`[asset-preview] JPEG Ã©volutif ignorÃ© (${sourcePath}): ${error.message}`)
      }
    }
  }

  console.log(`${previewCount} preview(s) PDF gÃ©nÃ©rÃ©e(s), ${evolutionJpegCount} seed(s) PNG prÃ©parÃ©e(s) en JPEG pleine rÃ©solution.`)
  if (failures.length > 0) {
    console.warn(`[asset-preview] ${failures.length} conversion(s) ignorÃ©e(s). Consultez les avertissements prÃ©cÃ©dents.`)
  }
}

main()