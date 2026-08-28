const express = require('express')
const crypto = require('crypto')

const db = require('../../db')
const questionnaire = require('../data/questionnaire.public')

const {
  calculateScores,
} = require('../services/scoring')

const {
  classifyProfile,
} = require('../services/classification')

const {
  startGeneration,
  getGenerationState,
} = require('../services/generationOrchestrator')

const { requireAuth } = require('../middleware/requireAuth')
const { claimEvolutionReveal, decideEvolutionReward } = require('../services/evolutionReward')

const router = express.Router()
router.use(requireAuth)

router.param('assessmentId', async (req, res, next, assessmentId) => {
  try {
    const result = await db.query('SELECT id, user_id FROM assessments WHERE id = $1 LIMIT 1', [assessmentId])
    const row = result.rows[0]
    if (!row || String(row.user_id ?? '') !== String(req.user.id)) {
      return res.status(404).json({ error: { code: 'ASSESSMENT_NOT_FOUND', message: 'Questionnaire introuvable.' } })
    }
    req.ownedAssessment = row
    next()
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res) => {
  try {
    const assessmentId = crypto.randomUUID()

    const result = await db.query(
      `
      INSERT INTO assessments (
        id,
        questionnaire_version,
        status,
        current_question_index,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        assessmentId,
        questionnaire.version,
        'IN_PROGRESS',
        0,
        req.user.id,
      ]
    )

    const assessment = result.rows[0]

    res.status(201).json({
      assessment_id: assessment.id,
      questionnaire_version:
        assessment.questionnaire_version,
      status: assessment.status,
      current_question_index:
        assessment.current_question_index,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message:
          'Impossible de créer le questionnaire.',
      },
    })
  }
})

router.get('/:assessmentId', async (req, res) => {
  try {
    const assessmentResult = await db.query(
      `
      SELECT *
      FROM assessments
      WHERE id = $1
      `,
      [req.params.assessmentId]
    )

    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'ASSESSMENT_NOT_FOUND',
          message: 'Questionnaire introuvable.',
        },
      })
    }

    const assessment = assessmentResult.rows[0]

    const answersResult = await db.query(
      `
      SELECT question_id, value
      FROM assessment_answers
      WHERE assessment_id = $1
      ORDER BY question_id
      `,
      [assessment.id]
    )

    const answers = {}

    for (const row of answersResult.rows) {
      answers[row.question_id] = row.value
    }

    res.json({
      assessment_id: assessment.id,
      questionnaire_version:
        assessment.questionnaire_version,
      status: assessment.status,
      current_question_index:
        assessment.current_question_index,
      answers,
      answered_count: answersResult.rows.length,
      updated_at: assessment.updated_at,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message:
          'Erreur de lecture du questionnaire.',
      },
    })
  }
})

router.put(
  '/:assessmentId/answers',
  async (req, res) => {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      const assessmentResult =
        await client.query(
          `
          SELECT *
          FROM assessments
          WHERE id = $1
          FOR UPDATE
          `,
          [req.params.assessmentId]
        )

      if (
        assessmentResult.rows.length === 0
      ) {
        await client.query('ROLLBACK')

        return res.status(404).json({
          error: {
            code:
              'ASSESSMENT_NOT_FOUND',
            message:
              'Questionnaire introuvable.',
          },
        })
      }

      const assessment =
        assessmentResult.rows[0]

      if (
        assessment.status !==
        'IN_PROGRESS'
      ) {
        await client.query('ROLLBACK')

        return res.status(409).json({
          error: {
            code:
              'ASSESSMENT_NOT_EDITABLE',
            message:
              'Ce questionnaire ne peut plus être modifié.',
          },
        })
      }

      const {
        answers,
        current_question_index,
      } = req.body

      if (!Array.isArray(answers)) {
        await client.query('ROLLBACK')

        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message:
              'Le champ answers doit être une liste.',
          },
        })
      }

      for (const answer of answers) {
        const questionExists =
          questionnaire.questions.some(
            (question) =>
              question.id ===
              answer.question_id
          )

        if (!questionExists) {
          await client.query(
            'ROLLBACK'
          )

          return res.status(400).json({
            error: {
              code:
                'INVALID_QUESTION',
              message:
                `Question inconnue : ${answer.question_id}`,
            },
          })
        }

        if (
          !Number.isInteger(
            answer.value
          ) ||
          answer.value < 1 ||
          answer.value > 5
        ) {
          await client.query(
            'ROLLBACK'
          )

          return res.status(400).json({
            error: {
              code:
                'INVALID_ANSWER',
              message:
                'Chaque réponse doit être un entier entre 1 et 5.',
            },
          })
        }

        await client.query(
          `
          INSERT INTO assessment_answers (
            assessment_id,
            question_id,
            value
          )
          VALUES ($1, $2, $3)

          ON CONFLICT (
            assessment_id,
            question_id
          )
          DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW()
          `,
          [
            assessment.id,
            answer.question_id,
            answer.value,
          ]
        )
      }

      let savedQuestionIndex =
        assessment.current_question_index

      if (
        Number.isInteger(
          current_question_index
        ) &&
        current_question_index >= 0 &&
        current_question_index <
          questionnaire.questions.length
      ) {
        savedQuestionIndex =
          current_question_index

        await client.query(
          `
          UPDATE assessments
          SET
            current_question_index = $1,
            updated_at = NOW()
          WHERE id = $2
          `,
          [
            savedQuestionIndex,
            assessment.id,
          ]
        )
      }

      const countResult =
        await client.query(
          `
          SELECT
            COUNT(*)::integer AS count
          FROM assessment_answers
          WHERE assessment_id = $1
          `,
          [assessment.id]
        )

      await client.query('COMMIT')

      res.json({
        status: 'saved',
        answered_count:
          countResult.rows[0].count,
        current_question_index:
          savedQuestionIndex,
      })
    } catch (error) {
      await client.query('ROLLBACK')

      console.error(error)

      res.status(500).json({
        error: {
          code: 'DATABASE_ERROR',
          message:
            'Impossible de sauvegarder la réponse.',
        },
      })
    } finally {
      client.release()
    }
  }
)


router.post(
  '/:assessmentId/restart',
  async (req, res) => {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      const assessmentResult =
        await client.query(
          `
          SELECT *
          FROM assessments
          WHERE id = $1
          FOR UPDATE
          `,
          [req.params.assessmentId]
        )

      if (
        assessmentResult.rows.length === 0
      ) {
        await client.query('ROLLBACK')

        return res.status(404).json({
          error: {
            code: 'ASSESSMENT_NOT_FOUND',
            message: 'Questionnaire introuvable.',
          },
        })
      }

      const assessment =
        assessmentResult.rows[0]

      if (
        assessment.status !==
        'IN_PROGRESS'
      ) {
        await client.query('ROLLBACK')

        return res.status(409).json({
          error: {
            code: 'ASSESSMENT_NOT_RESTARTABLE',
            message: 'Seul un questionnaire en cours peut être recommencé.',
          },
        })
      }

      await client.query(
        `
        DELETE FROM assessment_answers
        WHERE assessment_id = $1
        `,
        [assessment.id]
      )

      await client.query(
        `
        UPDATE assessments
        SET
          current_question_index = 0,
          updated_at = NOW()
        WHERE id = $1
        `,
        [assessment.id]
      )

      await client.query('COMMIT')

      return res.json({
        assessment_id: assessment.id,
        status: 'IN_PROGRESS',
        current_question_index: 0,
        answered_count: 0,
      })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error(error)

      return res.status(500).json({
        error: {
          code: 'ASSESSMENT_RESTART_FAILED',
          message: 'Impossible de recommencer le questionnaire.',
        },
      })
    } finally {
      client.release()
    }
  }
)

router.post(
  '/:assessmentId/complete',
  async (req, res) => {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      const assessmentResult =
        await client.query(
          `
          SELECT *
          FROM assessments
          WHERE id = $1
          FOR UPDATE
          `,
          [req.params.assessmentId]
        )

      if (
        assessmentResult.rows.length === 0
      ) {
        await client.query('ROLLBACK')

        return res.status(404).json({
          error: {
            code:
              'ASSESSMENT_NOT_FOUND',
            message:
              'Questionnaire introuvable.',
          },
        })
      }

      const assessment =
        assessmentResult.rows[0]

      const answersResult =
        await client.query(
          `
          SELECT
            question_id,
            value
          FROM assessment_answers
          WHERE assessment_id = $1
          `,
          [assessment.id]
        )

      if (
        answersResult.rows.length !==
        questionnaire.questions.length
      ) {
        await client.query('ROLLBACK')

        return res.status(422).json({
          error: {
            code:
              'ASSESSMENT_INCOMPLETE',
            message:
              'Toutes les questions doivent avoir une réponse.',
          },
        })
      }

      const answers = {}

      for (
        const row of answersResult.rows
      ) {
        answers[row.question_id] =
          row.value
      }

      const scores =
        calculateScores(answers)

      const classification =
        classifyProfile(scores)

      const existingResult =
        await client.query(
          `
          SELECT id
          FROM assessment_results
          WHERE assessment_id = $1
          `,
          [assessment.id]
        )

      let resultId

      if (
        existingResult.rows.length > 0
      ) {
        resultId =
          existingResult.rows[0].id
      } else {
        resultId =
          crypto.randomUUID()

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
            $9, $10, $11, $12, $13, $14
          )
          `,
          [
            resultId,
            assessment.id,
            questionnaire.version,

            scores.O,
            scores.C,
            scores.E,
            scores.A,
            scores.N,

            scores.R,
            scores.L,
            scores.P,
            scores.H,
            scores.I,
            scores.M,
          ]
        )
      }

      const existingClassification =
        await client.query(
          `
          SELECT id
          FROM assessment_classifications
          WHERE assessment_result_id = $1
          `,
          [resultId]
        )

      if (
        existingClassification.rows
          .length === 0
      ) {
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
          VALUES (
            $1, $2,
            $3, $4,
            $5, $6,
            $7, $8,
            $9
          )
          `,
          [
            crypto.randomUUID(),
            resultId,

            classification.animal.name,
            classification.animal.bucket,

            classification.types.type_1,
            classification.types.type_2,

            'animal-v1.2',
            'type-v1',

            JSON.stringify(
              classification.debug
            ),
          ]
        )
      }

      await client.query(
        `
        UPDATE assessments
        SET
          status = 'COMPLETED',
          updated_at = NOW()
        WHERE id = $1
        `,
        [assessment.id]
      )

      await client.query('COMMIT')

      res.json({
        assessment_id:
          assessment.id,
        status: 'COMPLETED',
      })
    } catch (error) {
      await client.query('ROLLBACK')

      console.error(error)

      res.status(500).json({
        error: {
          code: 'DATABASE_ERROR',
          message:
            'Impossible de terminer le questionnaire.',
        },
      })
    } finally {
      client.release()
    }
  }
)


router.get(
  '/:assessmentId/result',
  async (req, res) => {
    const {
      assessmentId,
    } = req.params

    try {
      const result =
        await db.query(
          `
          SELECT
            ar.id AS result_id,
            ar.assessment_id,
            ac.animal_name,
            ac.type_1_name,
            ac.type_2_name,
            ac.created_at

          FROM assessment_results ar

          INNER JOIN
            assessment_classifications ac
              ON ac.assessment_result_id =
                 ar.id

          WHERE
            ar.assessment_id = $1

          LIMIT 1
          `,
          [assessmentId]
        )

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            error: {
              code:
                'RESULT_NOT_READY',

              message:
                'Le résultat n’est pas encore disponible.',
            },
          })
      }

      const row =
        result.rows[0]

      return res.json({
        assessment_id:
          row.assessment_id,

        result_id:
          row.result_id,

        classification: {
          animal: {
            name:
              row.animal_name,
          },

          types: [
            row.type_1_name,
            row.type_2_name,
          ].filter(Boolean),
        },

        created_at:
          row.created_at,
      })
    } catch (err) {
      console.error(
        'Result read error:',
        err
      )

      return res
        .status(500)
        .json({
          error: {
            code:
              'RESULT_READ_FAILED',

            message:
              'Impossible de récupérer le résultat.',
          },
        })
    }
  }
)


router.post(
  '/:assessmentId/generation/start',
  async (req, res) => {
    const {
      assessmentId,
    } = req.params

    try {
      const assessmentResult =
        await db.query(
          `
          SELECT status
          FROM assessments
          WHERE id = $1
          LIMIT 1
          `,
          [assessmentId]
        )

      if (
        assessmentResult.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            error: {
              code:
                'ASSESSMENT_NOT_FOUND',

              message:
                'Questionnaire introuvable.',
            },
          })
      }

      if (
        assessmentResult.rows[0]
          .status !== 'COMPLETED'
      ) {
        return res
          .status(409)
          .json({
            error: {
              code:
                'ASSESSMENT_NOT_COMPLETED',

              message:
                'Le questionnaire doit être terminé avant de préparer les livrables.',
            },
          })
      }

      const evolutionReward =
        await decideEvolutionReward(
          assessmentId
        )

      const job =
        await startGeneration(
          assessmentId
        )

      const evolutionReveal = evolutionReward.unlocked
        ? await claimEvolutionReveal(assessmentId)
        : false

      return res.json({
        generation: job,
        evolution_reveal: evolutionReveal,
      })
    } catch (err) {
      console.error(
        'Generation start error:',
        err
      )

      return res
        .status(500)
        .json({
          error: {
            code:
              'GENERATION_START_FAILED',

            message:
              'Impossible de démarrer la préparation des livrables.',
          },
        })
    }
  }
)

router.get(
  '/:assessmentId/generation',
  async (req, res) => {
    const {
      assessmentId,
    } = req.params

    try {
      const generation =
        await getGenerationState(
          assessmentId
        )

      if (!generation) {
        return res
          .status(404)
          .json({
            error: {
              code:
                'GENERATION_NOT_FOUND',

              message:
                'Aucune préparation de livrables trouvée.',
            },
          })
      }

      return res.json({
        generation,
      })
    } catch (err) {
      console.error(
        'Generation read error:',
        err
      )

      return res
        .status(500)
        .json({
          error: {
            code:
              'GENERATION_READ_FAILED',

            message:
              'Impossible de récupérer l’état des livrables.',
          },
        })
    }
  }
)

module.exports = router
