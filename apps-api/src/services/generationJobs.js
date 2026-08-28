const db =
  require('../../db')

const {
  GENERATION_STATUSES,
} = require(
  './generationStates'
)

async function getGenerationJob(
  assessmentId
) {
  const result =
    await db.query(
      `
      SELECT *
      FROM generation_jobs

      WHERE
        assessment_id = $1

      LIMIT 1
      `,
      [assessmentId]
    )

  return (
    result.rows[0] ??
    null
  )
}

async function createOrGetGenerationJob(
  assessmentId
) {
  const existing =
    await getGenerationJob(
      assessmentId
    )

  if (existing) {
    return existing
  }

  const result =
    await db.query(
      `
      INSERT INTO
        generation_jobs (
          assessment_id,
          status,
          current_step
        )

      VALUES (
        $1,
        $2,
        $3
      )

      RETURNING *
      `,
      [
        assessmentId,

        GENERATION_STATUSES
          .FINALIZING,

        'building_creative_deliverables',
      ]
    )

  return result.rows[0]
}

async function updateGenerationStatus({
  assessmentId,
  status,
  currentStep = null,
  errorCode = null,
  errorMessage = null,
}) {
  const result =
    await db.query(
      `
      UPDATE generation_jobs

      SET
        status = $2,
        current_step = $3,
        error_code = $4,
        error_message = $5,

        started_at =
          CASE
            WHEN
              started_at IS NULL
              AND $2 = 'FINALIZING'
            THEN NOW()
            ELSE started_at
          END,

        completed_at =
          CASE
            WHEN
              $2 IN (
                'READY',
                'FAILED'
              )
            THEN NOW()
            ELSE completed_at
          END,

        updated_at = NOW()

      WHERE
        assessment_id = $1

      RETURNING *
      `,
      [
        assessmentId,
        status,
        currentStep,
        errorCode,
        errorMessage,
      ]
    )

  return (
    result.rows[0] ??
    null
  )
}

module.exports = {
  getGenerationJob,
  createOrGetGenerationJob,
  updateGenerationStatus,
}
