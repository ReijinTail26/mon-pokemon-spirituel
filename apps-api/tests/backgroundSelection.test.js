const library = require('../src/data/backgroundLibrary.json')
const { selectBackground } = require('../src/services/backgroundSelection')
if (library.backgrounds.length !== 61) throw new Error('La bibliothèque doit contenir 61 backgrounds')
const dna = { IDENTITY:{type_1:'Roche',type_2:null,animal:'Renard'}, PERSONALITY:{O:70,E:50,N:45}, NARRATIVE:{habitat_tendency:'falaises rocheuses et vallées minérales'}, COMBAT:{role:'Hybride'} }
const a = selectBackground({assessmentId:'test-bg',dna})
const b = selectBackground({assessmentId:'test-bg',dna})
if (a.id !== b.id) throw new Error('Le tirage doit être déterministe')
if (!a.usage_policy?.silhouette_readability_required || !a.usage_policy?.same_environment_across_related_panels || !a.usage_policy?.must_be_contextually_relevant) throw new Error('Règles visuelles background manquantes')
console.log(`✓ Background V1 : 61 références, tirage pondéré déterministe (${a.id})`)
