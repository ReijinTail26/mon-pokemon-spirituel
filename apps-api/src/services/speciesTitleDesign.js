const speciesTitleRules =
  require('../data/speciesTitleRules.json')

const rulesByAnimal =
  new Map()

for (const rule of speciesTitleRules) {
  for (const animal of rule.animals ?? []) {
    if (!rulesByAnimal.has(animal)) {
      rulesByAnimal.set(animal, [])
    }

    rulesByAnimal.get(animal).push(rule)
  }
}

function normalizeSeed(seed) {
  const value = Number(seed)

  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.abs(
    Math.trunc(value)
  ) >>> 0
}

function hashText(value) {
  let hash = 2166136261

  for (const char of String(value ?? '')) {
    hash ^= char.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function deterministicUnit({
  seed,
  animal,
}) {
  let state =
    normalizeSeed(seed) ^
    hashText(animal)

  state += 0x6D2B79F5
  state = Math.imul(
    state ^ (state >>> 15),
    state | 1
  )
  state ^=
    state +
    Math.imul(
      state ^ (state >>> 7),
      state | 61
    )

  return (
    (state ^ (state >>> 14)) >>> 0
  ) / 4294967296
}

function weightFor(rule) {
  const priority =
    Math.max(
      1,
      Math.min(
        3,
        Number(rule.priority) || 1
      )
    )

  if (priority === 3) {
    return 8
  }

  if (priority === 2) {
    return 3
  }

  return 1
}

function selectSpeciesTitle({
  animal,
  seed,
}) {
  const candidates =
    rulesByAnimal.get(animal) ?? []

  if (candidates.length === 0) {
    return {
      label:
        `Pokémon ${animal}`,
      title:
        animal,
      source_term:
        animal,
    }
  }

  const weighted =
    candidates.map(
      (rule) => ({
        rule,
        weight:
          weightFor(rule),
      })
    )

  const totalWeight =
    weighted.reduce(
      (sum, item) =>
        sum + item.weight,
      0
    )

  let cursor =
    deterministicUnit({
      seed,
      animal,
    }) * totalWeight

  let selected =
    weighted[weighted.length - 1]
      .rule

  for (const item of weighted) {
    cursor -= item.weight

    if (cursor < 0) {
      selected = item.rule
      break
    }
  }

  return {
    label:
      `Pokémon ${selected.title}`,
    title:
      selected.title,
    source_term:
      selected.source_term,
  }
}

module.exports = {
  selectSpeciesTitle,
}
