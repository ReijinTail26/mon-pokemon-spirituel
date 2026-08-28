const CREATIVE_DOSSIER_VERSION =
  'creative-dossier-v1'

function formatTypes(
  types = []
) {
  const clean = types.filter(Boolean)

  return clean.length > 0
    ? clean.join(' / ')
    : 'Inconnu'
}

function formatAbility(
  ability
) {
  if (!ability) {
    return null
  }

  if (
    typeof ability === 'string'
  ) {
    return {
      name: ability,
    }
  }

  return {
    name:
      ability.name ??
      (ability.name_policy === 'AI_GENERATED'
        ? 'À créer par l’IA finale'
        : 'Inconnu'),

    name_policy:
      ability.name_policy,

    tags:
      ability.tags ?? [],

    trigger:
      ability.trigger,

    condition:
      ability.condition,

    effect:
      ability.effect,

    magnitude:
      ability.magnitude,

    thematic_origin:
      ability.thematic_origin,

    mechanic_brief:
      ability.mechanic_brief,

    generation_brief:
      ability.generation_brief,
  }
}

function buildSocialBehaviorLabel(
  value
) {
  if (
    typeof value !==
    'number'
  ) {
    return null
  }

  if (value < 35) {
    return 'tendance plutôt solitaire'
  }

  if (value < 50) {
    return 'sociabilité modérée'
  }

  if (value < 65) {
    return 'aime alterner autonomie et présence des autres'
  }

  return 'recherche facilement la présence des autres'
}

