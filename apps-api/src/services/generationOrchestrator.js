const {
  GENERATION_STATUSES,
} = require(
  './generationStates'
)

const {
  getGenerationJob,
  createOrGetGenerationJob,
  updateGenerationStatus,
} = require(
  './generationJobs'
)

const db = require('../../db')

async function startGeneration(
  assessmentId
) {
  let job =
    await createOrGetGenerationJob(
      assessmentId
    )

  if (
    job.status ===
    GENERATION_STATUSES.READY
  ) {
    return job
  }

  job =
    await updateGenerationStatus({
      assessmentId,

      status:
        GENERATION_STATUSES
          .FINALIZING,

      currentStep:
        'building_creative_deliverables',
    })

  return job
}

async function getGenerationState(
  assessmentId
) {
  const job =
    await getGenerationJob(
      assessmentId
    )

  if (!job) {
    return null
  }

  const ready =
    job.status ===
      GENERATION_STATUSES.READY

  const assessmentResult = await db.query(`
    SELECT evolution_slot_unlocked, evolution_seed_pdf_created_at
    FROM assessments
    WHERE id = $1
    LIMIT 1
  `, [assessmentId])

  const evolutionUnlocked =
    assessmentResult.rows[0]?.evolution_slot_unlocked === true

  return {
    id:
      job.id,

    assessment_id:
      job.assessment_id,

    status:
      job.status,

    current_step:
      job.current_step,

    error: job.error_code
      ? {
          code:
            job.error_code,

          message:
            job.error_message,
        }
      : null,

    deliverables:
      ready
        ? {
            dossier_pdf:
              `/generated-dossiers/${assessmentId}/dossier-creatif.pdf`,

            prompt_txt:
              `/generated-dossiers/${assessmentId}/prompt-fiche-complete.txt`,

            evolution_seed_pdf:
              evolutionUnlocked && assessmentResult.rows[0]?.evolution_seed_pdf_created_at
                ? `/generated-dossiers/${assessmentId}/seed-evolutif.pdf`
                : null,
          }
        : null,

    created_at:
      job.created_at,

    updated_at:
      job.updated_at,

    started_at:
      job.started_at,

    completed_at:
      job.completed_at,
  }
}

module.exports = {
  startGeneration,
  getGenerationState,
}
