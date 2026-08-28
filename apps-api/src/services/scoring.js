const questionnaireScoring =
  require('../data/questionnaire.scoring')

const DIMENSIONS = [
  'O',
  'C',
  'E',
  'A',
  'N',
  'R',
  'L',
  'P',
  'H',
  'I',
  'M',
]

function reverseValue(value) {
  return 6 - value
}

function normalizeAverageTo100(average) {
  return ((average - 1) / 4) * 100
}

function calculateScores(answers) {
  const totals = {}
  const counts = {}

  for (const dimension of DIMENSIONS) {
    totals[dimension] = 0
    counts[dimension] = 0
  }

  for (const [questionId, rawValue] of Object.entries(answers)) {
    const scoringRule =
      questionnaireScoring.questions[questionId]

    if (!scoringRule) {
      continue
    }

    const scoredValue = scoringRule.reverse
      ? reverseValue(rawValue)
      : rawValue

    totals[scoringRule.dimension] += scoredValue
    counts[scoringRule.dimension] += 1
  }

  const scores = {}

  for (const dimension of DIMENSIONS) {
    if (counts[dimension] === 0) {
      scores[dimension] = null
      continue
    }

    const average =
      totals[dimension] / counts[dimension]

    scores[dimension] = Number(
      normalizeAverageTo100(average).toFixed(2)
    )
  }

  return scores
}

module.exports = {
  calculateScores,
}