const catalog = require('../data/officialCatalog.json')

const REQUIRED_TYPES = [
  'Normal',
  'Feu',
  'Eau',
  'Électrik',
  'Plante',
  'Glace',
  'Combat',
  'Poison',
  'Sol',
  'Vol',
  'Psy',
  'Insecte',
  'Roche',
  'Spectre',
  'Dragon',
  'Ténèbres',
  'Acier',
  'Fée',
]

const VALID_CATEGORIES =
  new Set([
    'Physique',
    'Spéciale',
    'Statut',
  ])

function validateOfficialCatalog(
  value = catalog
) {
  const errors = []
  const abilities =
    Array.isArray(value?.abilities)
      ? value.abilities
      : []
  const moves =
    Array.isArray(value?.moves)
      ? value.moves
      : []

  const eligibleAbilities =
    abilities.filter(
      (ability) =>
        ability?.eligible_v1 !== false
    )

  const eligibleMoves =
    moves.filter(
      (move) =>
        move?.eligible_v1 !== false
    )

  if (
    value?.temporal_policy !==
    'CURRENT_REFERENCE_STATE_TREATED_AS_TIMELESS'
  ) {
    errors.push(
      'TEMPORAL_POLICY_INVALID'
    )
  }

  if (
    eligibleAbilities.length === 0
  ) {
    errors.push(
      'NO_ELIGIBLE_ABILITY'
    )
  }

  for (
    const ability of
    eligibleAbilities
  ) {
    if (!ability.name) {
      errors.push(
        'ABILITY_NAME_REQUIRED'
      )
    }

    if (
      ability.official !== true
    ) {
      errors.push(
        `ABILITY_NOT_OFFICIAL:${ability.name ?? 'unknown'}`
      )
    }

    if (!ability.effect) {
      errors.push(
        `ABILITY_EFFECT_REQUIRED:${ability.name ?? 'unknown'}`
      )
    }
  }

  const coveredTypes =
    new Set()

  for (
    const move of
    eligibleMoves
  ) {
    if (!move.name) {
      errors.push(
        'MOVE_NAME_REQUIRED'
      )
    }

    if (
      move.official !== true
    ) {
      errors.push(
        `MOVE_NOT_OFFICIAL:${move.name ?? 'unknown'}`
      )
    }

    if (!REQUIRED_TYPES.includes(move.type)) {
      errors.push(
        `MOVE_TYPE_INVALID:${move.name ?? 'unknown'}`
      )
    } else {
      coveredTypes.add(
        move.type
      )
    }

    if (
      !VALID_CATEGORIES.has(
        move.category
      )
    ) {
      errors.push(
        `MOVE_CATEGORY_INVALID:${move.name ?? 'unknown'}`
      )
    }

    if (!move.effect) {
      errors.push(
        `MOVE_EFFECT_REQUIRED:${move.name ?? 'unknown'}`
      )
    }
  }

  for (
    const typeName of
    REQUIRED_TYPES
  ) {
    if (
      !coveredTypes.has(
        typeName
      )
    ) {
      errors.push(
        `TYPE_MOVE_COVERAGE_MISSING:${typeName}`
      )
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
    summary: {
      abilities:
        abilities.length,
      eligible_abilities:
        eligibleAbilities.length,
      moves:
        moves.length,
      eligible_moves:
        eligibleMoves.length,
      covered_types:
        coveredTypes.size,
    },
  }
}

const validation =
  validateOfficialCatalog(
    catalog
  )

if (!validation.valid) {
  throw new Error(
    `OFFICIAL_CATALOG_INVALID: ${validation.errors.join(', ')}`
  )
}

module.exports = {
  catalog,
  REQUIRED_TYPES,
  validateOfficialCatalog,
}
