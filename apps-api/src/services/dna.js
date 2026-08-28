const crypto =
  require('crypto')

const animals =
  require('../data/animals.json')

const animalBiology =
  require('../data/animalBiology.json')

const types =
  require('../data/types.json')

const {
  catalog: officialCatalog,
} = require(
  './officialCatalog'
)

const {
  selectMainAbility,
  selectOfficialMove,
  buildOriginalCombatKit,
} = require('./combatDesign')

const {
  buildNarrative,
} = require('./narrativeDesign')

const animalByName =
  new Map(
    animals.map(
      (animal) => [
        animal.name,
        animal,
      ]
    )
  )

const typeByName =
  new Map(
    types.map(
      (type) => [
        type.name,
        type,
      ]
    )
  )

const animalBiologyByName =
  new Map(
    animalBiology.map(
      (profile) => [
        profile.name,
        profile,
      ]
    )
  )

const TYPE_VISUAL_OVERRIDES = {
  Feu: {
    presence: 85,
    softness: 25,
    threat: 70,
    majesty: 65,
    complexity: 55,
    originality: 60,
    expressiveness: 75,
    energy: 95,
    singularity: 70,
    cuteness: 35,
  },

  Eau: {
    presence: 60,
    softness: 75,
    threat: 35,
    majesty: 70,
    complexity: 60,
    originality: 65,
    expressiveness: 65,
    energy: 55,
    singularity: 65,
    cuteness: 60,
  },

  Psy: {
    presence: 65,
    softness: 50,
    threat: 45,
    majesty: 80,
    complexity: 85,
    originality: 90,
    expressiveness: 55,
    energy: 50,
    singularity: 95,
    cuteness: 45,
  },
}

const ANIMAL_VISUAL_OVERRIDES = {
  Lion: {
    presence: 90,
    softness: 45,
    threat: 80,
    majesty: 85,
    complexity: 50,
    originality: 45,
    expressiveness: 70,
    energy: 75,
    singularity: 65,
    cuteness: 45,
  },

  Dragon: {
    presence: 95,
    softness: 25,
    threat: 85,
    majesty: 95,
    complexity: 85,
    originality: 80,
    expressiveness: 55,
    energy: 80,
    singularity: 95,
    cuteness: 25,
  },

  Dauphin: {
    presence: 60,
    softness: 85,
    threat: 25,
    majesty: 60,
    complexity: 45,
    originality: 55,
    expressiveness: 90,
    energy: 85,
    singularity: 60,
    cuteness: 90,
  },
}

const ROLE_TARGETS = {
  Assaillant: [
    90,
    55,
    25,
    65,
  ],

  Berserker: [
    100,
    30,
    15,
    60,
  ],

  Éclaireur: [
    60,
    65,
    40,
    100,
  ],

  Contrôleur: [
    45,
    95,
    65,
    55,
  ],

  Spécialiste: [
    70,
    100,
    35,
    55,
  ],

  Défenseur: [
    35,
    55,
    65,
    25,
  ],

  Protecteur: [
    35,
    55,
    100,
    40,
  ],

  Adaptateur: [
    60,
    75,
    70,
    75,
  ],

  Hybride: [
    70,
    70,
    70,
    70,
  ],
}

function clamp(
  value,
  min = 0,
  max = 100
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  )
}

function createSeed(...parts) {
  const raw =
    JSON.stringify(parts)

  const hash =
    crypto
      .createHash('sha256')
      .update(raw)
      .digest('hex')

  /*
    On limite volontairement la valeur
    afin de rester dans une zone sûre
    pour les nombres JavaScript.
  */
  return Number.parseInt(
    hash.slice(0, 12),
    16
  )
}

function createSeededRandom(seed) {
  let state =
    seed >>> 0

  return function random() {
    state += 0x6d2b79f5

    let value = state

    value =
      Math.imul(
        value ^
          (value >>> 15),
        value | 1
      )

    value ^=
      value +
      Math.imul(
        value ^
          (value >>> 7),
        value | 61
      )

    return (
      (
        value ^
        (value >>> 14)
      ) >>>
      0
    ) / 4294967296
  }
}

