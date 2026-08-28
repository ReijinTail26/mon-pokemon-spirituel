const VISUAL_CONCEPT_VERSION =
  'visual-concept-v1'

const {
  selectAnimalMorphologyVariant,
} = require('./animalMorphologyVariants')

const typeVisualRules =
  require(
    '../data/typeVisualRules.json'
  )

const typeVisualRuleByName =
  new Map(
    typeVisualRules.map(
      (rule) => [
        rule.name,
        rule,
      ]
    )
  )

const BODY_PLANS = [
  'quadruped',
  'biped',
  'avian',
  'serpentine',
  'aquatic',
  'amphibious',
  'insectoid',
  'floating',
  'hybrid',
]

const LOCOMOTION_MODES = [
  'walk',
  'run',
  'jump',
  'climb',
  'crawl',
  'slither',
  'swim',
  'fly',
  'glide',
  'hover',
]

const FOOTPRINT_TYPES = [
  'patte',
  'sabot',
  'griffe',
  'palmure',
  'trace corporelle',
  'nageoire',
  'reptation',
  'trace inhabituelle',
  'aucune empreinte classique',
]

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  )
}

function getTypeVisualRule(
  typeName
) {
  const rule =
    typeVisualRuleByName.get(
      typeName
    )

  if (!rule) {
    throw new Error(
      `Règle visuelle absente pour le type ${typeName}.`
    )
  }

  return rule
}

function parseHexColor(
  color
) {
  const match =
    /^#([0-9A-Fa-f]{6})$/
      .exec(color)

  if (!match) {
    throw new Error(
      `Couleur hexadécimale invalide : ${color}`
    )
  }

  const value =
    match[1]

  return {
    r:
      Number.parseInt(
        value.slice(0, 2),
        16
      ),

    g:
      Number.parseInt(
        value.slice(2, 4),
        16
      ),

    b:
      Number.parseInt(
        value.slice(4, 6),
        16
      ),
  }
}

function toHexColor({
  r,
  g,
  b,
}) {
  const channel = (
    value
  ) =>
    Math.round(
      clamp(
        value,
        0,
        255
      )
    )
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()

  return `#${channel(r)}${channel(g)}${channel(b)}`
}

function blendHexColors(
  first,
  second,
  firstWeight = 0.65
) {
  const a =
    parseHexColor(first)

  const b =
    parseHexColor(second)

  const secondWeight =
    1 - firstWeight

  return toHexColor({
    r:
      a.r * firstWeight +
      b.r * secondWeight,

    g:
      a.g * firstWeight +
      b.g * secondWeight,

    b:
      a.b * firstWeight +
      b.b * secondWeight,
  })
}

function buildTypeVisualDesign({
  type1,
  type2,
}) {
  const primary =
    getTypeVisualRule(
      type1
    )

  if (!type2) {
    return {
      rules: [
        primary,
      ],

      markers: [
        `${type1} — ${primary.visual_markers[0]}`,
      ],

      palette: {
        ...primary.palette,
      },

      surface_influence:
        primary.surface_influence,

      pattern_rule:
        primary.pattern_rule,

      energy_effect:
        primary.energy_effect,

      signature_effect_shape:
        primary.signature_effect_shape,

      forbidden: [
        ...primary.forbidden,
      ],
    }
  }

  const secondary =
    getTypeVisualRule(
      type2
    )

  return {
    rules: [
      primary,
      secondary,
    ],

    markers: [
      `${type1} — ${primary.visual_markers[0]}`,
      `${type2} — ${secondary.visual_markers[0]}`,
    ],

    palette: {
      primary:
        primary.palette.primary,

      secondary:
        blendHexColors(
          primary.palette.secondary,
          secondary.palette.secondary,
          0.55
        ),

      accent:
        secondary.palette.accent,

      energy:
        blendHexColors(
          primary.palette.energy,
          secondary.palette.energy,
          0.5
        ),
    },

    surface_influence:
      `${primary.surface_influence}; influence secondaire ${type2.toLowerCase()} : ${secondary.surface_influence}`,

    pattern_rule:
      `${primary.pattern_rule}; accent secondaire : ${secondary.pattern_rule}`,

    energy_effect:
      `${primary.energy_effect}; fusion secondaire : ${secondary.energy_effect}`,

    signature_effect_shape:
      `${primary.signature_effect_shape} combiné avec ${secondary.signature_effect_shape}`,

    forbidden: [
      ...new Set([
        ...primary.forbidden,
        ...secondary.forbidden,
      ]),
    ],
  }
}

