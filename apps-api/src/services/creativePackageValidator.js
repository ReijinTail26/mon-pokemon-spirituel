const REQUIRED_STATS = [
  'PV',
  'Attaque',
  'Défense',
  'Attaque Spéciale',
  'Défense Spéciale',
  'Vitesse',
]

const REQUIRED_PALETTE = [
  'primary',
  'secondary',
  'accent',
  'energy',
]

function isFilled(value) {
  return !(
    value === undefined ||
    value === null ||
    value === ''
  )
}

function pushIf(errors, condition, code, message) {
  if (condition) {
    errors.push({ code, message })
  }
}

function validateCreativePackage(creativePackage) {
  const errors = []

  if (!creativePackage || typeof creativePackage !== 'object') {
    return {
      valid: false,
      errors: [
        {
          code: 'CREATIVE_PACKAGE_REQUIRED',
          message: 'Le Creative Package est absent.',
        },
      ],
    }
  }

  const identity = creativePackage.identity ?? {}
  const creature = creativePackage.creature_spec ?? {}
  const biology = creativePackage.biology ?? {}
  const combat = creativePackage.combat ?? {}
  const signature = creativePackage.signature_move ?? {}
  const secondary = creativePackage.secondary_elements ?? {}
  const shiny = creativePackage.shiny ?? {}
  const types = Array.isArray(identity.types) ? identity.types.filter(Boolean) : []
  const standardMoves = Array.isArray(combat.standard_moves) ? combat.standard_moves : []
  const stats = combat.stats ?? {}
  const palette = creature.palette ?? {}
  const signatureAnatomy = Array.isArray(creature.signature_anatomy)
    ? creature.signature_anatomy
    : []

  pushIf(errors, creativePackage.version !== 'creative-package-v1', 'INVALID_PACKAGE_VERSION', 'La version du Creative Package doit être creative-package-v1.')
  pushIf(errors, !isFilled(creativePackage.assessment_id), 'ASSESSMENT_ID_REQUIRED', 'L’identifiant du questionnaire est absent.')
  pushIf(errors, identity.name_policy !== 'AI_GENERATED', 'CREATURE_NAME_AI_POLICY_REQUIRED', 'Le nom du Pokémon doit être confié à l’IA finale.')
  pushIf(errors, !identity.name_generation_brief || !identity.name_requirements, 'CREATURE_NAME_GENERATION_BRIEF_REQUIRED', 'Le brief de génération du nom du Pokémon est absent ou incomplet.')
  pushIf(errors, !isFilled(identity.category), 'CREATURE_CATEGORY_REQUIRED', 'La catégorie de la créature est absente.')
  pushIf(errors, !isFilled(identity.animal), 'ANIMAL_REQUIRED', 'L’animal source est absent.')
  pushIf(errors, types.length < 1 || types.length > 2, 'INVALID_TYPES', 'La créature doit avoir un ou deux types.')
  pushIf(errors, !Array.isArray(identity.type_badges) || identity.type_badges.length !== types.length, 'IDENTITY_TYPE_BADGES_REQUIRED', 'Chaque type de la créature doit disposer de son badge graphique.')
  pushIf(errors, !identity.role_badge || !isFilled(identity.role_badge.icon_concept), 'ROLE_BADGE_REQUIRED', 'Le rôle doit disposer d’un badge graphique avec icône.')

  pushIf(errors, !isFilled(creature.body_plan), 'BODY_PLAN_REQUIRED', 'Le plan corporel canonique est absent.')
  pushIf(errors, !creature.limbs || typeof creature.limbs !== 'object', 'LIMBS_REQUIRED', 'La définition des membres est absente.')
  pushIf(errors, !creature.tail || typeof creature.tail !== 'object', 'TAIL_REQUIRED', 'La définition de la queue est absente.')
  pushIf(errors, signatureAnatomy.length < 1, 'SIGNATURE_ANATOMY_REQUIRED', 'Au moins une anatomie signature est requise.')

  for (const key of REQUIRED_PALETTE) {
    pushIf(errors, !isFilled(palette[key]), 'PALETTE_INCOMPLETE', `La couleur ${key} est absente de la palette canonique.`)
  }

  pushIf(errors, !(Number(biology.height_m) > 0), 'HEIGHT_REQUIRED', 'La taille doit être définie et supérieure à zéro.')
  pushIf(errors, !(Number(biology.weight_kg) > 0), 'WEIGHT_REQUIRED', 'Le poids doit être défini et supérieur à zéro.')
  pushIf(errors, !isFilled(biology.footprint_type), 'FOOTPRINT_REQUIRED', 'Le type d’empreinte est absent.')

  pushIf(errors, !isFilled(combat.role), 'COMBAT_ROLE_REQUIRED', 'Le rôle de combat est absent.')
  pushIf(errors, !isFilled(combat.orientation), 'COMBAT_ORIENTATION_REQUIRED', 'L’orientation de combat est absente.')
  pushIf(errors, !combat.main_ability || !isFilled(combat.main_ability.name), 'MAIN_ABILITY_REQUIRED', 'Le talent principal officiel est absent.')
  pushIf(errors, combat.main_ability?.official !== true, 'MAIN_ABILITY_MUST_BE_OFFICIAL', 'Le talent principal doit provenir du catalogue officiel V1.')
  pushIf(errors, !combat.hidden_ability, 'HIDDEN_ABILITY_REQUIRED', 'Le talent caché original est absent.')
  pushIf(errors, combat.hidden_ability?.official === true, 'HIDDEN_ABILITY_MUST_BE_ORIGINAL', 'Le talent caché doit être original.')
  pushIf(errors, combat.hidden_ability?.name_policy !== 'AI_GENERATED', 'HIDDEN_ABILITY_AI_NAME_POLICY_REQUIRED', 'Le nom du talent caché doit être confié à l’IA finale.')
  pushIf(errors, !combat.hidden_ability?.generation_brief || !combat.hidden_ability?.mechanic_brief, 'HIDDEN_ABILITY_GENERATION_BRIEF_REQUIRED', 'Le brief canonique du talent caché est incomplet.')
  pushIf(errors, !isFilled(combat.hidden_ability?.trigger) || !isFilled(combat.hidden_ability?.effect), 'HIDDEN_ABILITY_MECHANIC_REQUIRED', 'La mécanique canonique du talent caché doit définir son déclenchement et son effet.')

  pushIf(errors, standardMoves.length !== 3, 'EXACTLY_THREE_STANDARD_MOVES_REQUIRED', 'Le panneau Attaques doit contenir exactement trois attaques standard.')

  const standardOrigins = standardMoves.map((move) => move?.origin)
  const originalMoves = standardMoves.filter((move) => (
    move?.origin === 'animal-original' ||
    move?.origin === 'type-original'
  ))
  const officialMoves = standardMoves.filter((move) => move?.origin === 'official-existing')

  pushIf(
    errors,
    originalMoves.length !== 1,
    'EXACTLY_ONE_ORIGINAL_STANDARD_MOVE_REQUIRED',
    'Le panneau Attaques doit contenir exactement une attaque originale, construite soit depuis l’animal, soit depuis le type.'
  )

  pushIf(
    errors,
    officialMoves.length !== 2,
    'EXACTLY_TWO_OFFICIAL_STANDARD_MOVES_REQUIRED',
    'Les attaques standard 2 et 3 doivent être deux capacités officielles existantes.'
  )

  pushIf(
    errors,
    officialMoves.length === 2 && officialMoves[0]?.name === officialMoves[1]?.name,
    'OFFICIAL_STANDARD_MOVES_MUST_BE_DISTINCT',
    'Les deux capacités officielles standard doivent être différentes.'
  )

  pushIf(errors, standardOrigins.includes('signature-original') || standardMoves.some((move) => move?.is_signature === true), 'SIGNATURE_IN_STANDARD_MOVES_FORBIDDEN', 'L’attaque signature ne doit jamais apparaître dans la liste des trois attaques standard.')

  for (const [index, move] of standardMoves.entries()) {
    pushIf(errors, !move || !isFilled(move.name), 'MOVE_NAME_REQUIRED', `L’attaque standard ${index + 1} n’a pas de nom.`)
    pushIf(errors, !move || !isFilled(move.type), 'MOVE_TYPE_REQUIRED', `L’attaque standard ${index + 1} n’a pas de type.`)
    pushIf(errors, !move || !isFilled(move.category), 'MOVE_CATEGORY_REQUIRED', `L’attaque standard ${index + 1} n’a pas de catégorie.`)
    pushIf(errors, !move || !isFilled(move.effect || move.description), 'MOVE_EFFECT_REQUIRED', `L’attaque standard ${index + 1} n’a pas de description/effet.`)
    pushIf(errors, !move?.ui?.function_icon, 'MOVE_FUNCTION_ICON_REQUIRED', `L’attaque standard ${index + 1} n’a pas d’icône fonctionnelle définie.`)
    pushIf(errors, !Array.isArray(move?.ui?.type_badges) || move.ui.type_badges.length < 1, 'MOVE_TYPE_BADGE_REQUIRED', `L’attaque standard ${index + 1} n’a pas de badge de type défini.`)
  }

  pushIf(
    errors,
    officialMoves.some((move) => move?.official !== true),
    'OFFICIAL_MOVES_REQUIRED',
    'Les deux capacités officielles doivent provenir du catalogue officiel V1.'
  )

  const signatureMove = signature.data ?? null
  pushIf(errors, !signatureMove || signatureMove.origin !== 'signature-original' || signatureMove.is_signature !== true, 'SIGNATURE_MOVE_REQUIRED', 'L’attaque signature originale séparée est absente.')
  pushIf(errors, signatureMove?.name_policy !== 'AI_GENERATED', 'SIGNATURE_MOVE_AI_NAME_POLICY_REQUIRED', 'Le nom de l’attaque signature doit être confié à l’IA finale.')
  pushIf(errors, !isFilled(signatureMove?.type), 'SIGNATURE_MOVE_TYPE_REQUIRED', 'L’attaque signature n’a pas de type.')
  pushIf(errors, !isFilled(signatureMove?.category), 'SIGNATURE_MOVE_CATEGORY_REQUIRED', 'L’attaque signature n’a pas de catégorie.')
  pushIf(errors, !signatureMove?.generation_brief || !isFilled(signatureMove?.mechanic_brief), 'SIGNATURE_MOVE_GENERATION_BRIEF_REQUIRED', 'Le brief canonique nécessaire à la génération IA de l’attaque signature est incomplet.')
  pushIf(errors, !signatureMove?.ui?.function_icon, 'SIGNATURE_FUNCTION_ICON_REQUIRED', 'L’attaque signature n’a pas d’icône fonctionnelle définie.')
  pushIf(errors, !Array.isArray(signatureMove?.ui?.type_badges) || signatureMove.ui.type_badges.length < 1, 'SIGNATURE_TYPE_BADGE_REQUIRED', 'L’attaque signature n’a pas de badge de type défini.')
  pushIf(errors, !isFilled(signatureMove?.anatomical_source), 'SIGNATURE_MOVE_ANATOMY_REQUIRED', 'L’attaque signature doit utiliser une source anatomique canonique.')
  pushIf(errors, !signature.visual_concept || !isFilled(signature.visual_concept.anatomical_source), 'SIGNATURE_VISUAL_REQUIRED', 'Le concept visuel de l’attaque signature est incomplet.')

  for (const stat of REQUIRED_STATS) {
    pushIf(errors, !Number.isFinite(Number(stats[stat])), 'STAT_REQUIRED', `La statistique ${stat} est absente ou invalide.`)
  }

  const statTotal = REQUIRED_STATS.reduce((sum, stat) => sum + Number(stats[stat] ?? 0), 0)
  pushIf(errors, !Number.isFinite(Number(combat.bst)), 'BST_REQUIRED', 'Le BST est absent ou invalide.')
  pushIf(errors, Number(combat.bst) !== statTotal, 'BST_MISMATCH', 'Le BST doit être exactement égal à la somme des six statistiques.')

  pushIf(errors, shiny.rule !== 'RECOLOR_ONLY', 'SHINY_RULE_INVALID', 'Le shiny doit être une recoloration uniquement.')
  pushIf(errors, !shiny.palette || typeof shiny.palette !== 'object', 'SHINY_PALETTE_REQUIRED', 'La palette shiny calculée est absente.')

  pushIf(errors, creativePackage.layout_spec?.format?.orientation !== 'landscape', 'LANDSCAPE_LAYOUT_REQUIRED', 'La fiche finale doit être définie en format paysage.')
  pushIf(errors, creativePackage.generation_contract?.required_output !== 'ONE_SINGLE_COMPLETE_IMAGE', 'SINGLE_IMAGE_CONTRACT_REQUIRED', 'Le contrat final doit demander une seule image complète.')

  return {
    valid: errors.length === 0,
    errors,
  }
}

function assertValidCreativePackage(creativePackage) {
  const validation = validateCreativePackage(creativePackage)

  if (!validation.valid) {
    const error = new Error(
      `CREATIVE_PACKAGE_INVALID: ${validation.errors.map((item) => item.code).join(', ')}`
    )

    error.code = 'CREATIVE_PACKAGE_INVALID'
    error.validation = validation
    throw error
  }

  return validation
}

module.exports = {
  REQUIRED_STATS,
  REQUIRED_PALETTE,
  validateCreativePackage,
  assertValidCreativePackage,
}
