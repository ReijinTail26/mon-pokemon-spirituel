const GENERATION_STATUSES = {
  FINALIZING:
    'FINALIZING',

  READY:
    'READY',

  FAILED:
    'FAILED',
}

const ACTIVE_STATUSES =
  new Set([
    GENERATION_STATUSES
      .FINALIZING,
  ])

function isTerminalStatus(
  status
) {
  return (
    status ===
      GENERATION_STATUSES.READY ||
    status ===
      GENERATION_STATUSES.FAILED
  )
}

function isActiveStatus(
  status
) {
  return ACTIVE_STATUSES.has(
    status
  )
}

module.exports = {
  GENERATION_STATUSES,
  ACTIVE_STATUSES,
  isTerminalStatus,
  isActiveStatus,
}
