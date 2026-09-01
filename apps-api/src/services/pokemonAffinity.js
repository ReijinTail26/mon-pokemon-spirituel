const catalog = require('../data/pokemonAffinityCatalog.json')

const BIG_FIVE = ['O', 'C', 'E', 'A', 'N']
const TEMPERAMENT = ['R', 'L', 'P', 'H', 'I', 'M']

function clamp(value) {
  return Math.max(0, Math.min(100, value))
}

function normalizedScore(value) {
  const score = Number(value)
  return Number.isFinite(score) ? clamp(score) : 50
}

function profileSimilarity(scores, profile, dimensions) {
  const distance = dimensions.reduce(
    (sum, dimension) => sum + Math.abs(normalizedScore(scores?.[dimension]) - normalizedScore(profile?.[dimension])),
    0
  ) / dimensions.length
  return 100 - distance
}

function typeSimilarity(userTypes, pokemonTypes) {
  const expected = [...new Set((userTypes ?? []).filter(Boolean))]
  const candidate = [...new Set((pokemonTypes ?? []).filter(Boolean))]
  if (expected.length === 0 || candidate.length === 0) return 50

  const overlap = expected.filter((type) => candidate.includes(type)).length
  if (overlap >= 2) return 100
  if (overlap === 1) {
    return expected[0] === candidate[0] ? 100 : 85
  }
  return 0
}

function bucketSimilarity(userBucket, pokemonBucket) {
  if (!userBucket) return 50
  return userBucket === pokemonBucket ? 100 : 0
}

function calculatePokemonAffinities({
  scores,
  types = [],
  animalBucket = null,
  limit = 3,
}) {
  const safeLimit = Math.max(1, Math.min(10, Number(limit) || 3))

  return catalog.pokemon
    .map((pokemon) => {
      const bigFive = profileSimilarity(scores, pokemon.profile, BIG_FIVE)
      const temperament = profileSimilarity(scores, pokemon.profile, TEMPERAMENT)
      const elementalTypes = typeSimilarity(types, pokemon.types)
      const animalFamily = bucketSimilarity(animalBucket, pokemon.animal_bucket)
      const affinity =
        0.45 * bigFive +
        0.30 * temperament +
        0.20 * elementalTypes +
        0.05 * animalFamily

      return {
        dex_id: pokemon.dex_id,
        name: pokemon.name,
        types: pokemon.types,
        affinity_percentage: Number(affinity.toFixed(1)),
        popularity_rank: pokemon.rank,
      }
    })
    .sort((left, right) =>
      right.affinity_percentage - left.affinity_percentage ||
      left.popularity_rank - right.popularity_rank ||
      left.dex_id - right.dex_id
    )
    .slice(0, safeLimit)
    .map((pokemon, index) => ({
      position: index + 1,
      ...pokemon,
    }))
}

function validatePokemonAffinityCatalog(value = catalog) {
  const errors = []
  if (value?.version !== 'pokemon-affinity-v1') errors.push('VERSION_INVALID')
  if (!Array.isArray(value?.pokemon) || value.pokemon.length !== 300) errors.push('CATALOG_SIZE_INVALID')

  const dexIds = new Set()
  const ranks = new Set()
  for (const pokemon of value?.pokemon ?? []) {
    if (!pokemon?.name) errors.push('NAME_REQUIRED')
    if (dexIds.has(pokemon.dex_id)) errors.push(`DUPLICATE_DEX_ID:${pokemon.dex_id}`)
    if (ranks.has(pokemon.rank)) errors.push(`DUPLICATE_RANK:${pokemon.rank}`)
    dexIds.add(pokemon.dex_id)
    ranks.add(pokemon.rank)
    if (!Array.isArray(pokemon.types) || pokemon.types.length < 1 || pokemon.types.length > 2) {
      errors.push(`TYPES_INVALID:${pokemon.name}`)
    }
    for (const dimension of [...BIG_FIVE, ...TEMPERAMENT]) {
      const score = pokemon.profile?.[dimension]
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        errors.push(`PROFILE_INVALID:${pokemon.name}:${dimension}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    count: value?.pokemon?.length ?? 0,
  }
}

const validation = validatePokemonAffinityCatalog()
if (!validation.valid) {
  throw new Error(`POKEMON_AFFINITY_CATALOG_INVALID:${validation.errors.join(',')}`)
}

module.exports = {
  calculatePokemonAffinities,
  validatePokemonAffinityCatalog,
}
