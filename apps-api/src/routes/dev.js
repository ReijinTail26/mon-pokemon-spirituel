const express = require('express')
const crypto = require('crypto')

const db = require('../../db')
const animals = require('../data/animals.json')
const types = require('../data/types.json')
const { startGeneration } = require('../services/generationOrchestrator')

const router = express.Router()

function devEnabled() {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_TOOLS === 'true'
}

router.use((req, res, next) => {
  if (!devEnabled()) {
    return res.status(404).json({
      error: {
        code: 'DEV_TOOLS_DISABLED',
        message: 'Les outils DEV sont désactivés.',
      },
    })
  }
  next()
})

router.get('/options', (req, res) => {
  res.json({
    animals: animals.map((animal) => animal.name),
    types: types.map((type) => type.name),
  })
})

router.post('/generate', async (req, res) => {
  const { animal, type_1, type_2 } = req.body ?? {}
  const animalProfile = animals.find((item) => item.name === animal)
  const typeNames = new Set(types.map((item) => item.name))

  if (!animalProfile) {
    return res.status(400).json({
      error: {
        code: 'INVALID_DEV_ANIMAL',
        message: 'Animal DEV inconnu.',
      },
    })
  }

  const primaryType = type_1 || 'Normal'
  const secondaryType = type_2 || null

  if (!typeNames.has(primaryType) || (secondaryType && !typeNames.has(secondaryType))) {
    return res.status(400).json({
      error: {
        code: 'INVALID_DEV_TYPE',
        message: 'Type DEV inconnu.',
      },
    })
  }

  if (secondaryType && secondaryType === primaryType) {
    return res.status(400).json({
      error: {
        code: 'DUPLICATE_DEV_TYPE',
        message: 'Le type secondaire doit être différent du type principal.',
      },
    })
  }

  const client = await db.connect()
  const assessmentId = crypto.randomUUID()
  const resultId = crypto.randomUUID()

  try {
    await client.query('BEGIN')

    await client.query(
      `
      INSERT INTO assessments (
        id,
        questionnaire_version,
        status,
        current_question_index,
        user_id
      )
      VALUES ($1, $2, 'COMPLETED', 0, $3)
      `,
      [assessmentId, 'DEV_FORCED_PROFILE_V1', req.user?.id ?? null]
    )

    const big5 = animalProfile.big5 ?? {}

    await client.query(
      `
      INSERT INTO assessment_results (
        id,
        assessment_id,
        scoring_version,
        o, c, e, a, n,
        r, l, p, h, i, m
      )
      VALUES (
        $1, $2, $3,
        $4, $5, $6, $7, $8,
        50, 50, 50, 50, 50, 50
      )
      `,
      [
        resultId,
        assessmentId,
        'DEV_FORCED_PROFILE_V1',
        Number(big5.O ?? 50),
        Number(big5.C ?? 50),
        Number(big5.E ?? 50),
        Number(big5.A ?? 50),
        Number(big5.N ?? 50),
      ]
    )

    await client.query(
      `
      INSERT INTO assessment_classifications (
        id,
        assessment_result_id,
        animal_name,
        animal_bucket,
        type_1_name,
        type_2_name,
        animal_engine_version,
        type_engine_version,
        debug_snapshot
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        crypto.randomUUID(),
        resultId,
        animalProfile.name,
        animalProfile.bucket,
        primaryType,
        secondaryType,
        'DEV_FORCED_ANIMAL_V1',
        'DEV_FORCED_TYPE_V1',
        JSON.stringify({
          dev_mode: true,
          animal_forced: animalProfile.name,
          types_forced: [primaryType, secondaryType].filter(Boolean),
          big5_source: 'animal_reference_profile',
          hidden_axes_policy: 'neutral_50',
        }),
      ]
    )

    await client.query('COMMIT')

    const generation = await startGeneration(assessmentId)

    return res.status(201).json({
      assessment_id: assessmentId,
      result_id: resultId,
      classification: {
        animal: { name: animalProfile.name },
        types: [primaryType, secondaryType].filter(Boolean),
      },
      generation,
      dev: true,
    })
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {}
    console.error('DEV generation error:', error)
    return res.status(500).json({
      error: {
        code: 'DEV_GENERATION_FAILED',
        message: 'Impossible de créer le profil DEV.',
      },
    })
  } finally {
    client.release()
  }
})

module.exports = router
