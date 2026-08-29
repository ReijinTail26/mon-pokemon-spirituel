const assert = require('assert')
const {
  generationEnabled,
  generationJobTimeoutMs,
  staleGenerationMinutes,
} = require('../src/config/generation')

const previous = {
  nodeEnv: process.env.NODE_ENV,
  enabled: process.env.GENERATION_ENABLED,
  timeout: process.env.GENERATION_JOB_TIMEOUT_MS,
  stale: process.env.GENERATION_STALE_MINUTES,
}

try {
  delete process.env.GENERATION_ENABLED
  process.env.NODE_ENV = 'production'
  assert.strictEqual(generationEnabled(), false)

  process.env.GENERATION_ENABLED = 'false'
  assert.strictEqual(generationEnabled(), false)

  process.env.GENERATION_ENABLED = 'true'
  assert.strictEqual(generationEnabled(), true)

  process.env.GENERATION_JOB_TIMEOUT_MS = '90000'
  assert.strictEqual(generationJobTimeoutMs(), 90000)

  process.env.GENERATION_JOB_TIMEOUT_MS = '1000'
  assert.strictEqual(generationJobTimeoutMs(), 180000)

  process.env.GENERATION_STALE_MINUTES = '12'
  assert.strictEqual(staleGenerationMinutes(), 12)

  process.env.GENERATION_STALE_MINUTES = '1'
  assert.strictEqual(staleGenerationMinutes(), 10)

  console.log('generationConfig.test.js OK')
} finally {
  if (previous.nodeEnv === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = previous.nodeEnv
  if (previous.enabled === undefined) delete process.env.GENERATION_ENABLED
  else process.env.GENERATION_ENABLED = previous.enabled
  if (previous.timeout === undefined) delete process.env.GENERATION_JOB_TIMEOUT_MS
  else process.env.GENERATION_JOB_TIMEOUT_MS = previous.timeout
  if (previous.stale === undefined) delete process.env.GENERATION_STALE_MINUTES
  else process.env.GENERATION_STALE_MINUTES = previous.stale
}
