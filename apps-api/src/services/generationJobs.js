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

        locked_at =
          CASE
            WHEN $2 IN ('READY', 'FAILED')
            THEN NULL
            ELSE locked_at
          END,

        heartbeat_at =
          CASE
            WHEN $2 IN ('READY', 'FAILED')
            THEN NULL
            ELSE heartbeat_at
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

async function restartGenerationJob(assessmentId) {
  const result = await db.query(
    `
    UPDATE generation_jobs
    SET
      status = 'FINALIZING',
      current_step = 'building_creative_deliverables',
      error_code = NULL,
      error_message = NULL,
      attempt_count = 0,
      locked_at = NULL,
      heartbeat_at = NULL,
      started_at = NOW(),
      completed_at = NULL,
      updated_at = NOW()
    WHERE assessment_id = $1
    RETURNING *
    `,
    [assessmentId]
  )

  return result.rows[0] ?? null
}

async function failStaleGenerationJobs(staleMinutes) {
  const result = await db.query(
    `
    UPDATE generation_jobs
    SET
      status = 'FAILED',
      current_step = 'deliverables_interrupted',
      error_code = 'GENERATION_INTERRUPTED',
      error_message = 'La génération a été interrompue par le serveur. Elle ne sera pas relancée automatiquement.',
      completed_at = NOW(),
      updated_at = NOW(),
      locked_at = NULL,
      heartbeat_at = NULL
    WHERE
      status = 'FINALIZING'
      AND locked_at IS NOT NULL
      AND locked_at < NOW() - ($1 * INTERVAL '1 minute')
    RETURNING id, assessment_id
    `,
    [staleMinutes]
  )

  return result.rows
}

async function claimNextGenerationJob() {
  const result = await db.query(
    `
    WITH candidate AS (
      SELECT id
      FROM generation_jobs
      WHERE
        status = 'FINALIZING'
        AND locked_at IS NULL
        AND attempt_count < max_attempts
        AND NOT EXISTS (
          SELECT 1
          FROM generation_jobs active_job
          WHERE
            active_job.status = 'FINALIZING'
            AND active_job.locked_at IS NOT NULL
        )
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE generation_jobs job
    SET
      locked_at = NOW(),
      heartbeat_at = NOW(),
      attempt_count = job.attempt_count + 1,
      started_at = COALESCE(job.started_at, NOW()),
      updated_at = NOW()
    FROM candidate
    WHERE job.id = candidate.id
    RETURNING job.*
    `
  )

  return result.rows[0] ?? null
}

async function touchGenerationHeartbeat(assessmentId, currentStep) {
  await db.query(
    `
    UPDATE generation_jobs
    SET
      current_step = $2,
      heartbeat_at = NOW(),
      updated_at = NOW()
    WHERE assessment_id = $1 AND status = 'FINALIZING'
    `,
    [assessmentId, currentStep]
  )
}

module.exports = {
  getGenerationJob,
  createOrGetGenerationJob,
  updateGenerationStatus,
  restartGenerationJob,
  failStaleGenerationJobs,
  claimNextGenerationJob,
  touchGenerationHeartbeat,
}
