const ROLE_BADGES = {
  Assaillant: {
    icon_key: 'sword',
    icon_concept: 'épée stylisée',
  },
  Berserker: {
    icon_key: 'axe',
    icon_concept: 'hache de guerre stylisée',
  },
  Éclaireur: {
    icon_key: 'bow',
    icon_concept: 'arc stylisé',
  },
  Contrôleur: {
    icon_key: 'control_seal',
    icon_concept: 'sceau de contrôle entouré d’un anneau',
  },
  Spécialiste: {
    icon_key: 'magic_staff',
    icon_concept: 'bâton magique stylisé',
  },
  Défenseur: {
    icon_key: 'tower_shield',
    icon_concept: 'grand bouclier défensif',
  },
  Protecteur: {
    icon_key: 'hammer_shield',
    icon_concept: 'marteau accompagné d’un bouclier',
  },
  Adaptateur: {
    icon_key: 'adaptive_arrows',
    icon_concept: 'deux flèches courbes opposées symbolisant l’adaptation',
  },
  Hybride: {
    icon_key: 'spear',
    icon_concept: 'lance stylisée',
  },
}

const TYPE_BADGES = {
  Normal: { icon_concept: 'cercle neutre', visual_family: 'badge de type Pokémon Normal' },
  Feu: { icon_concept: 'flamme', visual_family: 'badge de type Pokémon Feu' },
  Eau: { icon_concept: 'goutte', visual_family: 'badge de type Pokémon Eau' },
  Électrik: { icon_concept: 'éclair', visual_family: 'badge de type Pokémon Électrik' },
  Plante: { icon_concept: 'feuille', visual_family: 'badge de type Pokémon Plante' },
  Glace: { icon_concept: 'flocon', visual_family: 'badge de type Pokémon Glace' },
  Combat: { icon_concept: 'poing', visual_family: 'badge de type Pokémon Combat' },
  Poison: { icon_concept: 'symbole toxique stylisé', visual_family: 'badge de type Pokémon Poison' },
  Sol: { icon_concept: 'strate de terrain', visual_family: 'badge de type Pokémon Sol' },
  Vol: { icon_concept: 'aile', visual_family: 'badge de type Pokémon Vol' },
  Psy: { icon_concept: 'spirale psychique', visual_family: 'badge de type Pokémon Psy' },
  Insecte: { icon_concept: 'silhouette d’insecte', visual_family: 'badge de type Pokémon Insecte' },
  Roche: { icon_concept: 'facette rocheuse', visual_family: 'badge de type Pokémon Roche' },
  Spectre: { icon_concept: 'spectre stylisé', visual_family: 'badge de type Pokémon Spectre' },
  Dragon: { icon_concept: 'tête de dragon stylisée', visual_family: 'badge de type Pokémon Dragon' },
  Ténèbres: { icon_concept: 'croissant sombre stylisé', visual_family: 'badge de type Pokémon Ténèbres' },
  Acier: { icon_concept: 'écrou/facette métallique', visual_family: 'badge de type Pokémon Acier' },
  Fée: { icon_concept: 'étoile féerique', visual_family: 'badge de type Pokémon Fée' },
}

function getRoleBadge(role) {
  const design = ROLE_BADGES[role] ?? {
    icon_key: 'role_emblem',
    icon_concept: 'emblème tactique stylisé',
  }

  return {
    role,
    ...design,
    layout: 'rectangular_badge_icon_left_label_right',
  }
}

function inferMoveIcon(move = {}) {
  const category = String(move.category ?? '')
  const text = `${move.description ?? ''} ${move.effect ?? ''}`.toLowerCase()

  if (/protège|protection|défense|bouclier|rempart|résiste/.test(text)) {
    return { icon_key: 'shield', icon_concept: 'bouclier stylisé' }
  }
  if (/soigne|soin|récup|régén|soutien|allié|aide/.test(text)) {
    return { icon_key: 'support_aura', icon_concept: 'aura de soutien stylisée' }
  }
  if (/vitesse|mobilité|esquiv|priorité|déplacement|ralent/.test(text)) {
    return { icon_key: 'mobility', icon_concept: 'flèche de mouvement stylisée' }
  }
  if (/contrôle|entrave|bloque|immobil|piège|terrain|statut/.test(text) || category === 'Statut') {
    return { icon_key: 'control', icon_concept: 'anneau ou sceau de contrôle stylisé' }
  }
  if (category === 'Spéciale') {
    return { icon_key: 'special_burst', icon_concept: 'éclat d’énergie stylisé' }
  }
  return { icon_key: 'physical_strike', icon_concept: 'impact ou armes croisées stylisées' }
}

function getTypeBadges(types = []) {
  return (Array.isArray(types) ? types : [types])
    .filter(Boolean)
    .map((type) => ({
      type,
      ...(TYPE_BADGES[type] ?? {
        icon_concept: 'symbole de type stylisé',
        visual_family: `badge de type Pokémon ${type}`,
      }),
      layout: 'compact_icon_and_label_badge',
      consistency_rule: 'use_the_same_type_icon_and_badge_system_everywhere_on_the_sheet',
    }))
}

function decorateMove(move = {}) {
  const moveTypes = Array.isArray(move.types)
    ? move.types
    : [move.type].filter(Boolean)

  return {
    ...move,
    ui: {
      function_icon: inferMoveIcon(move),
      type_badges: getTypeBadges(moveTypes),
      required_fields: [
        'function_icon',
        'name',
        'type_badges',
        'category',
        'power',
        'description_or_effect',
      ],
    },
  }
}

module.exports = {
  ROLE_BADGES,
  TYPE_BADGES,
  getRoleBadge,
  getTypeBadges,
  decorateMove,
}