function buildCreativeDossierModel({
  creativePackage,
}) {
  if (!creativePackage) {
    throw new Error(
      'CREATIVE_PACKAGE_REQUIRED'
    )
  }

  const identity =
    creativePackage.identity ??
    {}

  const creature =
    creativePackage.creature_spec ??
    {}

  const biology =
    creativePackage.biology ??
    {}

  const combat =
    creativePackage.combat ??
    {}

  const signatureMove =
    creativePackage.signature_move ??
    {}

  const secondary =
    creativePackage.secondary_elements ??
    {}

  const layout =
    creativePackage.layout_spec ??
    {}

  const environment = creativePackage.environment ?? {}
  const visualSeed = creativePackage.visual_seed ?? {}

  return {
    version:
      CREATIVE_DOSSIER_VERSION,

    assessment_id:
      creativePackage.assessment_id,

    document: {
      title: 'Dossier créatif — Pokémon personnalisé',

      subtitle: [
        identity.category,
        formatTypes(
          identity.types
        ),
      ]
        .filter(Boolean)
        .join(' • '),

      intended_use:
        'Ce dossier est destiné à servir de référence canonique pour générer une fiche illustrée complète via une IA.',
    },

    summary: {
      name:
        identity.name ?? 'À créer par l’IA finale',

      name_policy:
        identity.name_policy,

      name_requirements:
        identity.name_requirements,

      name_generation_brief:
        identity.name_generation_brief,

      category:
        identity.category,

      animal:
        identity.animal,

      animal_variant:
        identity.animal_variant ??
        creature.morphology_variant?.label ??
        null,

      types:
        identity.types ?? [],

      type_badges:
        identity.type_badges ?? [],

      role:
        identity.role,

      role_badge:
        identity.role_badge,

      personality_summary:
        identity.personality_summary,

      person_description:
        identity.person_description,

      behavior_summary:
        identity.behavior_summary,

      pokedex_description:
        identity.pokedex_description,
    },

    personality: {
      summary:
        identity.personality_summary,

      behavior:
        identity.behavior_summary,

      role:
        identity.role,

      social_behavior:
        buildSocialBehaviorLabel(
          biology.social_behavior
        ),

      habitat_tendency:
        biology.habitat_tendency,

      signature_behavior:
        biology.signature_behavior,
    },

    visual_spec: {
      morphology_variant:
        creature.morphology_variant ?? null,

      morphology_directive:
        creature.morphology_directive ?? null,

      body_plan:
        creature.body_plan,

      locomotion:
        creature.locomotion ?? [],

      silhouette:
        creature.silhouette,

      proportions:
        creature.proportions,

      head:
        creature.head,

      eyes:
        creature.eyes,

      limbs:
        creature.limbs,

      tail:
        creature.tail,

      appendages:
        creature.appendages ??
        [],

      signature_anatomy:
        creature.signature_anatomy ??
        [],

      animal_markers:
        creature.animal_markers ??
        [],

      type_markers:
        creature.type_markers ??
        [],

      surfaces:
        creature.surfaces,

      patterns:
        creature.patterns ?? [],

      palette:
        creature.palette,

      posture:
        creature.posture,

      expression:
        creature.expression,

      visual_attitude:
        creature.visual_attitude,
    },

    biology_sheet: {
      height_m:
        biology.height_m,

      weight_kg:
        biology.weight_kg,

      habitat_tendency:
        biology.habitat_tendency,

      social_behavior:
        buildSocialBehaviorLabel(
          biology.social_behavior
        ),

      signature_behavior:
        biology.signature_behavior,
    },

    combat_sheet: {
      role:
        combat.role,

      orientation:
        combat.orientation,

      bst:
        combat.bst,

      stats:
        combat.stats,

      main_ability:
        formatAbility(
          combat.main_ability
        ),

      hidden_ability:
        formatAbility(
          combat.hidden_ability
        ),

      standard_moves:
        combat.standard_moves ?? [],
    },

    signature_move_sheet: {
      data:
        signatureMove.data,

      visual_concept:
        signatureMove.visual_concept,
    },

    reference_views_sheet: {
      shiny:
        creativePackage.shiny,
    },

    environment_sheet: {
      background: environment.background ?? null,
      instruction: 'Utiliser cette image comme référence canonique d’environnement pour le grand visuel et comme base réinterprétée pour la scène de l’attaque signature. Le Pokémon doit rester le sujet dominant, avec une silhouette parfaitement lisible.',
    },

    visual_seed_sheet: visualSeed,

    art_direction: {
      title:
        'Direction artistique',

      main_instruction:
        'La créature finale doit être représentée comme un Pokémon original, stylisé et non réaliste.',

      description:
        'Le design doit évoquer une espèce de Pokémon crédible et inédite : silhouette forte, formes simplifiées, anatomie expressive, couleurs lisibles et finition illustrée propre.',

      principles:
        creativePackage
          .art_direction
          ?.design_principles ??
        [],

      desired_feeling:
        creativePackage
          .art_direction
          ?.must_feel_like ??
        [],

      avoid:
        creativePackage
          .art_direction
          ?.forbidden_rendering ??
        [],

      branding_rules:
        creativePackage
          .art_direction
          ?.branding_rules ??
        [],
    },

    final_render_spec: {
      layout_version:
        layout.version,

      objective:
        'Produire une seule image finale sous forme de fiche encyclopédique illustrée.',

      global_format:
        layout.format,

      upper_zone:
        layout.upper_zone,

      combat_zone:
        layout.combat_zone,

      interface_style:
        layout.interface_style,

      critical_rules: [
        'La zone identité/description ne doit afficher ni le talent principal ni le talent caché ; ces talents apparaissent uniquement dans Talents & Stats.',
        'La description de la zone identité doit traduire les résultats Big Five en comportement et tempérament du Pokémon lui-même, sans parler de « cette personne » et sans afficher les scores numériques.',
        'Le grand visuel principal doit dominer la zone supérieure.',
        'Le background canonique sélectionné doit être utilisé comme référence visuelle pour le grand visuel et réinterprété de façon cohérente dans la scène de l’attaque signature.',
        'Le background ne doit jamais voler la vedette au Pokémon, casser la lisibilité de sa silhouette, changer arbitrairement entre les panneaux ou être décoratif sans rapport avec le résultat.',
        'Le décor éventuellement visible dans la Visual Seed doit être totalement ignoré et ne doit influencer ni remplacer le background canonique sélectionné.',
        'Le design suit Two-Pass Creature Design V4 : création DNA-only, transformation libre par le sujet de la Seed, puis verrouillage canonique.',
        'PRIORITÉ MORPHOLOGIQUE CRITIQUE : le morphotype animal sélectionné est l’un des paramètres structurels les plus importants du design final (poids indicatif 1,00).',
        'Le morphotype exact doit être lu AVANT le nom large de la famille animale. Le nom de famille est secondaire et ne doit jamais réinjecter sa forme stéréotypée.',
        'Avant toute conception, l’IA doit valider le contrat positif required_body_plan et rejeter explicitement les forbidden_body_plans propres au morphotype sélectionné.',
        'La Visual Seed peut fortement styliser et réinterpréter le morphotype, mais elle ne doit jamais le remplacer par un autre morphotype ni le ramener vers la forme générique/stéréotypée de la famille animale.',
        'Le plan corporel de famille, la logique des membres, la présence/absence logique d’ailes ou appendices majeurs, la famille de structure de queue, la construction tête/cou, la locomotion et les traits signatures du morphotype doivent rester reconnaissables dans le Pokémon final.',
        'Pendant la transformation Seed, silhouette, proportions, tête, cou, ailes, membres, queue, volumes, surfaces et stylisation peuvent être profondément modifiés.',
        'Une fois la transformation terminée, le grand visuel, Face, Dos, Shiny, Pose et attaque signature doivent représenter exactement le même Pokémon final.',
        'Effectuer silencieusement deux contrôles successifs de cohérence entre ces six représentations.',
        'L’illustration de l’attaque signature doit être physiquement cohérente avec l’anatomie finale : posture, mouvement, source, trajectoire, effet, impact et follow-through doivent former une action crédible.',
        'Les vues Face/Dos/Shiny/Pose utilisent un fond neutre ou très simplifié afin de préserver la lecture anatomique.',
        'Toutes les vues de référence doivent représenter exactement la même créature.',
        'La vue de profil est remplacée par une vue Shiny de la même créature, avec recoloration uniquement.',
        'Le bloc Attaques contient exactement 3 attaques standard : une attaque originale créée soit depuis un trait de l’animal soit depuis le type, puis deux capacités officielles existantes distinctes.',
        'L’attaque signature est la quatrième attaque du kit, mais elle ne doit jamais apparaître dans la liste des 3 attaques standard : elle possède son propre bloc adjacent.',
        'Chaque attaque standard affiche : icône fonctionnelle, nom, badge(s) de type, catégorie, puissance, description/effet.',
        'L’attaque signature affiche les mêmes informations plus un visuel illustratif associé.',
        'Son nom ainsi que la formulation finale de sa description et de son effet sont volontairement créés par l’IA finale à partir du brief canonique ; le type, la catégorie, la puissance, l’anatomie source et la mécanique restent imposés.',
        'Les badges de type utilisent le même système graphique dans la Description et dans les attaques.',
        'Le rôle apparaît près des types sous forme de rectangle avec icône dédiée + nom du rôle, jamais sous forme d’une simple ligne « Rôle : ... ».',
        'La ligne de combat doit regrouper 3 attaques standard, attaque signature, talent/talent caché et statistiques.',
        'Aucun bandeau inférieur séparé ne doit être ajouté.',
        'Le rendu doit être premium, lisible et proche du layout de référence, sans copier de logo officiel.',
      ],
    },

    prompt_contract:
      creativePackage.generation_contract,
  }
}

module.exports = {
  CREATIVE_DOSSIER_VERSION,
  buildCreativeDossierModel,
}