function buildVisualArchitectInput(
  dna
) {
  if (!dna) {
    throw new Error(
      'DNA absent.'
    )
  }

  if (
    !dna.IDENTITY ||
    !dna.PERSONALITY ||
    !dna.TEMPERAMENT ||
    !dna.VISUAL ||
    !dna.COMBAT ||
    !dna.BIOLOGY ||
    !dna.NARRATIVE
  ) {
    throw new Error(
      'DNA incomplet pour le Visual Architect.'
    )
  }

  return {
    contract_version:
      VISUAL_CONCEPT_VERSION,

    design_stage: 'BASE_CREATURE_SPEC',

    seed_transformation_policy: {
      use_visual_seed_during_base_design: false,
      base_geometry_is_mutable_in_phase_2: true,
      final_canonical_lock_occurs_after_seed_transformation: true,
    },

    identity: {
      animal:
        dna.IDENTITY.animal,

      animal_bucket:
        dna.IDENTITY
          .animal_bucket,

      types: [
        dna.IDENTITY.type_1,
        dna.IDENTITY.type_2,
      ].filter(Boolean),

      name: null,

      name_policy:
        'AI_GENERATED',
    },

    personality: {
      O:
        dna.PERSONALITY.O,

      C:
        dna.PERSONALITY.C,

      E:
        dna.PERSONALITY.E,

      A:
        dna.PERSONALITY.A,

      N:
        dna.PERSONALITY.N,
    },

    temperament: {
      R:
        dna.TEMPERAMENT.R,

      L:
        dna.TEMPERAMENT.L,

      P:
        dna.TEMPERAMENT.P,

      H:
        dna.TEMPERAMENT.H,

      I:
        dna.TEMPERAMENT.I,

      M:
        dna.TEMPERAMENT.M,
    },

    visual: {
      ...dna.VISUAL,
    },

    biology_constraints: {
      animal_markers:
        dna.BIOLOGY
          .animal_markers,

      type_markers:
        dna.BIOLOGY
          .type_markers,

      required_signature_anatomy_count:
        dna.BIOLOGY
          .signature_anatomy
          .length,

      max_major_anatomical_concepts:
        3,
    },

    type_visual_constraints:
      buildTypeVisualDesign({
        type1:
          dna.IDENTITY.type_1,

        type2:
          dna.IDENTITY.type_2,
      }),

    combat_context: {
      role:
        dna.COMBAT.role,

      offensive_orientation:
        dna.COMBAT
          .offensive_orientation,

      signature_move:
        dna.COMBAT.moves
          .signature_move,
    },

    narrative_context: {
      personality_description:
        dna.NARRATIVE
          .personality_description,

      behavior_description:
        dna.NARRATIVE
          .behavior_description,

      signature_behavior:
        dna.NARRATIVE
          .signature_behavior,
    },

    hard_rules: {
      final_form:
        true,

      evolution:
        false,

      minimum_animal_markers:
        2,

      one_marker_per_type:
        true,

      max_major_anatomical_concepts:
        3,

      silhouette_must_be_clear:
        true,

      types_must_not_dominate_anatomy:
        true,

      no_existing_pokemon_copy:
        true,

      no_existing_character_copy:
        true,

      anatomy_must_be_coherent:
        true,

      base_design_is_not_final_canon:
        true,

      seed_transformation_may_redesign_geometry_before_final_lock:
        true,
    },
  }
}

