const {
  buildVisualArchitectInput,
  buildVisualArchitectPrompt,
  validateVisualConcept,
} = require(
  './visualArchitect'
)

const {
  scoreVisualConcept,
} = require(
  './visualCritic'
)

const MAX_VISUAL_CONCEPT_ATTEMPTS =
  3

function createVisualGenerationRequest(
  dna,
  attempt = 1,
  previousFeedback = []
) {
  const input =
    buildVisualArchitectInput(
      dna
    )

  let prompt =
    buildVisualArchitectPrompt(
      input
    )

  if (
    previousFeedback.length >
    0
  ) {
    prompt += `

PREVIOUS CRITIC FEEDBACK:

${previousFeedback
  .map(
    (item) =>
      `- ${item}`
  )
  .join('\n')}

Corrige uniquement les problèmes
signalés.

Ne modifie pas arbitrairement
les éléments déjà cohérents.
`
  }

  return {
    attempt,

    max_attempts:
      MAX_VISUAL_CONCEPT_ATTEMPTS,

    input,

    prompt,
  }
}

function evaluateVisualConcept({
  dna,
  concept,
  attempt,
}) {
  const structural =
    validateVisualConcept(
      concept,
      dna
    )

  const critic =
    scoreVisualConcept({
      concept,
      dna,
    })

  const passed =
    structural.valid &&
    critic.status ===
      'PASS'

  const attemptsRemaining =
    Math.max(
      0,
      MAX_VISUAL_CONCEPT_ATTEMPTS -
        attempt
    )

  let nextStatus

  if (passed) {
    nextStatus =
      'CANONICAL_VISUAL_CONCEPT'
  } else if (
    attemptsRemaining > 0
  ) {
    nextStatus =
      'VISUAL_CONCEPT_RETRY'
  } else {
    nextStatus =
      'VISUAL_CONCEPT_FAILED'
  }

  return {
    passed,

    attempt,

    attempts_remaining:
      attemptsRemaining,

    structural,

    critic,

    next_status:
      nextStatus,
  }
}

module.exports = {
  MAX_VISUAL_CONCEPT_ATTEMPTS,

  createVisualGenerationRequest,

  evaluateVisualConcept,
}