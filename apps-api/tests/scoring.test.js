const { calculateScores } = require('../src/services/scoring')
const questionnaire = require('../src/data/questionnaire.public')
function assertEqual(a,e,l){ if(a!==e) throw new Error(`${l} : attendu ${e}, obtenu ${a}`) }
const allNeutral = Object.fromEntries(questionnaire.questions.map(q => [q.id,3]))
const neutral = calculateScores(allNeutral)
for (const [d,v] of Object.entries(neutral)) assertEqual(v,50,`Score neutre ${d}`)
for (const [d,v] of Object.entries(neutral)) if(v < 0 || v > 100) throw new Error(`${d} hors échelle`)
console.log('✓ Scoring 74Q : neutralité = 50 et échelle 0–100 conservée')