function randomBetween(
  random,
  min,
  max
) {
  return (
    min +
    random() *
      (max - min)
  )
}

function euclideanDistance(
  values,
  target
) {
  let total = 0

  for (
    let index = 0;
    index < values.length;
    index += 1
  ) {
    const difference =
      values[index] -
      target[index]

    total +=
      difference *
      difference
  }

  return Math.sqrt(total)
}

function getDominantLabel(
  labels,
  values
) {
  let bestIndex = 0

  for (
    let index = 1;
    index < values.length;
    index += 1
  ) {
    if (
      values[index] >
      values[bestIndex]
    ) {
      bestIndex = index
    }
  }

  return labels[bestIndex]
}

function calculateCombat({
  personality,
  temperament,
  visual,
  animal,
  type1,
  type2,
  seed,
}) {
  const {
    O,
    C,
    E,
    A,
  } = personality

  const {
    R,
    L,
    P,
    H,
    I,
    M,
  } = temperament

  /*
    4 axes COMBAT verrouillés
  */
  const offense =
    clamp(
      0.45 * P +
      0.30 * I +
      0.15 * R +
      0.10 * E
    )

  const technique =
    clamp(
      0.35 * M +
      0.25 * R +
      0.20 * O +
      0.10 * L +
      0.10 * C
    )

  const support =
    clamp(
      0.45 * H +
      0.20 * A +
      0.15 * M +
      0.10 * C +
      0.10 * L
    )

  const mobility =
    clamp(
      0.45 * L +
      0.30 * R +
      0.15 * E +
      0.10 * I
    )

  const combatDimensions = [
    offense,
    technique,
    support,
    mobility,
  ]

  /*
    Choix du rôle le plus proche
    parmi les 9 rôles verrouillés.
  */
  let role = null
  let roleDistance =
    Number.POSITIVE_INFINITY

  for (
    const [
      roleName,
      target,
    ] of Object.entries(
      ROLE_TARGETS
    )
  ) {
    const distance =
      euclideanDistance(
        combatDimensions,
        target
      )

    if (
      distance <
      roleDistance
    ) {
      role =
        roleName

      roleDistance =
        distance
    }
  }

  /*
    Affinités biologiques
    du Playground V1.0.
  */
  const animalVisual =
    getAnimalVisualBase(
      animal
    )

  const animalPhysical =
    clamp(
      0.55 *
        animalVisual.presence +
      0.45 *
        animalVisual.threat
    )

  const animalSpecial =
    clamp(
      0.55 *
        animalVisual.singularity +
      0.45 *
        animalVisual.complexity
    )

  const animalDefense =
    clamp(
      0.60 *
        animalVisual.presence +
      0.40 *
        (
          100 -
          animalVisual.energy
        )
    )

  const animalSpeed =
    animalVisual.energy

  const animalEndurance =
    clamp(
      0.55 *
        animalVisual.presence +
      0.45 *
        animalVisual.majesty
    )

  const typeVisual =
    mixTypeVisual(
      type1,
      type2
    )

  const typePhysical =
    clamp(
      0.55 *
        typeVisual.threat +
      0.45 *
        typeVisual.energy
    )

  const typeSpecial =
    clamp(
      0.55 *
        typeVisual.singularity +
      0.45 *
        typeVisual.complexity
    )

  const typeSpecialDefense =
    clamp(
      0.50 *
        typeVisual.majesty +
      0.50 *
        typeVisual.softness
    )

  /*
    Orientation offensive.
  */
  const physical =
    clamp(
      0.40 * P +
      0.20 * I +
      0.15 * C +
      0.15 *
        animalPhysical +
      0.10 *
        typePhysical
    )

  const special =
    clamp(
      0.30 * M +
      0.25 * O +
      0.20 * R +
      0.15 *
        typeSpecial +
      0.10 *
        animalSpecial
    )

  let offensiveOrientation =
    'Mixte'

  if (
    physical >
    special + 10
  ) {
    offensiveOrientation =
      'Physique'
  } else if (
    special >
    physical + 10
  ) {
    offensiveOrientation =
      'Spéciale'
  }

  /*
    Complexité de combat.
  */
  const combatComplexity =
    clamp(
      0.35 *
        technique +
      0.25 * O +
      0.20 * M +
      0.10 * C +
      0.10 * R
    )

  /*
    BST
    Référence du Playground :
    450–650.
  */
  const bstBase =
    clamp(
      470 +
        0.45 *
          visual.presence +
        0.35 *
          visual.majesty +
        0.25 *
          visual.singularity +
        0.20 *
          combatComplexity,
      450,
      650
    )

  const bstRandom =
    createSeededRandom(
      seed + 7
    )

  const bst =
    Math.trunc(
      clamp(
        Math.round(
          bstBase +
            randomBetween(
              bstRandom,
              -10,
              10
            )
        ),
        450,
        650
      )
    )

  /*
    Poids des 6 statistiques.
  */
  const statWeights = {
    PV:
      0.25 *
        support +
      0.20 * H +
      0.15 * C +
      0.15 *
        animalEndurance +
      0.15 *
        visual.presence +
      0.10 *
        (
          100 -
          mobility
        ),

    Attaque:
      0.40 *
        offense +
      0.25 *
        physical +
      0.15 * P +
      0.10 * I +
      0.10 *
        animalPhysical,

    Défense:
      0.30 * C +
      0.20 *
        support +
      0.20 *
        animalDefense +
      0.15 * H +
      0.15 *
        (
          100 -
          mobility
        ),

    'Attaque Spéciale':
      0.35 *
        technique +
      0.25 *
        special +
      0.15 * M +
      0.15 * O +
      0.10 *
        typeSpecial,

    'Défense Spéciale':
      0.25 *
        support +
      0.20 * M +
      0.20 * C +
      0.15 * H +
      0.10 *
        typeSpecialDefense +
      0.10 * O,

    Vitesse:
      0.45 *
        mobility +
      0.20 * R +
      0.15 * L +
      0.10 * E +
      0.10 *
        animalSpeed,
  }

  /*
    Allocation du BST avec
    minimum de 35 par stat.
  */
  const statFloor = 35

  const remaining =
    bst -
    statFloor * 6

  const weightTotal =
    Object.values(
      statWeights
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    )

  const stats = {}

  for (
    const [
      statName,
      weight,
    ] of Object.entries(
      statWeights
    )
  ) {
    stats[statName] =
      statFloor +
      Math.round(
        remaining *
          weight /
          weightTotal
      )
  }

  /*
    Corrige l'arrondi pour que
    la somme soit exactement BST.
  */
  const statsTotal =
    Object.values(
      stats
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    )

  stats.PV +=
    bst -
    statsTotal

  /*
    Tags désirés selon rôle.
  */
  const desiredTags =
    new Set()

  if (
    role ===
      'Protecteur' ||
    role ===
      'Défenseur'
  ) {
    for (
      const tag of [
        'defense',
        'support',
        'heal',
        'protect',
      ]
    ) {
      desiredTags.add(tag)
    }
  } else if (
    role ===
      'Contrôleur' ||
    role ===
      'Spécialiste'
  ) {
    for (
      const tag of [
        'control',
        'technique',
        'status',
        'utility',
      ]
    ) {
      desiredTags.add(tag)
    }
  } else if (
    role ===
    'Éclaireur'
  ) {
    desiredTags.add(
      'mobility'
    )

    desiredTags.add(
      'utility'
    )
  } else {
    desiredTags.add(
      'offense'
    )

    desiredTags.add(
      offensiveOrientation ===
        'Physique'
        ? 'physical'
        : 'special'
    )
  }

  /*
    Talent principal officiel.
    Le catalogue reste versionné et
    externe au moteur ; le départage
    est déterministe et tient compte
    du rôle, des types et de
    l'orientation offensive.
  */
  const mainAbility =
    selectMainAbility({
      abilities:
        officialCatalog.abilities,
      type1,
      type2,
      role,
      offensiveOrientation,
      seed,
    })

  /*
    Deux capacités officielles existantes distinctes.
    Elles constituent désormais les attaques standard 2 et 3.
  */
  const officialMove1 =
    selectOfficialMove({
      moves:
        officialCatalog.moves,
      type1,
      type2,
      role,
      offensiveOrientation,
      seed,
      salt:
        'official-standard-1',
    })

  const officialMove2 =
    selectOfficialMove({
      moves:
        officialCatalog.moves,
      type1,
      type2,
      role,
      offensiveOrientation,
      seed,
      salt:
        'official-standard-2',
      excludeNames: [
        officialMove1?.name,
      ],
    })

  /*
    Traits dominants pour le
    talent caché personnalisé.
  */
  const dominantBigFive =
    getDominantLabel(
      [
        'Ouverture',
        'Conscienciosité',
        'Extraversion',
        'Agréabilité',
        'Neuroticisme',
      ],
      [
        personality.O,
        personality.C,
        personality.E,
        personality.A,
        personality.N,
      ]
    )

  const dominantAxis =
    getDominantLabel(
      [
        'Réactivité',
        'Liberté',
        'Puissance',
        'Harmonie',
        'Intensité',
        'Mystère',
      ],
      [
        temperament.R,
        temperament.L,
        temperament.P,
        temperament.H,
        temperament.I,
        temperament.M,
      ]
    )

  const originalKit =
    buildOriginalCombatKit({
      animal,
      type1,
      type2,
      role,
      offensiveOrientation,
      seed,
      dominantBigFive,
      dominantAxis,
    })

  /*
    Exactement quatre attaques visibles :
    1. une attaque originale créée à partir SOIT de l'animal, SOIT du type ;
    2. une capacité officielle existante ;
    3. une seconde capacité officielle existante, différente de la précédente ;
    4. l'attaque signature originale, affichée dans son panneau séparé.
  */
  const moves = {
    original_move:
      originalKit.originalMove,

    official_move_1:
      officialMove1
        ? {
            ...officialMove1,
            origin:
              'official-existing',
            official:
              true,
          }
        : null,

    official_move_2:
      officialMove2
        ? {
            ...officialMove2,
            origin:
              'official-existing',
            official:
              true,
          }
        : null,

    signature_move:
      originalKit.signatureMove,
  }

  const hiddenAbility =
    originalKit.hiddenAbility


  return {
    offense:
      Number(
        offense.toFixed(1)
      ),

    technique:
      Number(
        technique.toFixed(1)
      ),

    support:
      Number(
        support.toFixed(1)
      ),

    mobility:
      Number(
        mobility.toFixed(1)
      ),

    combat_complexity:
      Number(
        combatComplexity.toFixed(1)
      ),

    role,

    physical_affinity:
      Number(
        physical.toFixed(1)
      ),

    special_affinity:
      Number(
        special.toFixed(1)
      ),

    offensive_orientation:
      offensiveOrientation,

    bst,

    stats,

    main_ability:
      mainAbility,

    hidden_ability:
      hiddenAbility,

    moves,
  }
}

