const crypto = require('crypto')

const animalBiology = require('../data/animalBiology.json')
const { selectAnimalMorphologyVariant } = require('./animalMorphologyVariants')
const typeVisualRules = require('../data/typeVisualRules.json')
const moveLexicon = require('../data/moveLexicon.json')

const animalBiologyByName = new Map(
  animalBiology.map((profile) => [profile.name, profile])
)

const typeVisualByName = new Map(
  typeVisualRules.map((profile) => [profile.name, profile])
)

const animalMoveLexiconByName = new Map(
  Object.entries(moveLexicon.animals ?? {})
)

const typeMoveLexiconByName = new Map(
  Object.entries(moveLexicon.types ?? {})
)

const ROLE_TAGS = {
  Assaillant: ['offense', 'physical', 'special'],
  Berserker: ['offense', 'physical', 'boost'],
  'Éclaireur': ['mobility', 'utility', 'technique'],
  'Contrôleur': ['control', 'status', 'utility'],
  'Spécialiste': ['technique', 'special', 'utility'],
  'Défenseur': ['defense', 'protect', 'heal'],
  'Protecteur': ['support', 'protect', 'heal'],
  'Adaptateur': ['hybrid', 'utility', 'offense'],
  'Hybride': ['hybrid', 'offense', 'utility'],
}

const AXIS_EFFECTS = {
  'Réactivité': {
    name: 'Réplique Vive',
    trigger: 'après avoir subi une attaque ou un changement de statistique adverse',
    effect: 'augmente la Vitesse d’un niveau et renforce légèrement la prochaine attaque',
    tags: ['mobility', 'counter'],
  },
  'Liberté': {
    name: 'Élan Libre',
    trigger: 'lors d’une entrée en jeu ou après un changement de position tactique',
    effect: 'ignore temporairement les effets qui limitent la mobilité et augmente légèrement la Vitesse',
    tags: ['mobility', 'utility'],
  },
  'Puissance': {
    name: 'Cœur de Force',
    trigger: 'lorsque la créature utilise une attaque offensive après avoir perdu des PV',
    effect: 'augmente d’un niveau sa statistique offensive dominante une fois par entrée en jeu',
    tags: ['offense', 'boost'],
  },
  'Harmonie': {
    name: 'Accord Vital',
    trigger: 'après avoir utilisé une capacité de soutien, de protection ou de statut',
    effect: 'récupère une petite quantité de PV et stabilise les baisses de statistiques',
    tags: ['support', 'heal'],
  },
  'Intensité': {
    name: 'Pic d’Intensité',
    trigger: 'lorsque les PV passent sous la moitié',
    effect: 'augmente temporairement la puissance des attaques et la présence tactique, au prix d’une défense légèrement réduite',
    tags: ['offense', 'risk'],
  },
  'Mystère': {
    name: 'Voile Énigmatique',
    trigger: 'la première fois qu’un adversaire tente d’appliquer un statut ou une altération',
    effect: 'réduit fortement l’effet subi et augmente d’un niveau la Défense Spéciale',
    tags: ['utility', 'special', 'control'],
  },
}

function hash01(value) {
  const digest = crypto
    .createHash('sha256')
    .update(String(value))
    .digest()

  return digest.readUInt32BE(0) / 0xffffffff
}

function normalizeCategory(orientation, role) {
  if (
    role === 'Contrôleur' ||
    role === 'Protecteur' ||
    role === 'Défenseur'
  ) {
    return 'Statut'
  }

  if (orientation === 'Physique') {
    return 'Physique'
  }

  if (orientation === 'Spéciale') {
    return 'Spéciale'
  }

  return 'Physique'
}

function powerFor(category, role, signature = false) {
  if (category === 'Statut') {
    return null
  }

  if (signature) {
    return role === 'Berserker' || role === 'Assaillant' ? 105 : 95
  }

  return role === 'Berserker' || role === 'Assaillant' ? 85 : 75
}

