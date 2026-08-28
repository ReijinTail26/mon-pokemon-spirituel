const CREATIVE_PACKAGE_VERSION =
  'creative-package-v1'

const FINAL_LAYOUT_VERSION =
  'creature-sheet-landscape-v1'

const {
  buildSecondaryDesign,
} = require('./secondaryDesign')

const {
  getRoleBadge,
  getTypeBadges,
  decorateMove,
} = require('./sheetUiDesign')

const { selectBackgroundWithHistory } = require('./backgroundSelection')
const { selectVisualSeedWithHistory } = require('./visualSeedSelection')

function compactObject(
  value
) {
  if (Array.isArray(value)) {
    return value
      .map(compactObject)
      .filter(
        (item) =>
          item !== undefined &&
          item !== null
      )
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([, item]) =>
            item !== undefined &&
            item !== null
        )
        .map(
          ([key, item]) => [
            key,
            compactObject(item),
          ]
        )
    )
  }

  return value
}


function buildPersonBigFiveDescription(scores = {}) {
  const describe = (value, low, mid, high) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return mid
    if (n < 40) return low
    if (n > 60) return high
    return mid
  }

  const openness = describe(
    scores.O,
    'pragmatique, attachée aux repères concrets et aux solutions éprouvées',
    'équilibrée entre curiosité et sens pratique',
    'curieuse, imaginative et attirée par les idées nouvelles'
  )

  const conscientiousness = describe(
    scores.C,
    'spontanée, flexible et à l’aise avec l’improvisation',
    'capable d’alterner organisation et souplesse selon la situation',
    'organisée, persévérante et attentive à la structure'
  )

  const extraversion = describe(
    scores.E,
    'réservée, posée et plutôt tournée vers des interactions choisies',
    'à l’aise aussi bien dans les moments calmes que dans les échanges sociaux',
    'énergique, expressive et naturellement tournée vers les autres'
  )

  const agreeableness = describe(
    scores.A,
    'indépendante, directe et portée à défendre fermement son point de vue',
    'capable de concilier coopération et affirmation de soi',
    'coopérative, attentive aux autres et portée vers l’harmonie'
  )

  const neuroticism = describe(
    scores.N,
    'émotionnellement stable et généralement calme sous pression',
    'sensible aux tensions tout en conservant une bonne capacité d’adaptation',
    'très réceptive aux émotions, aux tensions et aux variations de son environnement'
  )

  return `Ce Pokémon est ${openness}. Il est également ${conscientiousness}, ${extraversion}, ${agreeableness} et ${neuroticism}. Cette combinaison décrit son tempérament général sans réduire son comportement à un seul trait.`
}