function calculateBiology({
  animal,
  animalBucket,
  type1,
  type2,
  visual,
}) {
  const reference =
    animalBiologyByName.get(
      animal
    )

  if (!reference) {
    throw new Error(
      `Référentiel biologique absent pour ${animal}.`
    )
  }

  const complexity =
    visual.complexity

  let signatureCount = 1

  if (complexity >= 75) {
    signatureCount = 3
  } else if (
    complexity >= 40
  ) {
    signatureCount = 2
  }

  const typeMarkers = [
    type1,
    type2,
  ].filter(Boolean)

  const signatureAnatomy =
    reference.signature_features
      .slice(
        0,
        signatureCount
      )

  return {
    reference_version:
      reference.version,

    body_plan:
      reference.body_plan,

    locomotion: [
      ...reference.locomotion,
    ],

    limbs: {
      count:
        reference.limb_count,

      configuration:
        reference.limb_configuration,

      extremities:
        reference.extremities,
    },

    tail: {
      present:
        reference.tail_present,

      count:
        reference.tail_count,

      description:
        reference.tail,
    },

    head: {
      shape:
        reference.head,

      ears:
        reference.ears,

      horns: [
        ...(reference.horns ?? []),
      ],

      crest:
        reference.crest,
    },

    appendages: [
      ...(reference.appendages ?? []),
    ],

    proportions: {
      ...reference.proportions,
    },

    silhouette:
      reference.silhouette,

    primary_surface:
      reference.primary_surface,

    secondary_surface:
      reference.secondary_surface,

    accent_surface:
      reference.accent_surface,

    animal_markers: [
      ...reference.markers,
    ],

    type_markers:
      typeMarkers,

    signature_anatomy:
      signatureAnatomy,

    height_m:
      reference.height_m,

    weight_kg:
      reference.weight_kg,

    footprint_type:
      reference.footprint_type,

    animal_bucket:
      animalBucket,
  }
}

