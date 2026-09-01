const assert = require('assert')
const catalog = require('../src/data/pokemonAffinityCatalog.json')
const {
  calculatePokemonAffinities,
  validatePokemonAffinityCatalog,
} = require('../src/services/pokemonAffinity')

const validation = validatePokemonAffinityCatalog(catalog)
assert.strictEqual(validation.valid, true)
assert.strictEqual(validation.count, 300)
assert.strictEqual(new Set(catalog.pokemon.map((pokemon) => pokemon.dex_id)).size, 300)

const profile = {
  O: 80, C: 72, E: 45, A: 78, N: 35,
  R: 58, L: 62, P: 40, H: 85, I: 42, M: 88,
}

const first = calculatePokemonAffinities({
  scores: profile,
  types: ['Psy', 'Fée'],
  animalBucket: 'mythical',
})
const second = calculatePokemonAffinities({
  scores: profile,
  types: ['Psy', 'Fée'],
  animalBucket: 'mythical',
})

assert.strictEqual(first.length, 3)
assert.deepStrictEqual(first, second)
assert.strictEqual(new Set(first.map((pokemon) => pokemon.dex_id)).size, 3)
assert.deepStrictEqual(first.map((pokemon) => pokemon.position), [1, 2, 3])
assert.ok(first.every((pokemon) => pokemon.affinity_percentage >= 0 && pokemon.affinity_percentage <= 100))
assert.ok(first[0].affinity_percentage >= first[1].affinity_percentage)
assert.ok(first[1].affinity_percentage >= first[2].affinity_percentage)

console.log('pokemonAffinity.test.js: OK')
