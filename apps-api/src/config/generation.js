function generationEnabled() {
  if (process.env.GENERATION_ENABLED === undefined) {
    return process.env.NODE_ENV !== 'production'
  }
  return String(process.env.GENERATION_ENABLED).toLowerCase() === 'true'
}

function generationJobTimeoutMs() {
  const configured = Number(process.env.GENERATION_JOB_TIMEOUT_MS || 180000)
  return Number.isFinite(configured) && configured >= 30000
    ? configured
    : 180000
}

function staleGenerationMinutes() {
  const configured = Number(process.env.GENERATION_STALE_MINUTES || 10)
  return Number.isFinite(configured) && configured >= 2
    ? configured
    : 10
}

module.exports = {
  generationEnabled,
  generationJobTimeoutMs,
  staleGenerationMinutes,
}