function createEmptyVisualConcept() {
  return {
    version:
      VISUAL_CONCEPT_VERSION,

    morphology_variant:
      morphologyVariant
        ? {
            id: morphologyVariant.id,
            label: morphologyVariant.label,
            animal: morphologyVariant.animal,
            library_version: morphologyVariant.library_version,
            candidate_count: morphologyVariant.candidate_count,
            body_plan: morphologyVariant.body_plan,
            silhouette: morphologyVariant.silhouette,
            head: morphologyVariant.head,
            limb_configuration: morphologyVariant.limb_configuration,
            appendages: morphologyVariant.appendages ?? [],
            locomotion: morphologyVariant.locomotion ?? [],
            tags: morphologyVariant.tags ?? [],
            signature_features: morphologyVariant.signature_features ?? [],
            required_body_plan: morphologyVariant.required_body_plan ?? [],
            forbidden_body_plans: morphologyVariant.forbidden_body_plans ?? [],
            morphology_gate: morphologyVariant.morphology_gate ?? null,
            priority: morphologyVariant.morphology_priority ?? 'CRITICAL',
            weight: morphologyVariant.morphology_weight ?? 1.0,
            structural_identity_rule: morphologyVariant.structural_identity_rule ?? 'Le morphotype sélectionné constitue une contrainte structurelle prioritaire.',
            generation_rule: 'Le morphotype sélectionné est l’un des paramètres les plus importants du design. Il fixe l’identité structurelle de la créature : plan corporel, logique des membres, présence ou absence d’ailes/appendices, locomotion, silhouette de famille, tête/cou et traits signatures. La Visual Seed peut fortement styliser et réinterpréter ces éléments pendant la Phase 2, mais elle ne doit pas transformer le Pokémon en un autre morphotype ni le ramener vers la forme stéréotypée de la famille animale.',
          }
        : null,

    anatomy: {
      body_plan: '',

      locomotion: [],

      silhouette: {
        description: '',

        verticality: 0,
        width: 0,
        symmetry: 0,

        center_of_mass: '',
      },

      proportions: {
        head_to_body_ratio: '',
        torso: '',
        limbs: '',
        neck: '',
        tail: '',
      },

      head: {
        shape: '',
        snout: '',
        ears: '',
        horns: [],
        crest: '',
      },

      eyes: {
        shape: '',
        size: '',
        pupil: '',
        expression: '',
      },

      limbs: {
        count: 0,
        configuration: '',
        extremities: '',
      },

      tail: {
        present: false,
        count: 0,
        description: '',
      },

      appendages: [],

      signature_anatomy: [],
    },

    markers: {
      animal: [],

      types: [],
    },

    surfaces: {
      primary: '',
      secondary: '',
      accent: '',

      transitions: '',
    },

    patterns: [],

    palette: {
      primary: '',

      secondary: '',

      accent: '',

      energy: '',
    },

    presentation: {
      posture: '',

      default_expression: '',

      visual_attitude: '',
    },

    biology: {
      height_m: null,

      weight_kg: null,

      footprint_type: '',
    },

    signature_move_visual_concept: {
      anatomical_source: '',

      energy_origin: '',

      action: '',

      effect_shape: '',

      direction: '',

      environmental_reaction: '',
    },

    visual_rationale: {
      animal_influence: '',

      type_influence: '',

      personality_influence: '',

      combat_influence: '',
    },
  }
}