function generateNameCandidates({
  animal,
  type1,
  type2,
  seed,
}) {
  const animalRoot =
    animal.replace(
      /\s+/g,
      ''
    )

  const secondType =
    type2 ?? ''

  const rawCandidates = [
    `${animalRoot.slice(0, 3)}${type1.slice(0, 3)}a`,

    `${type1.slice(0, 3)}${animalRoot.slice(-3)}is`,

    secondType
      ? `${animalRoot.slice(0, 2)}${secondType.slice(0, 3)}${type1.slice(-2)}on`
      : `${animalRoot.slice(0, 4)}ory`,

    `${type1.slice(0, 2)}${animalRoot.slice(0, 4)}el`,

    `${animalRoot.slice(0, 3)}y${type1.slice(0, 2)}a`,

    `${type1.slice(-3)}${animalRoot.slice(0, 3)}ys`,
  ]

  const candidates = []

  for (
    const rawName of
    rawCandidates
  ) {
    let cleaned =
      rawName
        .replace(
          /[^A-Za-zÀ-ÿ]/g,
          ''
        )
        .slice(0, 11)

    if (
      cleaned.length < 5
    ) {
      cleaned =
        `${cleaned}oryx`
          .slice(0, 7)
    }

    cleaned =
      cleaned
        .charAt(0)
        .toUpperCase() +
      cleaned
        .slice(1)
        .toLowerCase()

    if (
      !candidates.includes(
        cleaned
      )
    ) {
      candidates.push(
        cleaned
      )
    }
  }

  while (
    candidates.length < 6
  ) {
    const suffix =
      candidates.length

    candidates.push(
      `${animalRoot
        .slice(0, 3)
        .charAt(0)
        .toUpperCase()}${animalRoot
        .slice(1, 3)
        .toLowerCase()}yx${suffix}`
    )
  }

  /*
    Tirage uniforme déterministe
    parmi les 6 candidats.
  */
  const random =
    createSeededRandom(
      seed + 23
    )

  const selectedIndex =
    Math.floor(
      random() *
        candidates.length
    )

  return {
    candidates,
    selected:
      candidates[
        selectedIndex
      ],
  }
}

