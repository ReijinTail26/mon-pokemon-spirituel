const db =
  require('../../db')

const {
  GENERATION_STATUSES,
} = require(
  './generationStates'
)

const {
  updateGenerationStatus,
} = require(
  './generationJobs'
)

const {
  loadCreativePackage,
} = require(
  './creativePackageSource'
)

const {
  createCreativeDeliverables,
} = require(
  './creativeDeliverables'
)

async function getNextJob() {
  const result =
    await db.query(
      `
      SELECT *
      FROM generation_jobs

      WHERE status = 'FINALIZING'

      ORDER BY
        created_at ASC

      LIMIT 1
      `
    )

  return (
    result.rows[0] ??
    null
  )
}

async function processFinalizing(
  job
) {
  try {
    const assessmentResult = await db.query(`
      SELECT evolution_slot_unlocked
      FROM assessments
      WHERE id = $1
      LIMIT 1
    `, [job.assessment_id])

    if (!assessmentResult.rows[0]) {
      throw new Error('ASSESSMENT_NOT_FOUND')
    }

    const creativePackage =
      await loadCreativePackage(
        job.assessment_id
      )

    if (!creativePackage) {
      return updateGenerationStatus({
        assessmentId:
          job.assessment_id,

        status:
          GENERATION_STATUSES
            .FAILED,

        currentStep:
          'creative_package_missing',

        errorCode:
          'CREATIVE_PACKAGE_NOT_READY',

        errorMessage:
          'Les données nécessaires au dossier créatif sont absentes.',
      })
    }

    const deliverables = await createCreativeDeliverables({
      assessmentId:
        job.assessment_id,

      creativePackage,

      evolutionUnlocked:
        assessmentResult.rows[0].evolution_slot_unlocked === true,
    })

    if (deliverables.evolution_seed) {
      await db.query(`
        UPDATE assessments
        SET evolution_seed_pdf_created_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [job.assessment_id])
    }

    return updateGenerationStatus({
      assessmentId:
        job.assessment_id,

      status:
        GENERATION_STATUSES
          .READY,

      currentStep:
        'deliverables_ready',
    })
  } catch (err) {
    console.error(
      'Creative deliverables worker error:',
      err
    )

    return updateGenerationStatus({
      assessmentId:
        job.assessment_id,

      status:
        GENERATION_STATUSES
          .FAILED,

      currentStep:
        'deliverables_failed',

      errorCode:
        'CREATIVE_DELIVERABLES_FAILED',

      errorMessage:
        err instanceof Error
          ? err.message
          : 'Impossible de générer les livrables.',
    })
  }
}

async function runGenerationWorkerOnce() {
  const job =
    await getNextJob()

  if (!job) {
    return {
      processed:
        false,

      reason:
        'NO_JOB',
    }
  }

  await processFinalizing(
    job
  )

  return {
    processed:
      true,

    assessment_id:
      job.assessment_id,
  }
}

module.exports = {
  runGenerationWorkerOnce,
}
