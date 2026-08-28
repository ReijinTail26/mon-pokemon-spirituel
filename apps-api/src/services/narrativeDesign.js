const typeVisualRules = require('../data/typeVisualRules.json')

const {
  selectSpeciesTitle,
} = require('./speciesTitleDesign')

const typeVisualByName = new Map(
  typeVisualRules.map((rule) => [rule.name, rule])
)

function strongestEntry(object) {
  return Object.entries(object)
    .sort((a, b) => b[1] - a[1])[0]
}

function traitPhrase(key, value) {
  const high = value >= 62
  const low = value <= 38

  const table = {
    O: high
      ? 'une curiosité vive et un goût marqué pour l’inattendu'
      : low
        ? 'un tempérament pragmatique attaché aux repères familiers'
        : 'une curiosité mesurée et sélective',
    C: high
      ? 'une conduite méthodique et très maîtrisée'
      : low
        ? 'une manière d’agir spontanée et instinctive'
        : 'un équilibre entre discipline et improvisation',
    E: high
      ? 'une présence expressive qui attire naturellement l’attention'
      : low
        ? 'une présence discrète qui privilégie l’observation'
        : 'une présence adaptable selon le contexte',
    A: high
      ? 'un comportement coopératif et protecteur'
      : low
        ? 'un caractère indépendant et peu conciliant lorsqu’il est contrarié'
        : 'une sociabilité sélective et équilibrée',
    N: high
      ? 'une forte sensibilité aux changements de son environnement'
      : low
        ? 'un calme remarquable même sous pression'
        : 'une sensibilité contenue qui reste généralement sous contrôle',
    R: high
      ? 'réagit très vite aux variations autour de lui'
      : low
        ? 'prend le temps d’évaluer une situation avant d’agir'
        : 'alterne observation et réaction rapide',
    L: high
      ? 'supporte mal les contraintes et recherche une grande liberté de mouvement'
      : low
        ? 'se montre à l’aise dans des routines et territoires stables'
        : 's’adapte aussi bien à l’autonomie qu’aux cadres établis',
    P: high
      ? 'affirme sa puissance de manière directe lorsqu’il doit s’imposer'
      : low
        ? 'préfère l’efficacité subtile à la démonstration de force'
        : 'dose sa puissance selon la situation',
    H: high
      ? 'cherche spontanément à préserver l’équilibre de son groupe et de son territoire'
      : low
        ? 'privilégie ses propres objectifs avant l’harmonie collective'
        : 'coopère sans renoncer à son indépendance',
    I: high
      ? 'vit chaque confrontation avec une intensité particulièrement visible'
      : low
        ? 'économise ses réactions et évite les dépenses d’énergie inutiles'
        : 'maintient une intensité régulière et contrôlée',
    M: high
      ? 'conserve des habitudes difficiles à anticiper, même pour ceux qui le connaissent bien'
      : low
        ? 'adopte des comportements généralement lisibles et constants'
        : 'laisse planer une part d’imprévisibilité dans ses décisions',
  }

  return table[key]
}

function buildHabitatTendency({ biology, type1, type2 }) {
  const locomotion = biology.locomotion ?? []
  const primaryRule = typeVisualByName.get(type1)
  const secondaryRule = type2 ? typeVisualByName.get(type2) : null

  let base

  if (locomotion.includes('swim')) {
    base = 'les zones aquatiques, littorales ou humides offrant assez d’espace pour se déplacer librement'
  } else if (locomotion.includes('fly') || locomotion.includes('glide')) {
    base = 'les territoires ouverts, reliefs, lisières et hauteurs offrant de bons axes de déplacement'
  } else if (biology.body_plan === 'serpentine') {
    base = 'les zones riches en abris, passages étroits et contrastes de terrain'
  } else if (biology.body_plan === 'invertebrate') {
    base = 'les milieux riches en structures naturelles, végétation, roches ou refuges rapprochés'
  } else {
    base = 'les territoires terrestres offrant à la fois zones de repos, couvert naturel et espace de déplacement'
  }

  const typeIdentity = [
    primaryRule?.identity,
    secondaryRule?.identity,
  ].filter(Boolean)

  if (typeIdentity.length === 0) {
    return `Il privilégie ${base}.`
  }

  return `Il privilégie ${base}. Son affinité ${typeIdentity.join(' et ')} influence surtout les conditions qu’il recherche dans ces lieux.`
}

function buildNarrative({
  personality,
  temperament,
  animal,
  type1,
  type2,
  biology,
  combat,
  name,
  seed,
}) {
  const [dominantPersonality, personalityValue] = strongestEntry(personality)
  const [dominantTemperament, temperamentValue] = strongestEntry(temperament)

  const socialBehavior = Math.max(
    0,
    Math.min(
      100,
      0.35 * personality.E +
      0.30 * personality.A +
      0.20 * temperament.H +
      0.15 * (100 - temperament.L)
    )
  )

  const signatureFeature =
    biology.signature_anatomy?.[0] ??
    biology.animal_markers?.[0] ??
    biology.tail?.description ??
    biology.head?.shape ??
    'sa morphologie caractéristique'

  const typeText = type2
    ? `${type1} et ${type2}`
    : type1

  const speciesTitle =
    selectSpeciesTitle({
      animal,
      seed,
    })

  const category =
    speciesTitle.label

  const personalityDescription =
    `Son tempérament se distingue par ${traitPhrase(dominantPersonality, personalityValue)}, tandis que son axe comportemental dominant fait qu’il ${traitPhrase(dominantTemperament, temperamentValue)}.`

  let behaviorDescription
  if (socialBehavior >= 70) {
    behaviorDescription = 'Il recherche volontiers la présence de ses congénères et se montre très démonstratif lorsqu’un groupe se forme.'
  } else if (socialBehavior >= 55) {
    behaviorDescription = 'Il apprécie la compagnie, tout en conservant suffisamment d’autonomie pour s’éloigner lorsque la situation l’exige.'
  } else if (socialBehavior >= 40) {
    behaviorDescription = 'Il alterne naturellement phases solitaires et interactions sociales, sans dépendre durablement de l’une ou de l’autre.'
  } else if (socialBehavior >= 25) {
    behaviorDescription = 'Il préfère évoluer seul ou en très petit groupe et n’accepte la proximité qu’après une période d’observation.'
  } else {
    behaviorDescription = 'Très solitaire, il défend fortement son espace personnel et évite les interactions qui ne lui apportent aucun avantage clair.'
  }

  const habitatTendency = buildHabitatTendency({ biology, type1, type2 })

  const signatureBehavior =
    `Lorsqu’il veut s’exprimer ou se préparer au combat, ce Pokémon met particulièrement en valeur ${signatureFeature}. Cette manifestation sert de point de convergence à son énergie ${typeText} sans modifier son anatomie.`

  const pokedexDescription =
    `Ce Pokémon est une créature inspirée du ${animal.toLowerCase()}, reconnaissable à ${signatureFeature}. ` +
    `Son affinité ${typeText} se manifeste à travers ses couleurs, ses motifs et ses effets énergétiques plutôt que par une transformation de sa morphologie. ` +
    `${behaviorDescription} En combat, son profil de ${combat.role.toLowerCase()} s’appuie sur cette combinaison entre comportement et anatomie.`

  return {
    name,
    category,
    pokedex_description: pokedexDescription,
    personality_description: personalityDescription,
    behavior_description: behaviorDescription,
    habitat_tendency: habitatTendency,
    social_behavior: Number(socialBehavior.toFixed(1)),
    signature_behavior: signatureBehavior,
  }
}

module.exports = {
  buildNarrative,
}
