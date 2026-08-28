const questionnaire = require('../src/data/questionnaire.public')
const scoring = require('../src/data/questionnaire.scoring')

function fail(message) { throw new Error(message) }

function runTests() {
  if (questionnaire.questions.length !== 74) fail(`Le questionnaire contient ${questionnaire.questions.length} questions au lieu de 74.`)
  const ids = questionnaire.questions.map(q => q.id)
  if (new Set(ids).size !== 74) fail('Certaines questions ont des IDs en double.')
  for (const q of questionnaire.questions) if (!scoring.questions[q.id]) fail(`Aucune règle de scoring pour ${q.id}`)
  if (Object.keys(scoring.questions).length !== 74) fail(`Le scoring contient ${Object.keys(scoring.questions).length} règles au lieu de 74.`)
  const counts = {}
  for (const rule of Object.values(scoring.questions)) counts[rule.dimension] = (counts[rule.dimension] || 0) + 1
  for (const d of ['O','C','E','A','N']) if (counts[d] !== 10) fail(`${d}: ${counts[d]} questions au lieu de 10`)
  for (const d of ['R','L','P','H','I','M']) if (counts[d] !== 4) fail(`${d}: ${counts[d]} questions au lieu de 4`)
  console.log('✓ Questionnaire : 74 questions uniques (50 Big Five + 24 axes de type)')
}
runTests()