function calculateNarrative(args) {
  return buildNarrative(args)
}

function getTypeVisualBase(
  name
) {
  if (
    TYPE_VISUAL_OVERRIDES[
      name
    ]
  ) {
    return {
      ...TYPE_VISUAL_OVERRIDES[
        name
      ],
    }
  }

  const type =
    typeByName.get(name)

  if (!type) {
    throw new Error(
      `Type inconnu dans DNA : ${name}`
    )
  }

  const {
    R,
    L,
    P,
    H,
    I,
    M,
  } = type

  return {
    presence:
      clamp(
        0.35 * P +
          0.25 * I +
          0.2 * R +
          0.2 * 50
      ),

    softness:
      clamp(
        0.35 * H +
          0.25 * (100 - P) +
          0.2 * (100 - I) +
          0.2 * 50
      ),

    threat:
      clamp(
        0.35 * P +
          0.3 * I +
          0.2 * (100 - H) +
          0.15 * 50
      ),

    majesty:
      clamp(
        0.25 * P +
          0.25 * M +
          0.2 * H +
          0.3 * 50
      ),

    complexity:
      clamp(
        0.35 * M +
          0.2 * R +
          0.15 * L +
          0.3 * 50
      ),

    originality:
      clamp(
        0.4 * M +
          0.25 * L +
          0.15 * R +
          0.2 * 50
      ),

    expressiveness:
      clamp(
        0.3 * R +
          0.25 * H +
          0.2 * I +
          0.25 * 50
      ),

    energy:
      clamp(
        0.35 * I +
          0.3 * R +
          0.2 * L +
          0.15 * 50
      ),

    singularity:
      clamp(
        0.4 * M +
          0.2 * I +
          0.15 * L +
          0.25 * 50
      ),

    cuteness:
      clamp(
        0.3 * H +
          0.2 * (100 - P) +
          0.15 * (100 - I) +
          0.35 * 50
      ),
  }
}

