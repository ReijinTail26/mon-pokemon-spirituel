const {
  runGenerationWorkerOnce,
} =
  require(
    '../services/generationWorker'
  )

const WORKER_INTERVAL_MS =
  15000

let running = false

async function tick() {
  if (running) {
    return
  }

  running = true

  try {
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