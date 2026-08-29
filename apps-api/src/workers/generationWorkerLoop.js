const {
  runGenerationWorkerOnce,
} =
  require(
    '../services/generationWorker'
  )
const {
  failStaleGenerationJobs,
} = require('../services/generationJobs')
const {
  staleGenerationMinutes,
} = require('../config/generation')

const WORKER_INTERVAL_MS =
  15000

let running = false

async function tick() {
  if (running) {
    return
  }

  running = true

  try {
    const staleJobs = await failStaleGenerationJobs(
      staleGenerationMinutes()
    )

    if (staleJobs.length > 0) {
      console.error('Stale generation jobs marked as failed.', {
        count: staleJobs.length,
        assessment_ids: staleJobs.map((job) => job.assessment_id),
      })
    }

    await runGenerationWorkerOnce()
  } catch (err) {
    console.error(
      'Generation worker loop error:',
      err
    )
  } finally {
    running = false
  }
}

function startGenerationWorkerLoop() {
  console.log(
    'Generation worker started.'
  )

  tick()

  return setInterval(
    tick,
    WORKER_INTERVAL_MS
  )
}

module.exports = {
  startGenerationWorkerLoop,
}
