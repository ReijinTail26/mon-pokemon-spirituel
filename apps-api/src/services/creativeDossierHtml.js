const fs = require('fs')
const path = require('path')

function escapeHtml(
  value
) {
  return String(
    value ?? ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}

function formatLabel(value) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

function renderStructuredValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '<span class="muted">Non précisé</span>'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '<span class="muted">Aucun</span>'
    }

    if (
      value.every(
        (item) =>
          item === null ||
          ['string', 'number', 'boolean'].includes(typeof item)
      )
    ) {
      return escapeHtml(
        value
          .filter((item) => item !== null)
          .join(' • ')
      )
    }

    return `
      <ul class="nested-list">
        ${value
          .map(
            (item) => `
              <li>
                ${renderStructuredValue(item)}
              </li>
            `
          )
          .join('')}
      </ul>
    `
  }

  if (typeof value === 'object') {
    return `
      <div class="nested-kv">
        ${Object.entries(value)
          .filter(([, nestedValue]) =>
            nestedValue !== undefined &&
            nestedValue !== null &&
            nestedValue !== ''
          )
          .map(
            ([key, nestedValue]) => `
              <div class="nested-kv-row">
                <span class="nested-kv-key">
                  ${escapeHtml(formatLabel(key))}
                </span>
                <span class="nested-kv-value">
                  ${renderStructuredValue(nestedValue)}
                </span>
              </div>
            `
          )
          .join('')}
      </div>
    `
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  return escapeHtml(value)
}

function renderList(
  items = []
) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return `
      <p class="muted">
        Non précisé
      </p>
    `
  }

  return `
    <ul>
      ${items
        .map(
          (item) => `
            <li>
              ${renderStructuredValue(item)}
            </li>
          `
        )
        .join('')}
    </ul>
  `
}