function validateVisualConcept(
  concept,
  dna
) {
  const errors = []

  if (!concept) {
    return {
      valid: false,
      score: 0,
      errors: [
        'Concept absent.',
      ],
    }
  }

  /*
    BODY PLAN
  */
  if (
    !BODY_PLANS.includes(
      concept.anatomy
        ?.body_plan
    )
  ) {
    errors.push(
      'body_plan invalide.'
    )
  }

  /*
    LOCOMOTION
  */
  const locomotion =
    concept.anatomy
      ?.locomotion

  if (
    !Array.isArray(
      locomotion
    ) ||
    locomotion.length === 0
  ) {
    errors.push(
      'Locomotion absente.'
    )
  } else {
    for (
      const mode of
      locomotion
    ) {
      if (
        !LOCOMOTION_MODES.includes(
          mode
        )
      ) {
        errors.push(
          `Locomotion invalide : ${mode}`
        )
      }
    }
  }

  /*
    MEMBRES
  */
  const limbCount =
    concept.anatomy
      ?.limbs
      ?.count

  if (
    !Number.isInteger(
      limbCount
    ) ||
    limbCount < 0 ||
    limbCount > 12
  ) {
    errors.push(
      'Nombre de membres invalide.'
    )
  }

  /*
    ANATOMIE SIGNATURE
  */
  const requiredSignatureCount =
    dna.BIOLOGY
      .signature_anatomy
      .length

  const signatureAnatomy =
    concept.anatomy
      ?.signature_anatomy

  if (
    !Array.isArray(
      signatureAnatomy
    ) ||
    signatureAnatomy.length !==
      requiredSignatureCount
  ) {
    errors.push(
      `Il faut exactement ${requiredSignatureCount} anatomie(s) signature.`
    )
  }

  if (
    Array.isArray(
      signatureAnatomy
    ) &&
    signatureAnatomy.length >
      3
  ) {
    errors.push(
      'Maximum 3 concepts anatomiques majeurs.'
    )
  }

  /*
    MARQUEURS ANIMAUX
  */
  const animalMarkers =
    concept.markers
      ?.animal

  if (
    !Array.isArray(
      animalMarkers
    ) ||
    animalMarkers.length < 2
  ) {
    errors.push(
      'Minimum 2 marqueurs animaux.'
    )
  }

  /*
    MARQUEURS TYPES
  */
  const typeMarkers =
    concept.markers
      ?.types

  const requiredTypeCount =
    [
      dna.IDENTITY.type_1,
      dna.IDENTITY.type_2,
    ].filter(Boolean)
      .length

  if (
    !Array.isArray(
      typeMarkers
    ) ||
    typeMarkers.length <
      requiredTypeCount
  ) {
    errors.push(
      'Il faut au moins un marqueur visuel par type.'
    )
  }

  /*
    PALETTE
  */
  const palette =
    concept.palette

  for (
    const field of [
      'primary',
      'secondary',
      'accent',
      'energy',
    ]
  ) {
    if (
      !palette?.[field] ||
      typeof palette[field] !==
        'string'
    ) {
      errors.push(
        `Palette ${field} absente.`
      )
    }
  }

  /*
    TAILLE / POIDS
  */
  const height =
    Number(
      concept.biology
        ?.height_m
    )

  const weight =
    Number(
      concept.biology
        ?.weight_kg
    )

  if (
    !Number.isFinite(
      height
    ) ||
    height <= 0 ||
    height > 25
  ) {
    errors.push(
      'Taille invalide.'
    )
  }

  if (
    !Number.isFinite(
      weight
    ) ||
    weight <= 0 ||
    weight > 10000
  ) {
    errors.push(
      'Poids invalide.'
    )
  }

  /*
    EMPREINTE
  */
  if (
    !FOOTPRINT_TYPES.includes(
      concept.biology
        ?.footprint_type
    )
  ) {
    errors.push(
      'footprint_type invalide.'
    )
  }

  /*
    EXPRESSION / POSTURE
  */
  if (
    !concept.presentation
      ?.posture
  ) {
    errors.push(
      'Posture absente.'
    )
  }

  if (
    !concept.presentation
      ?.default_expression
  ) {
    errors.push(
      'Expression par défaut absente.'
    )
  }

  /*
    ATTAQUE SIGNATURE
  */
  const signatureMove =
    concept
      .signature_move_visual_concept

  if (
    !signatureMove
      ?.anatomical_source
  ) {
    errors.push(
      'Source anatomique de l’attaque signature absente.'
    )
  }

  if (
    !signatureMove
      ?.action
  ) {
    errors.push(
      'Mécanique visuelle de l’attaque signature absente.'
    )
  }

  /*
    Score structurel simple.

    Le vrai Visual Critic
    produira plus tard son propre
    score qualitatif.
  */
  const score =
    clamp(
      100 -
        errors.length * 10,
      0,
      100
    )

  return {
    valid:
      errors.length === 0,

    score,

    errors,
  }
}

