const crypto = require('crypto')
const db = require('../../db')

/**
 * Décide une seule fois si cette création obtient son emplacement Évolution.
 * Le UPDATE conditionnel rend l'opération idempotente, y compris si deux
 * requêtes arrivent presque simultanément.
 */
async function decideEvolutionReward(assessmentId) {
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const current = await client.query(`
      SELECT evolution_slot_unlocked, evolution_reward_decided_at
      FROM assessments
      WHERE id = $1
      FOR UPDATE
    `, [assessmentId])

    if (!current.rows[0]) throw new Error('ASSESSMENT_NOT_FOUND')

    if (current.rows[0].evolution_reward_decided_at) {
      await client.query('COMMIT')
      return {
        newly_decided: false,
        unlocked: current.rows[0].evolution_slot_unlocked === true,
      }
    }

    const unlocked = crypto.randomInt(4) === 0
    await client.query(`
      UPDATE assessments
      SET evolution_reward_decided_at = NOW(),
          evolution_slot_unlocked = $2,
          evolution_slot_unlocked_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
          updated_at = NOW()
      WHERE id = $1
    `, [assessmentId, unlocked])
    await client.query('COMMIT')

    return {
      newly_decided: true,
      unlocked,
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function claimEvolutionReveal(assessmentId) {
  const result = await db.query(`
    UPDATE assessments
    SET evolution_reward_revealed_at = NOW(), updated_at = NOW()
    WHERE id = $1
      AND evolution_slot_unlocked = TRUE
      AND evolution_reward_revealed_at IS NULL
    RETURNING id
  `, [assessmentId])

  return Boolean(result.rows[0])
}

module.exports = { claimEvolutionReveal, decideEvolutionReward }
