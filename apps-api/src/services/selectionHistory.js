const db = require('../../db')

const ANTI_REPEAT_WINDOW = 3

const SELECTION_KINDS = Object.freeze({
  MORPHOLOGY: 'MORPHOLOGY',
  VISUAL_SEED: 'VISUAL_SEED',
  BACKGROUND: 'BACKGROUND',
})

async function getExistingAssessmentSelection(client, { assessmentId, selectionKind }) {
  const result = await client.query(
    `
    SELECT selected_id
    FROM generation_selection_history
    WHERE assessment_id = $1
      AND selection_kind = $2
    ORDER BY id DESC
    LIMIT 1
    `,
    [assessmentId, selectionKind]
  )

  return result.rows[0]?.selected_id ?? null
}

async function getRecentSelectionIds(client, { selectionKind, scopeKey, limit = ANTI_REPEAT_WINDOW }) {
  const result = await client.query(
    `
    SELECT selected_id
    FROM generation_selection_history
    WHERE selection_kind = $1
      AND scope_key = $2
    ORDER BY id DESC
    LIMIT $3
    `,
    [selectionKind, scopeKey, limit]
  )

  return result.rows.map(row => row.selected_id)
}

function buildEligibleIds(candidateIds, recentIds) {
  const uniqueCandidates = [...new Set(candidateIds.filter(Boolean))]
  if (uniqueCandidates.length <= 1) return uniqueCandidates

  let blocked = [...recentIds]
  let eligible = uniqueCandidates.filter(id => !blocked.includes(id))

  // Fallback : si la fenêtre de 3 bloque tout, on réautorise progressivement
  // la ressource la plus ancienne jusqu'à retrouver au moins un candidat.
  while (eligible.length === 0 && blocked.length > 0) {
    blocked = blocked.slice(0, -1)
    eligible = uniqueCandidates.filter(id => !blocked.includes(id))
  }

  return eligible.length > 0 ? eligible : uniqueCandidates
}

async function reserveSelection({
  assessmentId,
  selectionKind,
  scopeKey,
  candidateIds,
  chooseId,
  metadata = {},
}) {
  if (!assessmentId) throw new Error('SELECTION_HISTORY_ASSESSMENT_REQUIRED')
  if (!selectionKind) throw new Error('SELECTION_HISTORY_KIND_REQUIRED')
  if (!scopeKey) throw new Error('SELECTION_HISTORY_SCOPE_REQUIRED')
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    throw new Error('SELECTION_HISTORY_CANDIDATES_REQUIRED')
  }
  if (typeof chooseId !== 'function') throw new Error('SELECTION_HISTORY_CHOOSER_REQUIRED')

  const client = await db.connect()

  try {
    await client.query('BEGIN')

    // Verrou transactionnel par famille + portée. Empêche deux utilisateurs
    // simultanés de lire le même historique puis de réserver la même ressource.
    await client.query(
      `SELECT pg_advisory_xact_lock(hashtext($1))`,
      [`${selectionKind}|${scopeKey}`]
    )

    const existing = await getExistingAssessmentSelection(client, {
      assessmentId,
      selectionKind,
    })

    if (existing) {
      await client.query('COMMIT')
      return {
        selectedId: existing,
        reusedForAssessment: true,
        recentIds: [],
        eligibleIds: candidateIds,
      }
    }

    const recentIds = await getRecentSelectionIds(client, {
      selectionKind,
      scopeKey,
    })

    const eligibleIds = buildEligibleIds(candidateIds, recentIds)
    const selectedId = chooseId(eligibleIds)

    if (!selectedId || !candidateIds.includes(selectedId)) {
      throw new Error('SELECTION_HISTORY_INVALID_SELECTED_ID')
    }

    await client.query(
      `
      INSERT INTO generation_selection_history (
        assessment_id,
        selection_kind,
        scope_key,
        selected_id,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      `,
      [
        assessmentId,
        selectionKind,
        scopeKey,
        selectedId,
        JSON.stringify(metadata ?? {}),
      ]
    )

    await client.query('COMMIT')

    return {
      selectedId,
      reusedForAssessment: false,
      recentIds,
      eligibleIds,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  ANTI_REPEAT_WINDOW,
  SELECTION_KINDS,
  buildEligibleIds,
  reserveSelection,
}