function getAnimalVisualBase(
  name
) {
  if (
    ANIMAL_VISUAL_OVERRIDES[
      name
    ]
  ) {
    return {
      ...ANIMAL_VISUAL_OVERRIDES[
        name
      ],
    }
  }

  const animal =
    animalByName.get(name)

  if (!animal) {
    throw new Error(
      `Animal inconnu dans DNA : ${name}`
    )
  }

  const {
    O,
    C,
    E,
    A,
    N,
  } = animal.big5

  const bucket =
    animal.bucket

  const bucketPresence = {
    mythical: 78,
    terrestrial: 62,
    marine: 58,
    aerial: 55,
    insect: 45,
  }[bucket] ?? 55

  return {
    presence:
      clamp(
        0.45 *
          bucketPresence +
          0.25 * E +
          0.15 * C +
          0.15 * 50
      ),

    softness:
      clamp(
        0.35 * A +
          0.25 *
            (100 - N) +
          0.2 * 50 +
          0.2 *
            (100 - E)
      ),

    threat:
      clamp(
        0.3 *
          (100 - A) +
          0.25 * E +
          0.2 * N +
          0.25 *
            (
              bucket ===
              'mythical'
                ? 100
                : 45
            )
      ),

    majesty:
      clamp(
        0.3 * O +
          0.25 * C +
          0.25 *
            bucketPresence +
          0.2 * 50
      ),

    complexity:
      clamp(
        0.35 * O +
          0.25 * C +
          0.2 * 50 +
          0.2 *
            (
              bucket ===
                'mythical' ||
              bucket ===
                'insect'
                ? 70
                : 45
            )
      ),

    originality:
      clamp(
        0.45 * O +
          0.2 * N +
          0.2 * 50 +
          0.15 *
            (
              bucket ===
              'mythical'
                ? 75
                : 50
            )
      ),

    expressiveness:
      clamp(
        0.35 * E +
          0.3 * A +
          0.2 * 50 +
          0.15 *
            (100 - N)
      ),

    energy:
      clamp(
        0.35 * E +
          0.25 * O +
          0.2 * 50 +
          0.2 *
            (100 - N)
      ),

    singularity:
      clamp(
        0.4 * O +
          0.2 * N +
          0.2 * 50 +
          0.2 *
            (
              bucket ===
              'mythical'
                ? 90
                : 45
            )
      ),

    cuteness:
      clamp(
        0.35 * A +
          0.2 *
            (100 - N) +
          0.15 *
            (100 - E) +
          0.3 * 50
      ),
  }
}

