const assert = require('assert')
const library = require('../src/data/visualSeedLibrary.json')
const { selectVisualSeed } = require('../src/services/visualSeedSelection')

assert.strictEqual(library.animals.length, 50, 'La bibliothèque doit couvrir les 50 animaux.')

const totalModels = library.animals.reduce((sum, entry) => sum + (entry.models ?? []).length, 0)
assert.strictEqual(totalModels, 856, 'Les 856 références fournies doivent être indexées.')

for (const entry of library.animals) {
  assert.ok((entry.models ?? []).length >= 2, `${entry.animal} doit avoir au moins 2 références.`)
  const first = selectVisualSeed({ assessmentId: 'test-assessment', animal: entry.animal })
  const second = selectVisualSeed({ assessmentId: 'test-assessment', animal: entry.animal })
  assert.strictEqual(first.status, 'SELECTED')
  assert.strictEqual(first.model.id, second.model.id, 'Le tirage doit rester déterministe pour un assessment donné.')
  assert.ok(first.model.asset_relative_path)
  assert.strictEqual(first.policy.mandatory_reference_for_final_ai, true)
}

console.log('visualSeedSelection.test.js OK')