function cleanFeatureLabel(value) {
  if (!value) {
    return 'anatomie signature'
  }

  return String(value)
    .replace(/^paire d[’']?/i, '')
    .replace(/^grande?s?\s+/i, '')
    .trim()
}


function pickDeterministic(items, seed, salt) {
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  const index = Math.floor(
    hash01(`${seed}|${salt}`) * items.length
  ) % items.length

  return items[index]
}

function titleCaseFirst(value) {
  if (!value) return ''
  const text = String(value).trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const FEMININE_ANIMALS = new Set([
  'Licorne',
  'Fourmi',
  'Abeille',
  'Mante religieuse',
  'Coccinelle',
  'Libellule',
  'Panthère',
  'Tortue',
  'Baleine',
  'Orque',
  'Raie manta',
  'Sirène',
  'Méduse',
  'Étoile de mer',
  'Hirondelle',
])

function animalDePhrase(animal) {
  const lower = String(animal).toLocaleLowerCase('fr')

  if (/^[aeiouyàâäéèêëîïôöùûüœh]/i.test(lower)) {
    return `de l’${animal}`
  }

  if (FEMININE_ANIMALS.has(animal)) {
    return `de la ${animal}`
  }

  return `du ${animal}`
}

function deNounPhrase(noun) {
  const text = String(noun ?? '').trim()

  if (!text) {
    return 'd’énergie'
  }

  if (/^[aeiouyàâäéèêëîïôöùûüœh]/i.test(text)) {
    return `d’${titleCaseFirst(text)}`
  }

  return `de ${titleCaseFirst(text)}`
}

function buildAnimalMoveName({ animal, seed, category }) {
  const lexicon = animalMoveLexiconByName.get(animal)

  if (!lexicon) {
    return `Instinct ${animal}`
  }

  const curated = lexicon.move_names?.[category]

  if (Array.isArray(curated) && curated.length > 0) {
    return pickDeterministic(
      curated,
      seed,
      `animal-curated-name|${category}`
    )
  }

  const concept = pickDeterministic(
    lexicon.concepts,
    seed,
    'animal-name-concept'
  )

  const noun = pickDeterministic(
    lexicon.nouns,
    seed,
    'animal-name-noun'
  )

  // Deux familles volontairement simples et grammaticalement robustes :
  // - concept + origine animale : "Embuscade du Renard"
  // - concept + support anatomique : "Rempart d’Armure"
  // On évite de concaténer directement une description brute telle que
  // "museau étroit" ou "carapace dure" dans le nom de l'attaque.
  const templates = [
    () => `${titleCaseFirst(concept)} ${animalDePhrase(animal)}`,
    () => `${titleCaseFirst(concept)} ${deNounPhrase(noun)}`,
  ]

  const template = pickDeterministic(
    templates,
    seed,
    'animal-name-template'
  )

  return template()
}

function buildTypeMoveName({ type1, seed, category }) {
  const lexicon = typeMoveLexiconByName.get(type1)

  if (!lexicon) {
    return `Impulsion ${type1}`
  }

  const curated = lexicon.move_names_by_category?.[category]

  if (Array.isArray(curated) && curated.length > 0) {
    return pickDeterministic(
      curated,
      seed,
      `type-curated-name|${category}`
    )
  }

  return pickDeterministic(
    lexicon.move_names,
    seed,
    'type-name-candidate'
  ) ?? `Impulsion ${type1}`
}

function buildAnimalMoveDescription({ animal, feature, seed }) {
  const lexicon = animalMoveLexiconByName.get(animal)
  const verb = pickDeterministic(lexicon?.verbs, seed, 'animal-description-verb')
  const concept = pickDeterministic(lexicon?.concepts, seed, 'animal-description-concept')

  if (!verb || !concept) {
    return `Le Pokémon exploite ${cleanFeatureLabel(feature)} dans une technique directement inspirée de sa biologie de ${animal.toLowerCase()}.`
  }

  return `Le Pokémon exploite son anatomie signature (« ${cleanFeatureLabel(feature)} ») pour ${verb}, dans une technique inspirée de ${concept}, sans altérer son anatomie canonique.`
}

function buildTypeMoveDescription({ type1, seed }) {
  const visual = getTypeReference(type1)
  const lexicon = typeMoveLexiconByName.get(type1)
  const noun = pickDeterministic(lexicon?.nouns, seed, 'type-description-noun')

  return `Le Pokémon canalise son affinité ${type1} en une manifestation de ${noun ?? 'énergie'} : ${visual.energy_effect}.`
}

function getAnimalReference(animal) {
  const reference = animalBiologyByName.get(animal)

  if (!reference) {
    throw new Error(`Référentiel biologique absent pour ${animal}.`)
  }

  return reference
}

function getTypeReference(typeName) {
  const reference = typeVisualByName.get(typeName)

  if (!reference) {
    throw new Error(`Référentiel visuel absent pour le type ${typeName}.`)
  }

  return reference
}

function selectMainAbility({
  abilities,
  type1,
  type2,
  role,
  offensiveOrientation,
  seed,
}) {
  const roleTags = new Set(ROLE_TAGS[role] ?? ['utility'])

  if (offensiveOrientation === 'Physique') {
    roleTags.add('physical')
  } else if (offensiveOrientation === 'Spéciale') {
    roleTags.add('special')
  } else {
    roleTags.add('hybrid')
  }

  const eligibleAbilities = abilities.filter((ability) => ability.eligible_v1 !== false)

  const compatibleAbilities = eligibleAbilities.filter((ability) => {
    const types = ability.types ?? []

    return (
      types.length === 0 ||
      types.includes(type1) ||
      Boolean(type2 && types.includes(type2))
    )
  })

  const scored = compatibleAbilities.map((ability, index) => {
    const tags = new Set(ability.tags ?? [])
    const types = ability.types ?? []
    let score = 0

    for (const tag of roleTags) {
      if (tags.has(tag)) score += 2.4
    }

    if (types.includes(type1)) score += 4.5
    if (type2 && types.includes(type2)) score += 3.5

    // Un léger départage stable évite le biais systématique vers le premier talent du catalogue.
    score += hash01(`${seed}|ability|${ability.name}|${index}`) * 2.2

    return { ability, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.ability ?? null
}

function selectOfficialMove({
  moves,
  type1,
  type2,
  role,
  offensiveOrientation,
  seed,
  salt = 'primary',
  excludeNames = [],
}) {
  const roleTags = new Set(ROLE_TAGS[role] ?? ['utility'])
  const preferredCategory = normalizeCategory(offensiveOrientation, role)

  const excluded = new Set(excludeNames.filter(Boolean))

  const eligibleMoves = moves.filter((move) => (
    move.eligible_v1 !== false &&
    !excluded.has(move.name)
  ))

  const compatibleMoves = eligibleMoves.filter((move) => (
    move.type === type1 ||
    Boolean(type2 && move.type === type2) ||
    move.type === 'Normal'
  ))

  const pool = compatibleMoves.length > 0
    ? compatibleMoves
    : eligibleMoves

  const scored = pool.map((move, index) => {
    const tags = new Set(move.tags ?? [])
    let score = 0

    if (move.type === type1) score += 4.2
    if (type2 && move.type === type2) score += 3.6
    if (move.type === 'Normal') score += 0.8

    if (move.category === preferredCategory) score += 3.2

    if (
      offensiveOrientation === 'Mixte' &&
      (move.category === 'Physique' || move.category === 'Spéciale')
    ) {
      score += 1.2
    }

    for (const tag of roleTags) {
      if (tags.has(tag)) score += 1.8
    }

    score += hash01(`${seed}|move|${salt}|${move.name}|${index}`) * 1.8

    return { move, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.move ?? null
}

function buildHiddenAbility({
  dominantBigFive,
  dominantAxis,
  role,
  type1,
  type2,
}) {
  const base = AXIS_EFFECTS[dominantAxis] ?? AXIS_EFFECTS['Mystère']
  const typeText = type2 ? `${type1}/${type2}` : type1

  return {
    name: null,
    name_policy: 'AI_GENERATED',
    official: false,
    trigger: base.trigger,
    condition: base.trigger,
    effect: base.effect,
    magnitude: 'modérée et limitée à un déclenchement tactiquement significatif',
    role_synergy: role,
    type_synergy: typeText,
    tags: base.tags,
    thematic_origin: `${dominantBigFive} + ${dominantAxis}`,
    description: null,
    mechanic_brief: {
      trigger: base.trigger,
      effect: base.effect,
      magnitude: 'modérée et limitée à un déclenchement tactiquement significatif',
      combat_role: role,
      primary_type: type1,
      secondary_type: type2 ?? null,
      dominant_big_five: dominantBigFive,
      dominant_hidden_axis: dominantAxis,
      tags: base.tags,
    },
    generation_brief: {
      policy: 'AI_GENERATED_FROM_CANONICAL_BRIEF',
      language: 'fr',
      talent_kind: 'hidden-original',
      combat_role: role,
      primary_type: type1,
      secondary_type: type2 ?? null,
      dominant_big_five: dominantBigFive,
      dominant_hidden_axis: dominantAxis,
      themes: [
        dominantBigFive,
        dominantAxis,
        type1,
        ...(type2 ? [type2] : []),
        role,
      ],
      canonical_mechanic: {
        trigger: base.trigger,
        effect: base.effect,
        magnitude: 'modérée et limitée à un déclenchement tactiquement significatif',
        tags: base.tags,
      },
      name_requirements: {
        min_words: 1,
        max_words: 4,
        language: 'fr',
        natural_french: true,
        original_name: true,
        avoid_existing_official_ability_names: true,
        avoid_generic_animal_type_concatenation: true,
        avoid_repetitive_generic_starters: [
          'Instinct',
          'Aura',
          'Pouvoir',
          'Force',
          'Esprit',
        ],
      },
      writing_requirements: {
        generate_name: true,
        generate_description: true,
        generate_effect_wording: true,
        preserve_trigger: true,
        preserve_effect: true,
        preserve_magnitude: true,
        preserve_role: true,
        preserve_types: true,
        do_not_invent_new_mechanics: true,
      },
    },
  }
}

function buildAnimalMove({
  animal,
  type1,
  role,
  offensiveOrientation,
  seed,
}) {
  const reference = getAnimalReference(animal)
  const morphologyVariant = selectAnimalMorphologyVariant({ animal, seed })
  const features = morphologyVariant?.signature_features?.length
    ? morphologyVariant.signature_features
    : reference.signature_features?.length
      ? reference.signature_features
      : reference.markers

  const feature = pickDeterministic(
    features,
    seed,
    'animal-feature'
  )

  const category = normalizeCategory(offensiveOrientation, role)
  const power = powerFor(category, role)

  return {
    name: buildAnimalMoveName({
      animal,
      seed,
      category,
    }),
    type: type1,
    category,
    power,
    accuracy: category === 'Statut' ? null : 100,
    origin: 'animal-original',
    official: false,
    anatomical_source: feature,
    lexical_source: {
      family: 'animal',
      animal,
      version: moveLexicon.version,
    },
    description: buildAnimalMoveDescription({
      animal,
      feature,
      seed,
    }),
    effect:
      category === 'Statut'
        ? 'modifie le rythme du combat de manière cohérente avec le rôle, sans créer de nouvelle anatomie'
        : role === 'Éclaireur'
          ? 'si l’attaque touche, augmente légèrement la Vitesse au tour suivant'
          : role === 'Défenseur' || role === 'Protecteur'
            ? 'réduit légèrement les dégâts reçus jusqu’au prochain tour'
            : 'inflige des dégâts et exploite un comportement ou un trait biologique caractéristique',
  }
}

function buildTypeMove({
  type1,
  role,
  offensiveOrientation,
  seed = type1,
}) {
  const reference = getTypeReference(type1)
  const category = normalizeCategory(offensiveOrientation, role)
  const power = powerFor(category, role)

  return {
    name: buildTypeMoveName({
      type1,
      seed,
      category,
    }),
    type: type1,
    category,
    power,
    accuracy: category === 'Statut' ? null : 100,
    origin: 'type-original',
    official: false,
    lexical_source: {
      family: 'type',
      type: type1,
      version: moveLexicon.version,
    },
    energy_effect: reference.energy_effect,
    effect_shape: reference.signature_effect_shape,
    description: buildTypeMoveDescription({
      type1,
      seed,
    }),
    effect:
      category === 'Statut'
        ? `crée un effet tactique inspiré de ${reference.identity.toLowerCase()} et cohérent avec le rôle ${role}`
        : 'inflige des dégâts en exprimant l’identité énergétique du type principal',
  }
}

function buildSignatureMove({
  animal,
  type1,
  type2,
  role,
  offensiveOrientation,
  seed,
}) {
  const animalReference = getAnimalReference(animal)
  const morphologyVariant = selectAnimalMorphologyVariant({ animal, seed })
  const typeReference = getTypeReference(type1)
  const features = morphologyVariant?.signature_features?.length
    ? morphologyVariant.signature_features
    : animalReference.signature_features?.length
      ? animalReference.signature_features
      : animalReference.markers

  const feature = features[Math.floor(hash01(`${seed}|signature-feature`) * features.length)]
  const category = normalizeCategory(offensiveOrientation, role)
  const power = powerFor(category, role, true)
  const mechanicBrief =
    category === 'Statut'
      ? `effet signature de contrôle ou de soutien adapté au rôle ${role}`
      : role === 'Berserker'
        ? 'attaque très puissante avec un contrecoup défensif léger après utilisation'
        : role === 'Contrôleur'
          ? 'attaque infligeant des dégâts avec une gêne tactique légère'
          : 'attaque infligeant des dégâts avec un bonus secondaire modéré cohérent avec le rôle'

  return {
    name: null,
    name_policy: 'AI_GENERATED',
    type: type1,
    secondary_type: type2 ?? null,
    category,
    power,
    accuracy: category === 'Statut' ? null : 95,
    origin: 'signature-original',
    official: false,
    is_signature: true,
    anatomical_source: feature,
    energy_origin: type1,
    effect_shape: typeReference.signature_effect_shape,
    description: null,
    effect: null,
    mechanic_brief: mechanicBrief,
    generation_brief: {
      policy: 'AI_GENERATED_FROM_CANONICAL_BRIEF',
      language: 'fr',
      animal_source: animal,
      animal_morphology_variant: morphologyVariant?.label ?? null,
      primary_type: type1,
      secondary_type: type2 ?? null,
      combat_role: role,
      category,
      power,
      accuracy: category === 'Statut' ? null : 95,
      anatomical_source: feature,
      anatomical_source_label: cleanFeatureLabel(feature),
      type_identity: typeReference.identity,
      energy_effect: typeReference.energy_effect,
      effect_shape: typeReference.signature_effect_shape,
      mechanic: mechanicBrief,
      name_requirements: {
        min_words: 2,
        max_words: 4,
        language: 'fr',
        natural_french: true,
        original_name: true,
        avoid_existing_official_move_names: true,
        avoid_generic_animal_type_concatenation: true,
        avoid_systematic_superlatives: [
          'Apogée',
          'Ultime',
          'Suprême',
        ],
      },
      writing_requirements: {
        generate_name: true,
        generate_description: true,
        generate_effect_wording: true,
        preserve_type: true,
        preserve_category: true,
        preserve_power: true,
        preserve_anatomy: true,
        do_not_invent_permanent_anatomy: true,
      },
    },
  }
}

function buildOriginalCombatKit({
  animal,
  type1,
  type2,
  role,
  offensiveOrientation,
  seed,
  dominantBigFive,
  dominantAxis,
}) {
  /*
    Une seule attaque standard est originale.
    Elle peut être construite depuis :
    - un trait anatomique / comportemental de l'animal ;
    - l'identité énergétique du type principal.

    Le choix est déterministe pour un même DNA.
  */
  const originalMoveMode =
    hash01(`${seed}|original-move-mode`) < 0.5
      ? 'animal'
      : 'type'

  const originalMove =
    originalMoveMode === 'animal'
      ? buildAnimalMove({
          animal,
          type1,
          role,
          offensiveOrientation,
          seed,
        })
      : buildTypeMove({
          type1,
          role,
          offensiveOrientation,
          seed,
        })

  return {
    hiddenAbility: buildHiddenAbility({
      dominantBigFive,
      dominantAxis,
      role,
      type1,
      type2,
    }),
    originalMoveMode,
    originalMove,
    signatureMove: buildSignatureMove({
      animal,
      type1,
      type2,
      role,
      offensiveOrientation,
      seed,
    }),
  }
}

module.exports = {
  ROLE_TAGS,
  selectMainAbility,
  selectOfficialMove,
  buildHiddenAbility,
  buildAnimalMove,
  buildTypeMove,
  buildSignatureMove,
  buildOriginalCombatKit,
}