function buildDeterministicVisualConcept(
  dna,
  options = {}
) {
  const biology =
    dna.BIOLOGY

  const morphologyVariant =
    options.morphologyVariant ??
    selectAnimalMorphologyVariant({
      animal: dna.IDENTITY?.animal,
      seed: dna.TECHNICAL?.seed,
      assessmentId: dna.TECHNICAL?.assessment_id,
      visual: dna.VISUAL ?? {},
    })

  const effectiveBodyPlan =
    morphologyVariant?.body_plan ?? biology.body_plan

  const effectiveLocomotion =
    morphologyVariant?.locomotion?.length
      ? [...morphologyVariant.locomotion]
      : [...biology.locomotion]

  const typeDesign =
    buildTypeVisualDesign({
      type1:
        dna.IDENTITY.type_1,

      type2:
        dna.IDENTITY.type_2,
    })

  const requiredSignatureCount =
    biology
      .signature_anatomy
      .length

  const variantSignatureSource =
    morphologyVariant?.signature_features?.length
      ? morphologyVariant.signature_features
      : biology.signature_anatomy

  const signatureDescriptions =
    Array.from(
      { length: requiredSignatureCount },
      (_, index) =>
        variantSignatureSource[index] ??
        biology.signature_anatomy[index] ??
        variantSignatureSource[0] ??
        'marqueur anatomique distinctif'
    )

  const signatureAnatomy =
    signatureDescriptions
      .map(
        (
          description,
          index
        ) => ({
          id:
            `signature-${index + 1}`,

          description,

          function:
            'marqueur anatomique permanent dérivé de l’animal source',

          permanent:
            true,
        })
      )

  const signatureSource =
    requiredSignatureCount > 0
      ? 'signature-1'
      : 'anatomie-principale'

  return {
    version:
      VISUAL_CONCEPT_VERSION,

    morphology_variant:
      morphologyVariant
        ? {
            id: morphologyVariant.id,
            label: morphologyVariant.label,
            animal: morphologyVariant.animal,
            library_version: morphologyVariant.library_version,
            candidate_count: morphologyVariant.candidate_count,
            body_plan: morphologyVariant.body_plan,
            silhouette: morphologyVariant.silhouette,
            head: morphologyVariant.head,
            limb_count: morphologyVariant.limb_count,
            limb_configuration: morphologyVariant.limb_configuration,
            appendages: morphologyVariant.appendages ?? [],
            locomotion: morphologyVariant.locomotion ?? [],
            tags: morphologyVariant.tags ?? [],
            signature_features: morphologyVariant.signature_features ?? [],
            required_body_plan: morphologyVariant.required_body_plan ?? [],
            forbidden_body_plans: morphologyVariant.forbidden_body_plans ?? [],
            morphology_gate: morphologyVariant.morphology_gate ?? null,
            priority: morphologyVariant.morphology_priority ?? 'CRITICAL',
            weight: morphologyVariant.morphology_weight ?? 1.0,
            structural_identity_rule: morphologyVariant.structural_identity_rule ?? 'Le morphotype sélectionné est une contrainte structurelle prioritaire.',
          }
        : null,

    anatomy: {
      body_plan:
        effectiveBodyPlan,

      locomotion: [
        ...effectiveLocomotion,
      ],

      silhouette: {
        description:
          morphologyVariant
            ? `${morphologyVariant.label} — ${morphologyVariant.silhouette}. Référence biologique générale : ${biology.silhouette}`
            : biology.silhouette,

        verticality:
          dna.VISUAL.verticality,

        width:
          dna.VISUAL.width,

        symmetry:
          dna.VISUAL.symmetry,

        center_of_mass:
          effectiveBodyPlan ===
            'avian'
            ? 'centré sous le thorax'
            : effectiveBodyPlan ===
                'aquatic'
              ? 'centré dans l’axe du corps'
              : effectiveBodyPlan ===
                  'insectoid'
                ? 'centré sur le thorax'
                : 'centré selon la morphologie animale',
      },

      proportions: {
        ...biology.proportions,

        morphology_variant_bias:
          morphologyVariant?.silhouette ??
          'suivre les proportions biologiques de référence',
      },

      head: {
        shape:
          morphologyVariant?.head ?? biology.head.shape,

        snout:
          morphologyVariant?.head ?? biology.head.shape,

        ears:
          biology.head.ears,

        horns: [
          ...(biology.head.horns ?? []),
        ],

        crest:
          biology.head.crest,
      },

      eyes: {
        shape:
          'adaptés à l’animal source',

        size:
          dna.VISUAL.expressiveness >= 70
            ? 'grande'
            : 'moyenne',

        pupil:
          'cohérente avec l’animal source',

        expression:
          dna.NARRATIVE
            .personality_description,
      },

      limbs: {
        ...biology.limbs,

        count:
          Number.isInteger(morphologyVariant?.limb_count)
            ? morphologyVariant.limb_count
            : biology.limbs.count,

        configuration:
          morphologyVariant?.limb_configuration ??
          biology.limbs.configuration,
      },

      tail: {
        ...biology.tail,
      },

      appendages:
        morphologyVariant?.appendages
          ? [...morphologyVariant.appendages]
          : [...biology.appendages],

      signature_anatomy:
        signatureAnatomy,
    },

    markers: {
      animal: [
        ...(morphologyVariant?.signature_features ?? []),
        ...biology.animal_markers,
      ].filter((value, index, array) => array.indexOf(value) === index).slice(0, 6),

      types: [
        ...typeDesign.markers,
      ],
    },

    surfaces: {
      primary:
        biology.primary_surface,

      secondary:
        biology.secondary_surface,

      accent:
        biology.accent_surface,

      type_influence:
        typeDesign
          .surface_influence,

      transitions:
        'transitions anatomiques naturelles ; les effets de type restent subordonnés à la matière animale',
    },

    patterns: [
      {
        location:
          'zones anatomiques secondaires compatibles',

        description:
          typeDesign
            .pattern_rule,
      },
    ],

    palette: {
      ...typeDesign.palette,
    },

    presentation: {
      posture:
        effectiveBodyPlan ===
          'avian'
          ? 'port naturel et assuré, anatomie avienne lisible'
          : effectiveBodyPlan ===
              'aquatic'
            ? 'pose aquatique naturelle, silhouette entièrement lisible'
            : effectiveBodyPlan ===
                'floating'
              ? 'suspension naturelle, appendices clairement séparés'
              : 'posture naturelle, stable et assurée',

      default_expression:
        'attentive et maîtrisée',

      visual_attitude:
        dna.NARRATIVE
          .personality_description,
    },

    biology: {
      height_m:
        biology.height_m,

      weight_kg:
        biology.weight_kg,

      footprint_type:
        biology.footprint_type,
    },

    signature_move_visual_concept: {
      move_name:
        dna.COMBAT.moves
          .signature_move
          ?.name,

      anatomical_source:
        dna.COMBAT.moves
          .signature_move
          ?.anatomical_source ??
        signatureSource,

      energy_origin:
        dna.IDENTITY.type_2
          ? `${dna.IDENTITY.type_1}/${dna.IDENTITY.type_2}`
          : dna.IDENTITY.type_1,

      action:
        dna.COMBAT.moves
          .signature_move
          ?.description ??
        'activation du marqueur anatomique signature puis projection contrôlée de l’énergie',

      effect:
        dna.COMBAT.moves
          .signature_move
          ?.effect,

      effect_shape:
        dna.COMBAT.moves
          .signature_move
          ?.effect_shape ??
        typeDesign
          .signature_effect_shape,

      direction:
        'vers la cible, selon la locomotion et la posture naturelles de la créature',

      environmental_reaction:
        typeDesign
          .energy_effect,

      anatomy_rule:
        'Les effets énergétiques sont temporaires et ne créent, ne retirent ni ne transforment aucun élément anatomique permanent.',
    },

    visual_rationale: {
      animal_influence:
        morphologyVariant
          ? `${dna.IDENTITY?.animal} — morphotype ${morphologyVariant.label} : ${morphologyVariant.silhouette}. Marqueurs : ${(morphologyVariant.signature_features ?? []).join(' ; ')}`
          : biology.animal_markers.join(' ; '),

      type_influence:
        typeDesign.rules
          .map(
            (rule) =>
              `${rule.name}: ${rule.identity}`
          )
          .join(' + '),

      personality_influence:
        dna.NARRATIVE
          .personality_description,

      combat_influence:
        dna.COMBAT.role,
    },
  }
}

