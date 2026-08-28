const crypto = require('crypto')
const library = require('../data/backgroundLibrary.json')
const { reserveSelection, SELECTION_KINDS } = require('./selectionHistory')

function stableUnit(seed) {
  const hex = crypto.createHash('sha256').update(String(seed)).digest('hex').slice(0, 13)
  return parseInt(hex, 16) / 0x1fffffffffffff
}

function normalizeText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function scoreBackground(bg, dna = {}) {
  let score = 1
  const reasons = []
  const types = [dna.IDENTITY?.type_1, dna.IDENTITY?.type_2].filter(Boolean)
  const affinities = bg.type_affinities ?? []

  for (const type of types) {
    if (affinities.includes(type)) {
      score += type === types[0] ? 7 : 4
      reasons.push(`affinité ${type}`)
    }
  }

  const corpus = normalizeText([
    dna.NARRATIVE?.habitat_tendency,
    dna.NARRATIVE?.signature_behavior,
    dna.IDENTITY?.animal,
    dna.COMBAT?.role,
  ].filter(Boolean).join(' '))

  for (const tag of [...(bg.tags ?? []), ...(bg.families ?? [])]) {
    const needle = normalizeText(tag).replaceAll('_', ' ')
    if (needle.length >= 4 && corpus.includes(needle)) {
      score += 2.5
      reasons.push(`cohérence ${tag}`)
    }
  }

  const p = dna.PERSONALITY ?? {}
  if (Number(p.O) >= 65 && (bg.tags ?? []).some(t => ['mystical','cosmic','crystal','fractured','celestial'].includes(t))) {
    score += 2
    reasons.push('ouverture élevée')
  }
  if (Number(p.N) >= 65 && (bg.tags ?? []).some(t => ['storm','night','shadow','mist','moonlit'].includes(t))) {
    score += 1.5
    reasons.push('intensité émotionnelle')
  }
  if (Number(p.E) >= 65 && (bg.tags ?? []).some(t => ['city','flower','tropical','sunset','starfall'].includes(t))) {
    score += 1.25
    reasons.push('énergie expressive')
  }

  return { score, reasons }
}

function chooseBackground({ assessmentId, dna, allowedIds = null }) {
  let enabled = (library.backgrounds ?? []).filter(item => item.enabled !== false)
  if (Array.isArray(allowedIds)) {
    const allowed = new Set(allowedIds)
    enabled = enabled.filter(item => allowed.has(item.id))
  }

  if (!enabled.length) throw new Error('BACKGROUND_LIBRARY_EMPTY')

  const scored = enabled.map(bg => ({ ...bg, ...scoreBackground(bg, dna) }))
  const maxScore = Math.max(...scored.map(x => x.score))

  // On conserve le tirage pondéré DNA actuel : l'anti-répétition ne change
  // que le pool éligible, jamais les scores de compatibilité.
  const threshold = Math.max(3, maxScore * 0.60)
  let candidates = scored.filter(x => x.score >= threshold)
  if (candidates.length < Math.min(5, scored.length)) {
    candidates = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(12, scored.length))
  }

  const total = candidates.reduce((sum, x) => sum + x.score, 0)
  let target = stableUnit(`${assessmentId}|background-history-v1`) * total
  let selected = candidates[candidates.length - 1]

  for (const candidate of candidates) {
    target -= candidate.score
    if (target <= 0) {
      selected = candidate
      break
    }
  }

  return { selected, candidatePoolSize: candidates.length }
}

function formatBackground(selected, candidatePoolSize, antiRepetition = null) {
  return {
    id: selected.id,
    name_fr: selected.name_fr,
    name_en: selected.name_en,
    file: selected.file,
    asset_path: `assets/backgrounds/${selected.file}`,
    families: selected.families,
    tags: selected.tags,
    type_affinities: selected.type_affinities,
    selection: {
      policy: 'weighted_contextual_with_persistent_anti_repeat_v2',
      weight: Number(selected.score.toFixed(2)),
      reasons: selected.reasons,
      candidate_pool_size: candidatePoolSize,
      anti_repetition: antiRepetition,
    },
    usage_policy: selected.usage_policy,
  }
}

function selectBackground({ assessmentId, dna }) {
  const { selected, candidatePoolSize } = chooseBackground({ assessmentId, dna })
  return formatBackground(selected, candidatePoolSize)
}

async function selectBackgroundWithHistory({ assessmentId, dna }) {
  const enabled = (library.backgrounds ?? []).filter(item => item.enabled !== false)
  if (!enabled.length) throw new Error('BACKGROUND_LIBRARY_EMPTY')

  const reservation = await reserveSelection({
    assessmentId,
    selectionKind: SELECTION_KINDS.BACKGROUND,
    scopeKey: 'GLOBAL',
    candidateIds: enabled.map(item => item.id),
    metadata: {
      anti_repeat_window: 3,
      animal: dna.IDENTITY?.animal ?? null,
      types: [dna.IDENTITY?.type_1, dna.IDENTITY?.type_2].filter(Boolean),
    },
    chooseId: (eligibleIds) => {
      return chooseBackground({ assessmentId, dna, allowedIds: eligibleIds }).selected.id
    },
  })

  const { selected, candidatePoolSize } = chooseBackground({
    assessmentId,
    dna,
    allowedIds: [reservation.selectedId],
  })

  return formatBackground(selected, candidatePoolSize, {
    window: 3,
    scope: 'global',
    recent_excluded: reservation.recentIds,
    eligible_count: reservation.eligibleIds.length,
    reused_for_same_assessment: reservation.reusedForAssessment,
  })
}

module.exports = {
  selectBackground,
  selectBackgroundWithHistory,
  scoreBackground,
}
