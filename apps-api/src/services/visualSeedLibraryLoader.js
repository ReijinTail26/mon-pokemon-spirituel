const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const baseLibrary = require('../data/visualSeedLibrary.json')

const PROJECT_ROOT = path.join(__dirname, '../..')
const ACCEPTED_EXTENSIONS = new Set(['.jpg', '.jpeg'])

function slug(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'seed'
}

function cloneLibrary(library) {
  return JSON.parse(JSON.stringify(library))
}

function listJpegFiles(folderPath) {
  try {
    return fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(entry => entry.isFile() && ACCEPTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map(entry => entry.name)
      .sort((left, right) => left.localeCompare(right, 'fr', { numeric: true }))
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

function buildVisualSeedLibrary({ library = baseLibrary, projectRoot = PROJECT_ROOT } = {}) {
  const merged = cloneLibrary(library)
  let autoDiscoveredCount = 0

  for (const animalEntry of merged.animals ?? []) {
    animalEntry.models = Array.isArray(animalEntry.models) ? animalEntry.models : []
    const indexedFiles = new Set(animalEntry.models.map(model => String(model.file).toLowerCase()))
    const folderPath = path.resolve(projectRoot, animalEntry.folder)

    for (const file of listJpegFiles(folderPath)) {
      if (indexedFiles.has(file.toLowerCase())) continue

      const fingerprint = crypto.createHash('sha256').update(`${animalEntry.animal}|${file}`).digest('hex').slice(0, 8)
      animalEntry.models.push({
        id: `auto-${slug(animalEntry.animal)}-${slug(path.parse(file).name)}-${fingerprint}`,
        file,
        enabled: true,
        width: null,
        height: null,
        source: 'auto_discovered_visual_seed',
        original_name: file,
      })
      indexedFiles.add(file.toLowerCase())
      autoDiscoveredCount += 1
    }
  }

  return { library: merged, autoDiscoveredCount }
}

const loaded = buildVisualSeedLibrary()
if (loaded.autoDiscoveredCount > 0) {
  console.log(`${loaded.autoDiscoveredCount} nouvelle(s) seed(s) visuelle(s) détectée(s) automatiquement.`)
}

function getVisualSeedLibrary() {
  return loaded.library
}

module.exports = {
  ACCEPTED_EXTENSIONS,
  buildVisualSeedLibrary,
  getVisualSeedLibrary,
}