function buildVisualArchitectPrompt(
  input
) {
  return `
Tu es le VISUAL ARCHITECT.

Tu transformes un DNA de créature
en un concept anatomique canonique.

Tu ne produis PAS une illustration finale.

OBJECTIF
Créer une créature originale,
cohérente, immédiatement lisible,
dans sa forme finale complète.

RÈGLES ABSOLUES

- conserver l'animal source identifiable
  dans au moins deux marqueurs anatomiques ;

- intégrer au moins un marqueur visuel
  pour chaque type ;

- les types influencent le design
  sans remplacer l'animal ;

- maximum trois concepts anatomiques
  majeurs ;

- aucune évolution ;

- aucune copie d'un Pokémon existant ;

- aucune copie d'un personnage existant ;

- anatomie fonctionnelle ;

- aucune décoration gratuite
  sans justification biologique,
  psychologique ou élémentaire ;

- la silhouette doit être compréhensible
  même entièrement noire ;

- les éléments énergétiques temporaires
  ne doivent pas être confondus avec
  des membres permanents.

Tu dois résoudre notamment :

BODY PLAN
LOCOMOTION
SILHOUETTE
PROPORTIONS
TÊTE
YEUX
MEMBRES
QUEUE
APPENDICES
SURFACES
MOTIFS
PALETTE
POSTURE
EXPRESSION
TAILLE
POIDS
EMPREINTE
ANATOMIE SIGNATURE
ATTAQUE SIGNATURE VISUELLE

INPUT DNA :

${JSON.stringify(
  input,
  null,
  2
)}

Réponds UNIQUEMENT avec
un JSON correspondant exactement
au contrat VISUAL_CONCEPT_V1.
`.trim()
}


module.exports = {
  VISUAL_CONCEPT_VERSION,

  BODY_PLANS,

  LOCOMOTION_MODES,

  FOOTPRINT_TYPES,

  buildVisualArchitectInput,

  buildTypeVisualDesign,

  createEmptyVisualConcept,

  buildDeterministicVisualConcept,


  validateVisualConcept,

  buildVisualArchitectPrompt,
}