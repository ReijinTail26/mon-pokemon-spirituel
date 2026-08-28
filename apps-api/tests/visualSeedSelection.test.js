const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { buildVisualSeedLibrary, getVisualSeedLibrary } = require('../src/services/visualSeedLibraryLoader')
const { selectVisualSeed } = require('../src/services/visualSeedSelection')

const library = getVisualSeedLibrary()

assert.strictEqual(library.animals.length, 50, 'La bibliothèque doit couvrir les 50 animaux.')

const totalModels = library.animals.reduce((sum, entry) => sum + (entry.models ?? []).length, 0)
assert.ok(totalModels >= 856, 'Les 856 références initiales et les ajouts automatiques doivent être indexés.')

for (const entry of library.animals) {
  assert.ok((entry.models ?? []).length >= 2, `${entry.animal} doit avoir au moins 2 références.`)
  const first = selectVisualSeed({ assessmentId: 'test-assessment', animal: entry.animal })
  const second = selectVisualSeed({ assessmentId: 'test-assessment', animal: entry.animal })
  assert.strictEqual(first.status, 'SELECTED')
  assert.strictEqual(first.model.id, second.model.id, 'Le tirage doit rester déterministe pour un assessment donné.')
  assert.ok(first.model.asset_relative_path)
  assert.strictEqual(first.policy.mandatory_reference_for_final_ai, true)
}

const temporaryRoot = fs.mkdtempSync(path.join(__dirname, '.visual-seeds-'))
try {
  const relativeFolder = 'assets/visual-seeds/loup-test'
  const seedFolder = path.join(temporaryRoot, relativeFolder)
  fs.mkdirSync(seedFolder, { recursive: true })
  fs.writeFileSync(path.join(seedFolder, 'seed-ajoutee.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]))
  fs.writeFileSync(path.join(seedFolder, 'fichier-ignore.png'), Buffer.from('png'))

  const discovered = buildVisualSeedLibrary({
    projectRoot: temporaryRoot,
    library: { animals: [{ animal: 'Loup test', folder: relativeFolder, models: [] }] },
  })
  assert.strictEqual(discovered.autoDiscoveredCount, 1)
  assert.strictEqual(discovered.library.animals[0].models[0].file, 'seed-ajoutee.jpg')
  assert.strictEqual(discovered.library.animals[0].models[0].source, 'auto_discovered_visual_seed')
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true })
}

console.log('visualSeedSelection.test.js OK')