async function buildCreativePackage({
  assessmentId,
  dna,
  visualConcept,
}) {
  if (!dna) {
    throw new Error(
      'DNA_REQUIRED'
    )
  }

  if (!visualConcept) {
    throw new Error(
      'CANONICAL_VISUAL_CONCEPT_REQUIRED'
    )
  }

  const types = [
    dna.IDENTITY?.type_1,
    dna.IDENTITY?.type_2,
  ].filter(Boolean)

  const rawMoves =
    dna.COMBAT?.moves ??
    []

  const moves =
    Array.isArray(rawMoves)
      ? rawMoves
      : Object.values(rawMoves)
          .filter(
            (move) =>
              move &&
              typeof move ===
                'object'
          )

  const signatureMove =
    moves.find(
      (move) =>
        move.kind ===
          'signature-original' ||
        move.is_signature ===
          true ||
        move.role ===
          'signature'
    ) ??
    moves.find(
      (move) =>
        String(
          move.name ??
          ''
        )
          .toLowerCase()
          .includes(
            'signature'
          )
    ) ??
    moves[3] ??
    null

  const standardMoves =
    moves
      .filter((move) =>
        move !== signatureMove &&
        move?.origin !== 'signature-original' &&
        move?.is_signature !== true
      )
      .slice(0, 3)
      .map(decorateMove)

  const decoratedSignatureMove =
    signatureMove
      ? decorateMove(signatureMove)
      : null

  const secondaryDesign =
    buildSecondaryDesign({
      dna,
      visualConcept,
    })

  const background = await selectBackgroundWithHistory({ assessmentId, dna })
  const visualSeed = await selectVisualSeedWithHistory({ assessmentId, animal: dna.IDENTITY?.animal })

  const packageData = {
    version:
      CREATIVE_PACKAGE_VERSION,

    assessment_id:
      assessmentId,

    /*
      Données internes.
      Elles ne sont pas toutes
      destinées au PDF utilisateur.
    */
    internal: {
      dna_version:
        dna.TECHNICAL
          ?.dna_version,

      generation_version:
        dna.TECHNICAL
          ?.generation_version,

      scoring_version:
        dna.TECHNICAL
          ?.scoring_version,

      scores: {
        personality:
          dna.PERSONALITY,

        temperament:
          dna.TEMPERAMENT,
      },
    },

    identity: {
      name: null,

      name_policy:
        'AI_GENERATED',

      name_requirements: {
        language: 'fr',
        min_words: 1,
        max_words: 3,
        must_be_original: true,
        must_be_pronounceable: true,
        must_not_match_official_pokemon_name: true,
        avoid_generic_concatenation: true,
      },

      name_generation_brief: {
        animal_source:
          dna.IDENTITY?.animal,

        animal_morphology_variant:
          visualConcept?.morphology_variant?.label ?? null,

        types,

        species_title:
          dna.NARRATIVE?.category,

        personality_profile: {
          O: dna.PERSONALITY?.O,
          C: dna.PERSONALITY?.C,
          E: dna.PERSONALITY?.E,
          A: dna.PERSONALITY?.A,
          N: dna.PERSONALITY?.N,
        },

        temperament_profile:
          dna.TEMPERAMENT ?? {},

        signature_anatomy:
          visualConcept?.anatomy?.signature_anatomy?.map((item) => item.description) ??
          dna.BIOLOGY?.signature_anatomy ?? [],

        combat_role:
          dna.COMBAT?.role,

        naming_direction: [
          'Créer un nom de Pokémon original, naturel et mémorable en français.',
          'Privilégier une bonne musicalité, des syllabes fluides et une prononciation immédiate.',
          'Le nom peut fusionner, transformer ou évoquer le vocabulaire de l’animal, des types, de l’anatomie ou de la personnalité, sans devoir les citer littéralement.',
          'Éviter les concaténations mécaniques évidentes et les noms descriptifs plats.',
          'Ne pas reprendre le nom d’un Pokémon officiel existant.',
        ],
      },

      category:
        dna.NARRATIVE?.category,

      animal:
        dna.IDENTITY?.animal,

      animal_variant:
        visualConcept?.morphology_variant?.label ?? null,

      animal_variant_id:
        visualConcept?.morphology_variant?.id ?? null,

      types,

      type_badges:
        getTypeBadges(types),

      personality_summary:
        dna.NARRATIVE
          ?.personality_description,

      person_description:
        buildPersonBigFiveDescription(
          dna.PERSONALITY ?? {}
        ),

      behavior_summary:
        dna.NARRATIVE
          ?.behavior_description,

      pokedex_description:
        dna.NARRATIVE
          ?.pokedex_description,

      role:
        dna.COMBAT?.role,

      role_badge:
        getRoleBadge(
          dna.COMBAT?.role
        ),
    },

    creature_spec: {
      morphology_variant:
        visualConcept?.morphology_variant ?? null,

      morphology_directive: {
        priority: 'CRITICAL',
        weight: 1.0,
        selected_morphotype: visualConcept?.morphology_variant?.label ?? null,
        selected_morphotype_id: visualConcept?.morphology_variant?.id ?? null,
        broad_animal_family: dna.IDENTITY?.animal ?? null,
        role: 'PRIMARY_ANATOMICAL_IDENTITY',
        must_pass_gate_before_design: true,
        instruction: 'Le morphotype sélectionné est l’identité anatomique primaire. Le nom large de l’animal est une information secondaire et ne doit jamais écraser le plan corporel, la logique des membres, la silhouette ou la locomotion du morphotype exact.',
        required_body_plan:
          visualConcept?.morphology_variant?.required_body_plan ?? [],
        forbidden_body_plans:
          visualConcept?.morphology_variant?.forbidden_body_plans ?? [],
        morphology_gate:
          visualConcept?.morphology_variant?.morphology_gate ?? null,
        must_preserve_identity_of: [
          'exact selected morphotype identity',
          'body_plan_family',
          'limb_configuration',
          'wing_or_appendage_presence_logic',
          'tail_architecture_family',
          'head_and_neck_construction_family',
          'locomotion_logic',
          'overall_morphotype_silhouette',
          'variant_signature_features',
        ],
        seed_may_reinterpret: [
          'exact proportions within the same morphotype',
          'surface treatment',
          'shape language',
          'ornamentation',
          'degree of stylization',
          'mass distribution compatible with the morphotype',
          'pose language compatible with locomotion',
        ],
        forbidden_outcomes: [
          'collapse_to_generic_animal_template',
          'switch_to_different_morphotype',
          'restore_stereotypical_family_form',
          'contradict_required_body_plan',
          'match_any_forbidden_body_plan',
        ],
      },

      body_plan:
        visualConcept
          .anatomy
          ?.body_plan,

      locomotion:
        visualConcept
          .anatomy
          ?.locomotion,

      silhouette:
        visualConcept
          .anatomy
          ?.silhouette,

      proportions:
        visualConcept
          .anatomy
          ?.proportions,

      head:
        visualConcept
          .anatomy
          ?.head,

      eyes:
        visualConcept
          .anatomy
          ?.eyes,

      limbs:
        visualConcept
          .anatomy
          ?.limbs,

      tail:
        visualConcept
          .anatomy
          ?.tail,

      appendages:
        visualConcept
          .anatomy
          ?.appendages ??
        [],

      signature_anatomy:
        visualConcept
          .anatomy
          ?.signature_anatomy ??
        [],

      animal_markers:
        visualConcept
          .markers
          ?.animal ??
        [],

      type_markers:
        visualConcept
          .markers
          ?.types ??
        [],

      surfaces:
        visualConcept
          .surfaces,

      patterns:
        visualConcept
          .patterns ??
        [],

      palette:
        visualConcept
          .palette,

      posture:
        visualConcept
          .presentation
          ?.posture,

      expression:
        visualConcept
          .presentation
          ?.default_expression,

      visual_attitude:
        visualConcept
          .presentation
          ?.visual_attitude,
    },

    biology: {
      height_m:
        visualConcept
          .biology
          ?.height_m ??
        dna.BIOLOGY
          ?.height_m,

      weight_kg:
        visualConcept
          .biology
          ?.weight_kg ??
        dna.BIOLOGY
          ?.weight_kg,

      footprint_type:
        visualConcept
          .biology
          ?.footprint_type ??
        dna.BIOLOGY
          ?.footprint_type,

      habitat_tendency:
        dna.NARRATIVE
          ?.habitat_tendency,

      social_behavior:
        dna.NARRATIVE
          ?.social_behavior,

      signature_behavior:
        dna.NARRATIVE
          ?.signature_behavior,
    },

    combat: {
      role:
        dna.COMBAT?.role,

      orientation:
        dna.COMBAT
          ?.offensive_orientation,

      bst:
        dna.COMBAT?.bst,

      stats:
        dna.COMBAT?.stats,

      main_ability:
        dna.COMBAT
          ?.main_ability,

      hidden_ability:
        dna.COMBAT
          ?.hidden_ability,

      standard_moves:
        standardMoves,
    },

    signature_move: {
      data:
        decoratedSignatureMove,

      visual_concept:
        visualConcept
          .signature_move_visual_concept,
    },

    shiny:
      secondaryDesign.shiny,

    environment: {
      background,
    },

    visual_seed: visualSeed,

    creature_design_process: {
      version: 'two-pass-creature-design-v4',

      phase_1: {
        name: 'BASE_CREATURE_DESIGN',
        purpose: 'Construire un Pokémon de base complet et cohérent uniquement à partir du DNA et du dossier créatif.',
        use_visual_seed: false,
        canonical_status: 'TEMPORARY_BASE_DESIGN',
      },

      phase_2: {
        name: 'VISUAL_SEED_TRANSFORMATION',
        purpose: 'Transformer radicalement le Pokémon de base en utilisant uniquement le sujet central de la Visual Seed comme référence forte de design.',
        creative_freedom: 10,
        policy: 'UNRESTRICTED_CREATURE_REDESIGN',
        preserve_phase_1_geometry: false,
        may_change: [
          'silhouette', 'proportions', 'head', 'face', 'neck', 'torso',
          'limb proportions', 'wing architecture', 'appendage architecture',
          'tail', 'mass distribution', 'surface structures', 'ornamentation',
          'shape language', 'pose language', 'artistic stylization', 'type integration',
        ],
        preserve_conceptual_identity: [
          'source animal identity', 'selected morphology variant structural identity', 'types', 'personality', 'combat role', 'core thematic identity',
        ],
        morphology_priority: {
          level: 'CRITICAL',
          weight: 0.95,
          rule: 'La Visual Seed peut transformer librement l’esthétique et les proportions fines, mais le morphotype sélectionné doit rester identifiable et ne peut être remplacé par un autre morphotype.',
        },
        seed_usage: {
          subject_only: true,
          copy_policy: 'TRANSFORMATIVE_NOT_LITERAL',
          background_authority: 'ZERO',
          ignore_seed_background: true,
        },
      },

      phase_3: {
        name: 'FINAL_CANONICAL_LOCK',
        purpose: 'Verrouiller le Pokémon transformé comme unique design canonique définitif.',
        canonical_status: 'FINAL',
        lock_after_transformation: [
          'silhouette', 'proportions', 'head', 'face', 'neck', 'torso', 'limbs',
          'wings', 'appendages', 'tail', 'permanent structures', 'markings',
          'type-integrated anatomy', 'palette',
        ],
        six_view_consistency: true,
        consistency_check_passes: 2,
      },

      canonical_background_separation: {
        independent_from_creature_redesign: true,
        canonical_background_is_only_environment_source: true,
        visual_seed_background_authority: 'ZERO',
        ignore_visual_seed_background: true,
      },
    },

    secondary_elements: {
      cry:
        secondaryDesign.cry,

      footprint:
        secondaryDesign.footprint,

      size_comparison:
        secondaryDesign.size_comparison,
    },

    /*
      C'est ici que l'on encode
      officiellement la structure
      de la fiche de référence.
    */

    art_direction: {
      identity:
        'ORIGINAL_POKEMON_STYLE_CREATURE',

      objective:
        'Créer un Pokémon original crédible, inédit et immédiatement lisible comme une espèce de Pokémon.',

      render_style:
        'stylized_non_realistic',

      presentation_style:
        'premium_pokedex_like_sheet',

      design_principles: [
        'silhouette forte et immédiatement reconnaissable',
        'formes anatomiques simplifiées mais expressives',
        'design clair et lisible',
        'palette propre avec séparation nette des couleurs',
        'niveau de détail contrôlé',
        'anatomie cohérente avec l’animal source',
        'influence visible du ou des types',
        'personnalité perceptible dans la posture et l’expression',
        'rendu illustratif propre adapté à un Pokémon',
      ],

      must_feel_like: [
        'un Pokémon original et inédit',
        'une espèce crédible appartenant à un univers Pokémon',
        'une illustration de créature de jeu de collection',
        'une fiche encyclopédique premium de type Pokédex',
      ],

      forbidden_rendering: [
        'photorealism',
        'realistic_animal_rendering',
        'documentary_animal_style',
        'dark_fantasy_realism',
        'horror_anatomy',
        'grotesque_body_horror',
        'excessively_complex_texture',
        'generic_fantasy_beast',
      ],

      branding_rules: [
        'ne pas utiliser de logo Pokémon officiel',
        'ne pas utiliser de logo Pokédex officiel',
        'ne pas ajouter de numéro de Pokédex',
        'ne pas reproduire exactement une interface officielle existante',
      ],
    },      

    layout_spec: {
      version:
        FINAL_LAYOUT_VERSION,

      format: {
        orientation:
          'landscape',

        composition:
          'single_complete_sheet',

        visual_priority:
          'creature_first',
      },

      upper_zone: {
        approximate_height_percent:
          64,

        identity_panel: {
          position:
            'upper_left',

          content: [
            'name',
            'category',
            'type_badges',
            'role_badge',
            'height',
            'weight',
            'person_description',
          ],

          description_rule:
            'translate_big_five_results_into_pokemon_behavior_without_showing_scores',
        },

        hero_art: {
          position:
            'upper_center',

          importance:
            'dominant',

          body_visibility:
            'full_or_nearly_full',

          silhouette:
            'clearly_readable',

          background:
            'use_selected_canonical_background_reference_creature_must_remain_dominant',
        },

        views_panel: {
          position:
            'upper_right',

          views: [
            'back',
            'front',
            'shiny',
            'secondary_adapted_pose',
          ],

          shiny_rule:
            'same_exact_creature_recolor_only',

          rule:
            'all_views_same_exact_creature',
        },
      },

      combat_zone: {
        approximate_height_percent:
          36,

        position:
          'middle_lower_band',

        attacks_panel: {
          position:
            'left',

          move_count:
            3,

          exact_rule:
            'exactly_three_standard_moves_signature_excluded',

          move_content: [
            'function_icon',
            'name',
            'type_badges',
            'category',
            'power',
            'description_or_effect',
          ],
        },

        signature_move_panel: {
          position:
            'center',

          include_visual:
            true,

          exact_rule:
            'exactly_one_signature_move_separate_from_standard_moves_ai_generates_name_and_wording_from_canonical_brief',

          generation_policy:
            'AI_GENERATES_SIGNATURE_NAME_DESCRIPTION_AND_EFFECT_WORDING_FROM_CANONICAL_BRIEF',

          move_content: [
            'function_icon',
            'name',
            'type_badges',
            'category',
            'power',
            'description_or_effect',
            'associated_illustrative_visual',
          ],
        },

        abilities_stats_panel: {
          position:
            'right',

          content: [
            'main_ability',
            'hidden_ability',
            'six_stats',
            'bst',
          ],
        },
      },

      interface_style: {
        mood:
          'premium_creature_encyclopedia',

        panels:
          'dark_translucent_rounded',

        hierarchy:
          'strong',

        typography:
          'highly_legible',

        imitation_rule:
          'do_not_copy_official_pokedex_branding_or_logo',

        type_badges:
          'use one consistent icon+label badge system, visually close to familiar official Pokémon type badges without copying a proprietary UI layout',

        role_badge:
          'show the combat role as a rectangular icon+label badge next to or directly under the type badges',
      },
    },

    /*
      Contrat utilisé pour fabriquer
      le prompt final.
    */
    generation_contract: {
      objective:
        'Generate one complete illustrated landscape sheet for an original Pokémon-style species.',

      source_of_truth:
        'The attached creative dossier is the canonical source.',

      required_output:
        'ONE_SINGLE_COMPLETE_IMAGE',

      consistency_rules: [
        'Creature design uses Two-Pass Creature Design V4: Phase 1 creates a DNA-only base design; Phase 2 radically redesigns the creature with the Visual Seed subject; Phase 3 locks the transformed result as canonical.',
        'MORPHOLOGY PRIORITY IS CRITICAL: the selected animal morphotype is one of the highest-priority structural inputs and must remain recognizable in the final design.',
        'The Visual Seed may strongly stylize the selected morphotype, but must not replace it with another morphotype or collapse it back into the generic/stereotypical form of the animal family.',
        'During Phase 2, Phase-1 silhouette, proportions and visual anatomy are not protected and may be radically redesigned.',
        'After Phase 3 lock, the main hero, front, back, shiny, secondary pose and signature-move illustration must all depict the exact same final transformed creature.',
        'Perform two internal consistency passes across all six representations before rendering.',
        'The shiny reference view is recoloration only and must preserve the exact Phase-3 anatomy.',
        'The signature-move pose, body motion, effect origin, trajectory, impact and follow-through must be physically coherent with the final Phase-3 anatomy.',
        'The Visual Seed background must be completely ignored; only the separately selected canonical background may define the environment.',
        'The canonical background must remain the same environmental identity in the hero artwork and signature-move illustration.',
        'The standard attacks panel must contain EXACTLY THREE moves and must never include the signature move.',
        'The signature move must appear exactly once in its own adjacent premium panel.',
        'The final image AI must generate the signature move name plus final description/effect wording from the canonical signature brief; the backend must not impose a generic finished name.',
        'The generated signature move name must be original French, 2 to 4 words, naturally pronounceable, and must avoid generic animal+type concatenations or systematic Apogée/Ultime/Suprême formulas.',
        'Every move must show a function icon, name, type badge(s), category, power, and concise description/effect.',
        'The signature move must additionally include its associated illustrative visual.',
        'Type badges must use the same icon and badge language in identity and attack sections.',
        'The combat role must appear as a rectangular icon+name badge near the type badges, not as a plain Role: text line.',
        'The signature move must use its defined anatomical source.',
        'The creature must clearly read as an original Pokémon-style species, not as a realistic animal.',
        'The rendering must remain stylized and non-photorealistic.',
        'Anatomy must be simplified and visually readable rather than biologically realistic.',
      ],

      forbidden: [
        'new limbs',
        'missing limbs',
        'new permanent appendages',
        'inconsistent final tail anatomy between views after the Phase-3 design has been locked',
        'inconsistent final proportions between views after the Phase-3 design has been locked',
        'changed permanent markings',
        'different creature between views',
        'multiple complete encyclopedia sheets in one image',
        'alternate or corrected full-sheet versions',
        'visible drafts, revision stages or second attempts',
        'official Pokédex logo',
        'Pokédex number',
        'photorealistic rendering',
        'realistic wildlife illustration',
        'dark fantasy realism',
        'generic fantasy monster design',
        'horror or grotesque anatomy',
      ],
    },
  }

  return compactObject(
    packageData
  )
}

module.exports = {
  CREATIVE_PACKAGE_VERSION,
  FINAL_LAYOUT_VERSION,
  buildCreativePackage,
}