function renderKeyValues(
  object = {}
) {
  if (
    !object ||
    typeof object !== 'object'
  ) {
    return `
      <p class="muted">
        Non précisé
      </p>
    `
  }

  const entries =
    Object.entries(object)
      .filter(([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ''
      )

  if (entries.length === 0) {
    return `
      <p class="muted">
        Non précisé
      </p>
    `
  }

  return `
    <div class="key-values">
      ${entries
        .map(
          ([key, value]) => `
            <div class="kv-row">
              <span class="kv-key">
                ${escapeHtml(
                  formatLabel(key)
                )}
              </span>

              <span class="kv-value">
                ${renderStructuredValue(value)}
              </span>
            </div>
          `
        )
        .join('')}
    </div>
  `
}

function renderTypeBadges(
  badges = []
) {
  return `
    <div class="type-badges">
      ${(badges ?? [])
        .map(
          (badge) => `
            <span class="type-badge">
              <span class="type-symbol">
                ${escapeHtml(
                  badge.icon_concept ??
                  'symbole'
                )}
              </span>
              ${escapeHtml(
                badge.type
              )}
            </span>
          `
        )
        .join('')}
    </div>
  `
}

function renderMoves(
  moves = []
) {
  return `
    <div class="moves-grid">
      ${(moves ?? [])
        .map(
          (move) => `
            <article class="move-card">
              <div class="move-title-row">
                <span class="move-function-icon">
                  ${escapeHtml(
                    move.ui
                      ?.function_icon
                      ?.icon_concept ??
                    'icône fonctionnelle'
                  )}
                </span>
                <h4>
                  ${escapeHtml(
                    move.name
                  )}
                </h4>
              </div>

              ${renderTypeBadges(
                move.ui
                  ?.type_badges ??
                []
              )}

              <div class="move-core-data">
                <span>
                  <strong>Catégorie :</strong>
                  ${escapeHtml(
                    move.category ?? '—'
                  )}
                </span>
                <span>
                  <strong>Puissance :</strong>
                  ${escapeHtml(
                    move.power ?? '—'
                  )}
                </span>
              </div>

              ${move.description
                ? `<p>${escapeHtml(move.description)}</p>`
                : ''}

              ${move.effect
                ? `
                  <p class="move-effect">
                    <strong>Effet :</strong>
                    ${escapeHtml(move.effect)}
                  </p>
                `
                : ''}
            </article>
          `
        )
        .join('')}
    </div>
  `
}

function renderStats(
  stats = {}
) {
  return `
    <div class="stats-grid">
      ${Object.entries(
        stats
      )
        .map(
          ([name, value]) => `
            <div class="stat-row">
              <span>
                ${escapeHtml(
                  name
                )}
              </span>

              <strong>
                ${escapeHtml(
                  value
                )}
              </strong>
            </div>
          `
        )
        .join('')}
    </div>
  `
}

function backgroundDataUrl(background) {
  try {
    if (!background?.file) return null
    const filePath = path.join(__dirname, '../../assets/backgrounds', background.file)
    const bytes = fs.readFileSync(filePath)
    return `data:image/png;base64,${bytes.toString('base64')}`
  } catch {
    return null
  }
}

function visualSeedDataUrl(visualSeed) {
  try {
    const model = visualSeed?.model
    if (!model?.file || !model?.folder) return null
    const relativeFolder = String(model.folder).replace(/^assets\//, '')
    const filePath = path.join(__dirname, '../../assets', relativeFolder, model.file)
    const bytes = fs.readFileSync(filePath)
    const extension = path.extname(model.file).toLowerCase()
    const mime = extension === '.png'
      ? 'image/png'
      : extension === '.webp'
        ? 'image/webp'
        : 'image/jpeg'
    return `data:${mime};base64,${bytes.toString('base64')}`
  } catch {
    return null
  }
}

function buildCreativeDossierHtml({
  creativeDossier,
}) {
  if (!creativeDossier) {
    throw new Error(
      'CREATIVE_DOSSIER_REQUIRED'
    )
  }

  const artDirection =
    creativeDossier
      .art_direction ??
    {}

  const summary =
    creativeDossier.summary ??
    {}

  const personality =
    creativeDossier.personality ??
    {}

  const visual =
    creativeDossier.visual_spec ??
    {}

  const biology =
    creativeDossier.biology_sheet ??
    {}

  const combat =
    creativeDossier.combat_sheet ??
    {}

  const signature =
    creativeDossier
      .signature_move_sheet ??
    {}

  const referenceViews =
    creativeDossier
      .reference_views_sheet ??
    {}

  const render =
    creativeDossier
      .final_render_spec ??
    {}

  const environment = creativeDossier.environment_sheet ?? {}
  const background = environment.background ?? {}
  const backgroundImage = backgroundDataUrl(background)
  const visualSeed = creativeDossier.visual_seed_sheet ?? {}
  const visualSeedImage = visualSeedDataUrl(visualSeed)

  return `
<!doctype html>

<html lang="fr">

<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>
    ${escapeHtml(
      creativeDossier
        .document
        ?.title ??
      'Dossier créatif'
    )}
  </title>

  <style>
    @page {
      size: A4;
      margin: 14mm;
    }

    * {
      box-sizing:
        border-box;
    }

    body {
      margin: 0;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      color:
        #111827;

      background:
        #ffffff;

      font-size:
        11pt;

      line-height:
        1.45;
    }

    .page {
      page-break-after:
        always;
    }

    .page:last-child {
      page-break-after:
        auto;
    }

    .hero {
      min-height:
        258mm;

      display:
        flex;

      flex-direction:
        column;

      justify-content:
        space-between;

      padding:
        8mm;

      border-radius:
        8mm;

      color:
        #ffffff;

      background:
        linear-gradient(
          145deg,
          #101827,
          #18253a 55%,
          #202f47
        );
    }

    .eyebrow {
      margin:
        0 0 4mm;

      text-transform:
        uppercase;

      letter-spacing:
        0.16em;

      font-size:
        9pt;

      opacity:
        0.72;
    }

    h1 {
      margin:
        0;

      font-size:
        31pt;

      line-height:
        1.05;
    }

    .hero-subtitle {
      margin:
        4mm 0 0;

      font-size:
        14pt;

      opacity:
        0.84;
    }

    .hero-description {
      max-width:
        150mm;

      margin-top:
        14mm;

      font-size:
        15pt;

      line-height:
        1.5;
    }

    .type-row {
      display:
        flex;

      gap:
        3mm;

      flex-wrap:
        wrap;

      margin-top:
        8mm;
    }

    .badge {
      display:
        inline-block;

      padding:
        2.5mm 5mm;

      border:
        1px solid
          rgba(
            255,
            255,
            255,
            0.28
          );

      border-radius:
        99mm;

      background:
        rgba(
          255,
          255,
          255,
          0.08
        );
    }

    .hero-grid {
      display:
        grid;

      grid-template-columns:
        repeat(
          3,
          1fr
        );

      gap:
        5mm;

      margin-top:
        10mm;
    }

    .hero-box {
      padding:
        5mm;

      border-radius:
        5mm;

      background:
        rgba(
          255,
          255,
          255,
          0.07
        );

      border:
        1px solid
          rgba(
            255,
            255,
            255,
            0.12
          );
    }

    .hero-box span {
      display:
        block;

      margin-bottom:
        2mm;

      font-size:
        8.5pt;

      opacity:
        0.62;

      text-transform:
        uppercase;

      letter-spacing:
        0.1em;
    }


    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 3mm;
      margin-top: 4mm;
      padding: 2.5mm 4mm;
      border-radius: 4mm;
      border: 1px solid rgba(255, 255, 255, 0.24);
      background: rgba(255, 255, 255, 0.09);
    }

    .role-badge-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 10mm;
      min-height: 10mm;
      padding: 1.5mm;
      border-radius: 3mm;
      background: rgba(255, 255, 255, 0.10);
      font-size: 7pt;
      text-align: center;
    }

    .hero-grid-two {
      grid-template-columns: 1fr 1fr;
    }

    .section-title {
      margin:
        0 0 7mm;

      font-size:
        23pt;

      line-height:
        1.1;
    }

    .section-lead {
      margin:
        -2mm 0 8mm;

      color:
        #536071;

      font-size:
        12pt;
    }

    .panel {
      margin-bottom:
        6mm;

      padding:
        6mm;

      border:
        1px solid
          #dde3eb;

      border-radius:
        5mm;

      background:
        #f7f9fc;
    }

    .panel h3 {
      margin:
        0 0 4mm;

      font-size:
        14pt;
    }

    .two-columns {
      display:
        grid;

      grid-template-columns:
        1fr 1fr;

      gap:
        6mm;
    }

    .three-columns {
      display:
        grid;

      grid-template-columns:
        repeat(
          3,
          1fr
        );

      gap:
        5mm;
    }

    .key-values {
      display:
        grid;

      gap:
        2.5mm;
    }

    .kv-row {
      display:
        grid;

      grid-template-columns:
        43% 57%;

      gap:
        4mm;

      padding-bottom:
        2.5mm;

      border-bottom:
        1px solid
          #e3e8ef;
    }

    .kv-key {
      color:
        #647083;

      text-transform:
        capitalize;
    }

    .kv-value {
      font-weight:
        600;
    }

    ul {
      margin:
        0;

      padding-left:
        5mm;
    }

    li {
      margin-bottom:
        2mm;
    }

    .muted {
      color:
        #7a8594;
    }

    .palette {
      display:
        grid;

      grid-template-columns:
        repeat(
          4,
          1fr
        );

      gap:
        4mm;
    }

    .color-card {
      border:
        1px solid
          #dde3eb;

      overflow:
        hidden;

      border-radius:
        4mm;
    }

    .color-swatch {
      height:
        24mm;
    }

    .color-label {
      padding:
        3mm;

      font-size:
        9pt;

      background:
        #ffffff;
    }


    .type-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 2mm;
      margin: 2mm 0 3mm;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 2mm;
      padding: 1.4mm 2.5mm;
      border-radius: 99mm;
      border: 1px solid #d9dee7;
      background: #ffffff;
      font-size: 8.5pt;
      font-weight: 700;
    }

    .type-symbol {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 7mm;
      height: 7mm;
      border-radius: 50%;
      background: #edf1f6;
      font-size: 6.5pt;
      text-align: center;
    }

    .move-title-row {
      display: flex;
      align-items: center;
      gap: 3mm;
    }

    .move-title-row h4 {
      margin: 0;
    }

    .move-function-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 12mm;
      min-height: 12mm;
      padding: 2mm;
      border-radius: 50%;
      background: #eef2f7;
      font-size: 7pt;
      text-align: center;
    }

    .move-core-data {
      display: flex;
      flex-wrap: wrap;
      gap: 4mm;
      margin: 2mm 0;
      color: #536071;
      font-size: 9pt;
    }

    .moves-grid {
      display:
        grid;

      grid-template-columns:
        1fr 1fr;

      gap:
        4mm;
    }

    .move-card {
      padding:
        4mm;

      border:
        1px solid
          #dde3eb;

      border-radius:
        4mm;

      background:
        #ffffff;
    }

    .move-card h4 {
      margin:
        0 0 2mm;

      font-size:
        12pt;
    }

    .move-card p {
      margin:
        1mm 0;

      color:
        #536071;
    }

    .nested-kv {
      display: grid;
      gap: 1.5mm;
    }

    .nested-kv-row {
      display: grid;
      grid-template-columns: minmax(30mm, 38%) 1fr;
      gap: 2mm;
      padding-bottom: 1.5mm;
      border-bottom: 1px dashed #e1e6ed;
    }

    .nested-kv-key {
      color: #6b7687;
      font-size: 9pt;
    }

    .nested-kv-value {
      font-weight: 500;
    }

    .nested-list {
      margin: 0;
      padding-left: 4mm;
    }

    .move-meta {
      font-size: 9pt;
      font-weight: 700;
      color: #475569 !important;
    }

    .move-effect {
      padding-top: 2mm;
      border-top: 1px solid #e7ebf1;
    }

    .stats-grid {
      display:
        grid;

      gap:
        2mm;
    }

    .stat-row {
      display:
        flex;

      justify-content:
        space-between;

      gap:
        4mm;

      padding:
        2.5mm 3mm;

      background:
        #ffffff;

      border-radius:
        3mm;

      border:
        1px solid
          #e1e6ed;
    }

    .render-spec {
      padding:
        7mm;

      color:
        #eaf0f8;

      border-radius:
        6mm;

      background:
        #111a2a;
    }

    .render-spec h3 {
      color:
        #ffffff;
    }

    .layout-diagram {
      display:
        grid;

      grid-template-columns:
        1fr 2fr 1fr;

      grid-template-rows:
        92mm 68mm;

      gap:
        3mm;

      margin-top:
        7mm;
    }

    .layout-box {
      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      padding:
        4mm;

      text-align:
        center;

      border:
        1px solid
          rgba(
            255,
            255,
            255,
            0.25
          );

      border-radius:
        4mm;

      background:
        rgba(
          255,
          255,
          255,
          0.06
        );
    }

    .layout-hero {
      font-size:
        15pt;

      font-weight:
        700;
    }

    .layout-combat {
      grid-column:
        1 / 4;
    }


    .page-footer {
      margin-top:
        8mm;

      color:
        #8a94a3;

      text-align:
        center;

      font-size:
        8pt;
    }

    .background-reference-image {
      width: 100%;
      max-height: 118mm;
      object-fit: cover;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,.14);
      display: block;
      margin: 10px 0 14px;
    }

    .background-rule {
      font-weight: 700;
    }

    .visual-seed-page {
      page-break-after: always;
      break-after: page;
    }

    .visual-seed-image-page {
      min-height: 258mm;
      height: 258mm;
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .visual-seed-frame {
      flex: 1;
      width: 100%;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 6mm;
      padding: 3mm;
      border-radius: 14px;
      border: 1px solid rgba(17,24,39,.14);
      background: #f4f6f9;
      overflow: visible;
    }

    .visual-seed-reference-image {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center center;
      margin: auto;
      image-orientation: from-image;
    }
  </style>
</head>

<body>

  <!-- PAGE 1 -->

  <section class="page hero">
    <div>
      <p class="eyebrow">
        Dossier créatif canonique
      </p>

      <h1>
        ${escapeHtml(
          summary.name
        )}
      </h1>

      <p class="hero-subtitle">
        ${escapeHtml(
          summary.category
        )}
      </p>

      ${renderTypeBadges(
        summary.type_badges ??
        (summary.types ?? []).map((type) => ({
          type,
          icon_concept: 'symbole de type',
        }))
      )}

      <div class="role-badge">
        <span class="role-badge-icon">
          ${escapeHtml(
            summary.role_badge
              ?.icon_concept ??
            'emblème tactique'
          )}
        </span>
        <strong>
          ${escapeHtml(
            summary.role ??
            'Rôle'
          )}
        </strong>
      </div>

      <p class="hero-description">
        ${escapeHtml(
          summary.person_description ??
          summary.personality_summary
        )}
      </p>

      <div class="hero-grid hero-grid-two">
        <div class="hero-box">
          <span>
            Animal source
          </span>

          ${escapeHtml(
            summary.animal
          )}
        </div>

        <div class="hero-box">
          <span>
            Lecture Big Five
          </span>

          Description de la personne sans scores numériques.
        </div>
      </div>
    </div>

    <div>
      <p>
        Ce document constitue la référence créative à fournir à une IA pour générer la fiche finale.
      </p>
    </div>
  </section>

  <!-- PAGE 2 -->

  <section class="page">
    <h2 class="section-title">
      Identité et personnalité
    </h2>

    <p class="section-lead">
      Ce chapitre décrit le tempérament, le comportement et l'intention générale de la créature.
    </p>

    <div class="panel">
      <h3>
        Personnalité
      </h3>

      <p>
        ${escapeHtml(
          personality.summary
        )}
      </p>
    </div>

    <div class="two-columns">
      <div class="panel">
        <h3>
          Comportement
        </h3>

        <p>
          ${escapeHtml(
            personality.behavior
          )}
        </p>
      </div>

      <div class="panel">
        <h3>
          Sociabilité
        </h3>

        <p>
          ${escapeHtml(
            personality.social_behavior
          )}
        </p>
      </div>

      <div class="panel">
        <h3>
          Habitat
        </h3>

        <p>
          ${escapeHtml(
            personality.habitat_tendency
          )}
        </p>
      </div>

      <div class="panel">
        <h3>
          Comportement signature
        </h3>

        <p>
          ${escapeHtml(
            personality.signature_behavior
          )}
        </p>
      </div>
    </div>
  </section>

  <!-- PAGE 3 -->

  <div class="panel">
    <h3>
      Direction artistique
    </h3>

    <p>
      ${escapeHtml(
        artDirection
          .main_instruction
      )}
    </p>

    <p>
      ${escapeHtml(
        artDirection
          .description
      )}
    </p>

    <h3>
      À privilégier
    </h3>

    ${renderList(
      artDirection
        .principles
    )}

    <h3>
      À éviter absolument
    </h3>

    ${renderList(
      artDirection
        .avoid
    )}
  </div>

  <section class="page">
    <h2 class="section-title">
      Environnement visuel de référence
    </h2>

    <p class="section-lead">
      Ce décor est une référence canonique d'ambiance et d'environnement, pas un simple élément décoratif.
    </p>

    <div class="panel">
      <h3>${escapeHtml(background.name_fr ?? 'Background sélectionné')}</h3>
      ${backgroundImage ? `<img class="background-reference-image" src="${backgroundImage}" alt="Background de référence">` : '<p class="muted">Image de référence indisponible.</p>'}
      <p><strong>Tags :</strong> ${escapeHtml((background.tags ?? []).join(' • '))}</p>
      <p><strong>Affinités :</strong> ${escapeHtml((background.type_affinities ?? []).join(' • '))}</p>
      <p><strong>Sélection :</strong> tirage pondéré déterministe parmi les environnements compatibles avec le DNA.</p>
      <p class="background-rule">Le Pokémon doit rester le sujet dominant. Le décor ne doit jamais masquer sa silhouette ni réduire sa lisibilité.</p>
      <p>Le même environnement doit servir de base au grand visuel principal et à l'illustration de l'attaque signature. Le cadrage, la profondeur et l'intensité de la météo peuvent évoluer, mais pas l'identité générale du lieu.</p>
      <p>Les vues Face, Dos, Shiny et Pose utilisent un fond neutre ou fortement simplifié.</p>
    </div>
  </section>

  <section class="page visual-seed-page visual-seed-image-page">
    <h2 class="section-title">
      Référence artistique et morphologique
    </h2>

    <p class="section-lead">
      Visual Seed canonique sélectionné pour cette créature. L'image doit être observée dans son intégralité et ne doit jamais être recadrée ni rognée dans le dossier créatif.
    </p>

    ${visualSeedImage
      ? `
        <div class="visual-seed-frame">
          <img
            class="visual-seed-reference-image"
            src="${visualSeedImage}"
            alt="Visual Seed de référence"
          >
        </div>
      `
      : '<p class="muted">Aucune image de Visual Seed disponible.</p>'
    }
  </section>

  <section class="page">
    <h2 class="section-title">
      Instructions du Visual Seed
    </h2>

    <div class="panel">
      <h3>
        ${escapeHtml(
          visualSeed.animal ??
          summary.animal ??
          'Animal source'
        )}
      </h3>

      <p>
        <strong>Modèle :</strong>
        ${escapeHtml(
          visualSeed.model?.id ??
          'Non sélectionné'
        )}
      </p>

      <p>
        <strong>Bibliothèque disponible :</strong>
        ${escapeHtml(
          visualSeed.available_models ?? 0
        )}
        référence(s)
      </p>

      <p class="background-rule">
        La Seed est une référence artistique forte. Le Pokémon final doit reprendre son langage visuel : style graphique, niveau de stylisation, proportions, distribution des masses, énergie de pose, traitement des surfaces, formes dominantes et caractère du sujet central.
      </p>

      <p>
        Liberté créative cible : <strong>9/10</strong>. Il faut transformer et réinterpréter la référence, et non la recopier.
      </p>

      <p>
        Le Pokémon doit être sensiblement plus créatif qu'une simple version décorée de l'animal source. Les types doivent être intégrés à sa biologie, ses volumes, ses matières et sa silhouette.
      </p>

      <p>
        Le DNA canonique reste prioritaire pour l'identité animale, la logique des membres, l'anatomie signature, les types, la personnalité et le rôle.
      </p>

      <p>
        Le décor présent dans la Seed doit être totalement ignoré. Il ne doit jamais influencer, remplacer ou fusionner avec le background canonique fourni séparément, qui reste le seul environnement autorisé.
      </p>
    </div>
  </section>

  <section class="page">
    <h2 class="section-title">
      ADN visuel canonique
    </h2>

    <p class="section-lead">
      Ces éléments décrivent l'apparence que toutes les vues de la créature doivent respecter.
    </p>

    ${visual.morphology_variant ? `
      <div class="panel" style="margin-bottom: 8mm;">
        <h3>Morphotype animal sélectionné</h3>
        <p><strong>${escapeHtml(visual.morphology_variant.label ?? 'Variante morphologique')}</strong></p>
        <p>${escapeHtml(visual.morphology_variant.silhouette ?? '')}</p>
        <p><strong>Plan corporel :</strong> ${escapeHtml(visual.morphology_variant.body_plan ?? '')}</p>
        <p><strong>Locomotion :</strong> ${escapeHtml((visual.morphology_variant.locomotion ?? []).join(' / '))}</p>
        <p><strong>Marqueurs :</strong> ${escapeHtml((visual.morphology_variant.signature_features ?? []).join(' ; '))}</p>
        <p><strong>Priorité morphologique : CRITIQUE</strong> — poids indicatif 1,00.</p>
        <p class="background-rule"><strong>Règle de lecture :</strong> ce morphotype doit être compris AVANT la famille animale générale. La famille animale est secondaire et ne doit jamais écraser cette anatomie précise.</p>
        <p><strong>Contrat morphologique obligatoire :</strong></p>
        <ul>
          ${(visual.morphology_variant.required_body_plan ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
        <p><strong>Morphologies explicitement interdites :</strong></p>
        <ul>
          ${(visual.morphology_variant.forbidden_body_plans ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
        <p class="background-rule">Si l’image mentale initiale ressemble davantage au stéréotype de la famille animale qu’au morphotype exact ci-dessus, elle doit être abandonnée et reconstruite avant de poursuivre la conception.</p>
      </div>
    ` : ''}

    <div class="two-columns">
      <div class="panel">
        <h3>
          Silhouette
        </h3>

        ${renderKeyValues(
          visual.silhouette
        )}
      </div>

      <div class="panel">
        <h3>
          Proportions
        </h3>

        ${renderKeyValues(
          visual.proportions
        )}
      </div>

      <div class="panel">
        <h3>
          Tête
        </h3>

        ${renderKeyValues(
          visual.head
        )}
      </div>

      <div class="panel">
        <h3>
          Yeux
        </h3>

        ${renderKeyValues(
          visual.eyes
        )}
      </div>

      <div class="panel">
        <h3>
          Membres
        </h3>

        ${renderKeyValues(
          visual.limbs
        )}
      </div>

      <div class="panel">
        <h3>
          Queue
        </h3>

        ${renderKeyValues(
          visual.tail
        )}
      </div>
    </div>

    <div class="panel">
      <h3>
        Anatomies signature
      </h3>

      ${renderList(
        visual.signature_anatomy
          ?.map(
            (item) =>
              [
                item.id,
                item.description,
                item.function,
              ]
                .filter(Boolean)
                .join(
                  ' — '
                )
          )
      )}
    </div>

    <div class="two-columns">
      <div class="panel">
        <h3>
          Marqueurs animaux
        </h3>

        ${renderList(
          visual.animal_markers
        )}
      </div>

      <div class="panel">
        <h3>
          Marqueurs de type
        </h3>

        ${renderList(
          visual.type_markers
        )}
      </div>
    </div>

    <div class="panel">
      <h3>
        Palette
      </h3>

      <div class="palette">
        ${Object.entries(
          visual.palette ?? {}
        )
          .map(
            ([name, value]) => `
              <div class="color-card">
                <div
                  class="color-swatch"
                  style="
                    background:
                      ${escapeHtml(
                        value
                      )};
                  "
                ></div>

                <div class="color-label">
                  <strong>
                    ${escapeHtml(
                      name
                    )}
                  </strong>

                  <br>

                  ${escapeHtml(
                    value
                  )}
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- PAGE 4 -->

  <section class="page">
    <h2 class="section-title">
      Biologie et combat
    </h2>

    <div class="three-columns">
      <div class="panel">
        <h3>
          Taille
        </h3>

        <p>
          <strong>
            ${escapeHtml(
              biology.height_m
            )} m
          </strong>
        </p>
      </div>

      <div class="panel">
        <h3>
          Poids
        </h3>

        <p>
          <strong>
            ${escapeHtml(
              biology.weight_kg
            )} kg
          </strong>
        </p>
      </div>

    </div>

    <div class="two-columns">
      <div class="panel">
        <h3>
          Talent principal
        </h3>

        ${renderKeyValues(
          combat.main_ability
        )}
      </div>

      <div class="panel">
        <h3>
          Talent caché
        </h3>

        ${renderKeyValues(
          combat.hidden_ability
        )}
      </div>
    </div>

    <div class="panel">
      <h3>
        Statistiques
      </h3>

      ${renderStats(
        combat.stats
      )}

      <p>
        <strong>
          Total :
          ${escapeHtml(
            combat.bst
          )}
        </strong>
      </p>
    </div>

    <div class="panel">
      <h3>
        Les trois attaques standard
      </h3>

      <p class="section-lead">
        Exactement 3 attaques : une originale (animal OU type), puis deux capacités officielles existantes et distinctes. L’attaque signature est exclue de cette liste.
      </p>

      ${renderMoves(
        combat.standard_moves
      )}
    </div>
  </section>

  <!-- PAGE 5 -->

  <section class="page">
    <h2 class="section-title">
      Attaque signature et référence Shiny
    </h2>

    <div class="panel">
      <h3>
        Attaque signature
      </h3>

      ${signature.data
        ? `
          <article class="move-card">
            <div class="move-title-row">
              <span class="move-function-icon">
                ${escapeHtml(signature.data.ui?.function_icon?.icon_concept ?? 'icône fonctionnelle')}
              </span>
              <h4>Nom à créer par l’IA finale</h4>
            </div>

            ${renderTypeBadges(signature.data.ui?.type_badges ?? [])}

            <div class="move-core-data">
              <span><strong>Catégorie :</strong> ${escapeHtml(signature.data.category ?? '—')}</span>
              <span><strong>Puissance :</strong> ${escapeHtml(signature.data.power ?? '—')}</span>
            </div>

            <p><strong>Source anatomique canonique :</strong> ${escapeHtml(signature.data.anatomical_source ?? '—')}</p>
            <p><strong>Mécanique imposée :</strong> ${escapeHtml(signature.data.mechanic_brief ?? '—')}</p>
            <p><strong>Consigne de création :</strong> l’IA finale crée un nom français original de 2 à 4 mots ainsi que la formulation finale de la description et de l’effet, sans modifier le type, la catégorie, la puissance, la mécanique ni l’anatomie canonique.</p>
          </article>
        `
        : ''}

      <h3>
        Visuel illustratif associé
      </h3>

      <p>
        Ce visuel premium doit montrer l’attaque signature en action, en utilisant exactement sa source anatomique canonique et sans mutation permanente de la créature.
      </p>

      ${renderKeyValues(
        signature.visual_concept
      )}
    </div>

    <div class="panel">
      <h3>
        Vue de référence Shiny
      </h3>

      <p>
        La vue Shiny remplace la vue de profil dans le panneau de vues de référence de la fiche finale.
      </p>

      <p>
        Elle doit représenter exactement le même Pokémon : même anatomie, mêmes proportions,
        mêmes appendices, mêmes motifs et même silhouette. Seule la palette de couleurs change.
      </p>

      ${renderKeyValues(
        referenceViews.shiny
          ?.palette ??
        {}
      )}

      <h3>
        Éléments immuables
      </h3>

      ${renderList(
        referenceViews.shiny
          ?.immutable_elements
      )}
    </div>
  </section>

  <!-- PAGE 6 -->

  <section class="page">
    <h2 class="section-title">
      Spécification de rendu de la fiche finale
    </h2>

    <p class="section-lead">
      Cette page décrit la mise en forme à reproduire dans l'image finale.
    </p>

    <div class="render-spec">
      <h3>
        Structure générale
      </h3>

      <div class="layout-diagram">
        <div class="layout-box">
          Identité +
          description
        </div>

        <div class="layout-box layout-hero">
          GRAND VISUEL
          PRINCIPAL
        </div>

        <div class="layout-box">
          Vues de référence<br>
          Face • Dos • Shiny • Pose adaptée
        </div>

        <div class="layout-box layout-combat">
          3 Attaques standard
          •
          1 Attaque signature séparée
          •
          Talents
          •
          Stats
        </div>
      </div>
    </div>

    <div class="panel">
      <h3>
        Règles critiques
      </h3>

    <div class="panel">
      <h3>
        Style du Pokémon
      </h3>

      <p>
        La créature doit être immédiatement comprise comme un Pokémon original.
      </p>

      <p>
        Le rendu doit être stylisé, illustratif et non réaliste.
        Éviter tout photoréalisme, rendu animalier naturaliste,
        dark fantasy réaliste ou anatomie horrifique.
      </p>

      <p>
        Rechercher une silhouette iconique, une anatomie simplifiée,
        une palette claire et une expressivité comparable à celle
        d'une créature conçue pour un jeu de collection de monstres.
      </p>
    </div>

      ${renderList(
        render.critical_rules
      )}
    </div>

    <div class="panel">
      <h3>
        Direction graphique
      </h3>

      ${renderKeyValues(
        render.interface_style
      )}
    </div>

    <div class="page-footer">
      Ce dossier ne constitue pas une fiche officielle Pokémon.
      Il sert de cahier des charges créatif pour une créature originale personnalisée.
    </div>
  </section>

</body>

</html>
  `.trim()
}

module.exports = {
  buildCreativeDossierHtml,
}