function mixTypeVisual(
  type1,
  type2
) {
  const first =
    getTypeVisualBase(
      type1
    )

  if (!type2) {
    return first
  }

  const second =
    getTypeVisualBase(
      type2
    )

  const mixed = {}

  for (
    const key of
    Object.keys(first)
  ) {
    mixed[key] =
      0.65 * first[key] +
      0.35 * second[key]
  }

  return mixed
}

function calculateVisual({
  personality,
  temperament,
  animal,
  type1,
  type2,
  seed,
}) {
  const {
    O,
    C,
    E,
    A,
  } = personality

  const {
    R,
    L,
    P,
    H,
    I,
    M,
  } = temperament

  const animalVisual =
    getAnimalVisualBase(
      animal
    )

  const typeVisual =
    mixTypeVisual(
      type1,
      type2
    )

  const visual = {}

  visual.presence =
    0.2 * E +
    0.2 * P +
    0.15 * I +
    0.1 * C +
    0.2 *
      animalVisual.presence +
    0.15 *
      typeVisual.presence

  visual.softness =
    0.2 * A +
    0.2 * H +
    0.1 * (100 - P) +
    0.1 * (100 - I) +
    0.25 *
      animalVisual.softness +
    0.15 *
      typeVisual.softness

  visual.threat =
    0.2 * P +
    0.2 * I +
    0.1 * (100 - A) +
    0.1 * (100 - H) +
    0.25 *
      animalVisual.threat +
    0.15 *
      typeVisual.threat

  visual.majesty =
    0.15 * O +
    0.15 * C +
    0.15 * P +
    0.15 * M +
    0.25 *
      animalVisual.majesty +
    0.15 *
      typeVisual.majesty

  visual.complexity =
    0.25 * O +
    0.2 * M +
    0.15 * C +
    0.25 *
      animalVisual.complexity +
    0.15 *
      typeVisual.complexity

  visual.morphological_originality =
    0.3 * O +
    0.25 * M +
    0.15 * L +
    0.2 *
      animalVisual.originality +
    0.1 *
      typeVisual.originality

  visual.expressiveness =
    0.25 * E +
    0.2 * A +
    0.15 * R +
    0.25 *
      animalVisual.expressiveness +
    0.15 *
      typeVisual.expressiveness

  visual.visual_energy =
    0.25 * I +
    0.2 * R +
    0.15 * E +
    0.1 * L +
    0.2 *
      animalVisual.energy +
    0.1 *
      typeVisual.energy

  visual.singularity =
    0.25 * O +
    0.25 * M +
    0.15 * I +
    0.2 *
      animalVisual.singularity +
    0.15 *
      typeVisual.singularity

  for (
    const key of
    Object.keys(visual)
  ) {
    visual[key] =
      clamp(
        visual[key]
      )
  }

  visual.cuteness =
    clamp(
      0.15 * A +
        0.15 * H +
        0.15 *
          visual.expressiveness +
        0.15 *
          visual.softness +
        0.1 *
          (
            100 -
            visual.threat
          ) +
        0.2 *
          animalVisual.cuteness +
        0.1 *
          typeVisual.cuteness
    )

  const random =
    createSeededRandom(
      seed
    )

  for (
    const key of
    Object.keys(visual)
  ) {
    visual[key] =
      Number(
        clamp(
          visual[key] +
            randomBetween(
              random,
              -5,
              5
            )
        ).toFixed(1)
      )
  }

  visual.symmetry =
    Number(
      clamp(
        75 +
          0.15 * C -
          0.1 *
            visual
              .morphological_originality -
          0.1 *
            visual
              .singularity +
          randomBetween(
            random,
            -5,
            5
          ),
        55,
        100
      ).toFixed(1)
    )

  visual.angularness =
    Number(
      clamp(
        0.25 *
          visual.threat +
          0.2 * P +
          0.15 * C +
          0.2 *
            (
              100 -
              typeVisual.softness
            ) +
          0.2 *
            (
              100 -
              animalVisual.softness
            )
      ).toFixed(1)
    )

  visual.roundness =
    Number(
      clamp(
        0.3 *
          visual.softness +
          0.25 *
            visual.cuteness +
          0.15 * H +
          0.15 *
            animalVisual.softness +
          0.15 *
            typeVisual.softness
      ).toFixed(1)
    )

  visual.verticality =
    Number(
      clamp(
        0.3 *
          visual.majesty +
          0.2 *
            visual.presence +
          0.15 * P +
          0.15 * C +
          0.2 *
            animalVisual.presence
      ).toFixed(1)
    )

  visual.width =
    Number(
      clamp(
        0.3 *
          visual.presence +
          0.2 * P +
          0.2 *
            animalVisual.presence +
          0.15 *
            visual.threat +
          0.15 *
            typeVisual.presence
      ).toFixed(1)
    )

  visual.flow =
    Number(
      clamp(
        0.25 * L +
          0.25 *
            visual.visual_energy +
          0.2 * R +
          0.15 * O +
          0.15 *
            typeVisual.energy
      ).toFixed(1)
    )

  return visual
}

