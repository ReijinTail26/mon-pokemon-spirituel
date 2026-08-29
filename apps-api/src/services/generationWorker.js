const db =
  require('../../db')

const {
  GENERATION_STATUSES,
} = require(
  './generationStates'
)

const {
  updateGenerationStatus,
  claimNextGenerationJob,
  touchGenerationHeartbeat,
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

function memorySnapshot() {
  const memory = process.memoryUsage()
  const megabytes = (value) => Math.round(value / 1024 / 1024)
  return {
    rss_mb: megabytes(memory.rss),
    heap_used_mb: megabytes(memory.heapUsed),
    external_mb: megabytes(memory.external),
  }
}

async function processFinalizing(
  job
) {
  try {
    console.log('Generation job started.', {
      assessment_id: job.assessment_id,
      attempt_count: job.attempt_count,
      memory: memorySnapshot(),
    })

    await touchGenerationHeartbeat(
      job.assessment_id,
      'loading_creative_package'
    )

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

    await touchGenerationHeartbeat(
      job.assessment_id,
      'building_creative_deliverables'
    )

    const deliverables = await createCreativeDeliverables({
      assessmentId:
        job.assessment_id,

      creativePackage,

      evolutionUnlocked:
        assessmentResult.rows[0].evolution_slot_unlocked === true,
    })

    if (deliverables.evolution_seed) {
      await touchGenerationHeartbeat(
        job.assessment_id,
        'finalizing_evolution_seed'
      )

      await db.query(`
        UPDATE assessments
        SET evolution_seed_pdf_created_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [job.assessment_id])
    }

    console.log('Generation job completed.', {
      assessment_id: job.assessment_id,
      memory: memorySnapshot(),
    })

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
    await claimNextGenerationJob()

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