function buildDnaBase({
  assessmentId,
  scores,
  classification,
  scoringVersion,
  animalEngineVersion,
  typeEngineVersion,
}) {
  const personality = {
    O: scores.O,
    C: scores.C,
    E: scores.E,
    A: scores.A,
    N: scores.N,
  }

  const temperament = {
    R: scores.R,
    L: scores.L,
    P: scores.P,
    H: scores.H,
    I: scores.I,
    M: scores.M,
  }

  const animal =
    classification.animal.name

  const animalBucket =
    classification.animal.bucket

  const type1 =
    classification.types[0]

  const type2 =
    classification.types[1] ??
    null

  if (!type1) {
    throw new Error(
      'DNA impossible : Type 1 absent.'
    )
  }

  const seed =
    createSeed(
      personality,
      temperament,
      animal,
      type1,
      type2
    )

  const visual =
    calculateVisual({
      personality,
      temperament,
      animal,
      type1,
      type2,
      seed,
    })

  const combat =
    calculateCombat({
      personality,
      temperament,
      visual,
      animal,
      type1,
      type2,
      seed,
    })

const biology =
  calculateBiology({
    animal,
    animalBucket,
    type1,
    type2,
    visual,
  })

const naming =
  generateNameCandidates({
    animal,
    type1,
    type2,
    seed,
  })

const narrative =
  calculateNarrative({
    personality,
    temperament,
    animal,
    type1,
    type2,
    visual,
    biology,
    combat,
    name:
      naming.selected,
    seed,
  })

  return {
    IDENTITY: {
      animal,
      animal_bucket:
        animalBucket,
      type_1: type1,
      type_2: type2,
    },

    PERSONALITY:
      personality,

    TEMPERAMENT:
      temperament,

    VISUAL:
      visual,

    /*
      Ces blocs seront ajoutés
      dans les étapes suivantes,
      en conservant les règles
      exactes du package V1.0.
    */
    COMBAT: combat,
    BIOLOGY: biology,
    NARRATIVE: narrative,

    TECHNICAL: {
      seed,

      assessment_id:
        assessmentId,

      questionnaire_version:
        '90q-v1',

      scoring_version:
        scoringVersion,

      animal_engine_version:
        animalEngineVersion,

      type_engine_version:
        typeEngineVersion,

      dna_version:
        '1.0',

      generation_version:
        'playground-dna-1.0',

      name_candidates:
        naming.candidates,
    },
  }
}

module.exports = {
  buildDnaBase,
  calculateVisual,
  calculateCombat,
  calculateBiology,
  generateNameCandidates,
  calculateNarrative,
}