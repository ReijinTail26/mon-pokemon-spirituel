function buildPromptFicheComplete({
  creativePackage,
  creativeDossier,
}) {
  if (!creativePackage) {
    throw new Error(
      'CREATIVE_PACKAGE_REQUIRED'
    )
  }

  if (!creativeDossier) {
    throw new Error(
      'CREATIVE_DOSSIER_REQUIRED'
    )
  }

  const identity =
    creativePackage.identity ??
    {}

  const morphology =
    creativePackage.creature_spec?.morphology_variant ??
    {}

  const morphologyDirective =
    creativePackage.creature_spec?.morphology_directive ??
    {}

  const morphologyRequired =
    (morphologyDirective.required_body_plan ?? morphology.required_body_plan ?? [])
      .map((item) => `- ${item}`)
      .join('\n')

  const morphologyForbidden =
    (morphologyDirective.forbidden_body_plans ?? morphology.forbidden_body_plans ?? [])
      .map((item) => `- ${item}`)
      .join('\n')

  const render =
    creativeDossier
      .final_render_spec ??
    {}

  const rules =
    creativePackage
      .generation_contract
      ?.consistency_rules ??
    []

  const forbidden =
    creativePackage
      .generation_contract
      ?.forbidden ??
    []

  const types =
    (
      identity.types ??
      []
    )
      .filter(Boolean)
      .join(' / ')

  return `
OUTPUT EXACTLY ONE FINAL IMAGE.

CREATE ONE SINGLE COMPLETE LANDSCAPE POKÉMON ENCYCLOPEDIA SHEET.

The outer boundary of the generated image must contain EXACTLY ONE complete encyclopedia sheet.
Perform all corrections and consistency checks internally and silently. Never show drafts, alternatives, before/after versions, corrected duplicates, revision panels or second attempts.

The attached creative dossier is the CANONICAL SOURCE OF TRUTH.

Your task is to transform this dossier into one complete illustrated sheet representing an ORIGINAL POKÉMON.

==================================================
CREATURE IDENTITY
==================================================

Name:
GENERATE THE FINAL POKÉMON NAME FROM THE CANONICAL NAME BRIEF IN THE DOSSIER.

The dossier intentionally does NOT provide a finished Pokémon name.
Create ONE original French Pokémon name for this creature.

Category:
${identity.category ?? 'Original Pokémon species'}

PRIMARY CREATURE MORPHOLOGY — READ THIS BEFORE THE ANIMAL FAMILY:
${morphology.label ?? identity.animal_variant ?? 'See attached dossier'}

Broad animal family — SECONDARY identity information only:
${identity.animal ?? 'See attached dossier'}

Type(s):
${types || 'See attached dossier'}

Combat role:
${identity.role ?? 'See attached dossier'}

POKÉMON NAME — AI GENERATION RULES:
- generate ONE final original Pokémon name in French
- normally use 1 to 3 words, strongly preferring a single coined name when natural
- make it immediately pronounceable, memorable and rhythmically clean
- use the animal inspiration, type identity, signature anatomy, personality and combat role as semantic material
- you may blend, shorten, transform or allude to words instead of copying them literally
- do NOT use a mechanical animal + type concatenation
- do NOT create a flat descriptive label such as "Renard Roche"
- do NOT reuse the name of an existing official Pokémon
- do NOT use the backend legacy candidate name if one appears in technical/internal material
- the generated name becomes the single definitive name used consistently everywhere on the final sheet

The role must NOT be shown as a plain "Role: ..." text line in the final sheet.
Show it as a designed rectangular badge placed next to or immediately below the type badge(s): role icon on the left + role name on the right.
Use the exact role icon concept defined in the dossier.

==================================================
CRITICAL ART DIRECTION
==================================================

THIS CREATURE MUST LOOK LIKE AN ORIGINAL POKÉMON.

It must NOT look like:
- a realistic animal
- a photorealistic creature
- a wildlife illustration
- a realistic fantasy beast
- a dark-fantasy monster
- a horror creature
- a generic RPG monster

The target visual language is a polished Pokémon-style creature design.

The result should feel like a believable, unpublished Pokémon species designed for a monster-collection game.

Use:
- stylized anatomy
- simplified readable forms
- strong iconic silhouette
- expressive face and posture
- clean color separation
- controlled visual complexity
- clear type identity
- clean illustrative rendering
- polished game-creature character design

DO NOT USE PHOTOREALISM.

Do not render realistic fur, skin, scales, feathers or materials unless they remain strongly stylized.

The underlying animal inspiration must be recognizable, but transformed into a Pokémon-style creature rather than reproduced as a realistic animal.

The creature should be visually appealing, readable and iconic.

==================================================
ANIMAL MORPHOLOGY VARIATION — MANDATORY PHASE-1 INPUT
==================================================

The source-animal label is a BROAD biological or mythological family, NOT one mandatory body template.

The dossier contains ONE selected morphology variant for that animal.
Use that selected variant as the concrete zoological / mythological starting morphology during PHASE 1.

Examples of the intended principle:
- Dragon may be western quadruped, wyvern, Chinese serpentine dragon, wingless drake, amphiptere, lindworm, sea dragon or feathered serpent-dragon.
- Fox may express red fox, fennec, arctic fox, grey fox or Tibetan fox proportions.
- Turtle may express terrestrial, marine, snapping or other strongly different turtle morphology.

DO NOT automatically collapse the animal back into its most stereotypical form.
For example, "Dragon" does NOT automatically mean "four-legged western dragon with a separate pair of wings".

During PHASE 1:
- respect the selected morphology variant's body plan
- use its characteristic silhouette
- use its limb logic
- use its head architecture
- use its locomotion and appendage logic
- use its variant-specific signature features

This variant exists specifically to produce meaningful diversity between Pokémon sharing the same broad animal classification.

==================================================
MORPHOLOGY GATE — ABSOLUTE PRIORITY / MUST PASS BEFORE DESIGN
==================================================

The selected morphotype is the PRIMARY ANATOMICAL IDENTITY of this Pokémon.

Selected morphotype:
${morphology.label ?? identity.animal_variant ?? 'See dossier'}

Broad animal family:
${identity.animal ?? 'See dossier'}

IMPORTANT HIERARCHY:

MORPHOTYPE > BROAD ANIMAL FAMILY.

The broad animal-family label is only a conceptual / biological family name.
It MUST NOT inject its stereotypical body plan into the design.

Before imagining the Pokémon, STOP and internally answer:

1. What is the exact selected morphotype?
2. What is its exact body-plan family?
3. What is its limb configuration?
4. Are wings or major appendages present, absent, or transformed limbs?
5. What silhouette, head/neck construction and locomotion distinguish this morphotype from the other variants of the same animal family?

REQUIRED BODY-PLAN CONTRACT:
${morphologyRequired || '- Follow the exact morphology contract in the dossier.'}

FORBIDDEN MORPHOLOGY OUTCOMES:
${morphologyForbidden || '- Never collapse the selected morphotype into the generic/stereotypical animal-family template.'}

MORPHOLOGY FAILURE CONDITION:

If your initial mental image resembles the stereotypical broad animal family more than the exact selected morphotype, DISCARD that mental image and restart internally BEFORE designing anything else.

If the final Pokémon is not clearly recognizable as the selected morphotype, the generation is INCORRECT.

Do NOT continue to the Visual Seed or type styling until this morphology gate is satisfied.

The Visual Seed may transform style, exact proportions, surface treatment, ornamentation and shape language ONLY while the resulting creature remains unmistakably inside the selected morphotype's structural family.

The Visual Seed must NEVER silently switch the creature to another listed morphotype or to the generic family stereotype.

After the final transformed design is chosen, all six visual representations must preserve this same selected morphotype.

==================================================
TWO-PASS CREATURE DESIGN V4 — MANDATORY
==================================================

You MUST design the Pokémon internally in THREE sequential phases.

These phases are INTERNAL DESIGN STEPS ONLY.

Do NOT show:
- Phase 1
- Phase 2
- comparisons
- drafts
- before/after versions
- correction stages

Only the FINAL Phase-3 Pokémon may appear on the final encyclopedia sheet.

==================================================
PHASE 1 — BASE CREATURE DESIGN
==================================================

FIRST, completely ignore the Visual Seed.

Do not use the Visual Seed for:
- silhouette
- proportions
- anatomy
- pose
- artistic style
- surface treatment
- colors
- environment

Using ONLY the canonical creative dossier and DNA, internally design one complete coherent BASE POKÉMON.

The Phase-1 creature establishes:
- source-animal identity
- Pokémon identity
- elemental type identity
- combat role
- personality and temperament
- biological logic
- type integration
- overall concept
- functional anatomy
- distinctive concept direction

PHASE 1 IS NOT THE FINAL CANONICAL DESIGN.
Its silhouette, proportions and anatomy are NOT protected from Phase 2.
Do not render Phase 1.

==================================================
PHASE 2 — RADICAL VISUAL-SEED TRANSFORMATION
==================================================

NOW take the complete Phase-1 creature concept and transform it using the selected Visual Seed.

This phase has MAXIMUM CREATIVE FREEDOM.
CREATIVE FREEDOM: 10 / 10.

Treat the Phase-1 Pokémon as transformation material, NOT as immutable anatomy.

At this stage you may freely redesign ANY visual aspect of the Pokémon, including:
- entire silhouette
- body proportions
- head shape and skull proportions
- facial structure
- neck length and thickness
- torso shape
- center of gravity
- limb proportions and shapes
- apparent body mass
- wing architecture
- appendage architecture
- tail shape and length
- ornamentation
- surface structures
- armor distribution
- fur / feather / scale treatment
- degree of anatomical simplification
- curve-versus-angle balance
- negative space
- pose language
- visual rhythm
- type-material integration
- decorative biological structures
- overall artistic stylization

DO NOT preserve Phase-1 geometry merely for consistency.
DO NOT reject a strong redesign because proportions, silhouette, head, wings, tail or overall anatomy changed.

During Phase 2 there is NO requirement to preserve the exact Phase-1 silhouette, proportions, head, neck, wings, tail, surface structures or visual anatomy.

The objective is a STRONG TRANSFORMATION.

==================================================
WHAT PHASE 2 MUST PRESERVE
==================================================

Preserve CONCEPTUAL IDENTITY, not Phase-1 geometry.

The transformed Pokémon must remain conceptually coherent with:
- the source-animal identity
- the elemental type or types
- the personality derived from the DNA
- the combat role
- the core thematic concept
- the fact that this is the same Pokémon concept

These requirements may be REINTERPRETED visually.
The source animal must remain recognizable as an inspiration, not necessarily as a literal zoological body template.

==================================================
HOW TO USE THE VISUAL SEED
==================================================

The Visual Seed subject is a strong transformation reference.

Extract from the SUBJECT of the Visual Seed:
- silhouette philosophy
- head-to-body relationship
- neck philosophy
- body-mass distribution
- appendage philosophy
- shape language
- simplicity versus complexity
- organic versus geometric treatment
- surface language
- proportions
- posture character
- elegance / heaviness / dynamism
- negative spaces
- visual rhythm
- central-subject artistic style
- overall design personality

Do NOT copy the Seed creature literally.
Instead, TRANSFER ITS DESIGN LOGIC onto the Phase-1 Pokémon concept.

The desired result is:
PHASE-1 CONCEPT × VISUAL-SEED DESIGN LANGUAGE = A NEW UNIQUE POKÉMON.

The Visual Seed must create a clearly perceptible transformation.
If the Phase-2 result still looks essentially like the Phase-1 creature with only minor changes, the transformation is NOT strong enough.

==================================================
ABSOLUTE VISUAL-SEED BACKGROUND EXCLUSION
==================================================

THE BACKGROUND VISIBLE IN THE VISUAL SEED MUST BE COMPLETELY IGNORED.

This is an ABSOLUTE rule.
The Visual Seed provides information ONLY about its central creature / subject.

DO NOT transfer from the Visual Seed:
- scenery
- environment
- biome
- sky
- weather
- environmental lighting
- water
- terrain
- vegetation
- architecture
- atmospheric effects
- background colors
- background composition

The Visual Seed background has ZERO authority and must NEVER influence or replace the separately supplied canonical background.

==================================================
PHASE 3 — FINAL CANONICAL LOCK
==================================================

After Phase 2 is complete, STOP REDESIGNING.

The transformed Phase-2 creature now becomes THE FINAL CANONICAL POKÉMON.

From this point onward, LOCK:
- silhouette
- proportions
- head
- face
- neck
- torso
- limbs
- wings
- appendages
- tail
- permanent structures
- permanent markings
- type-integrated anatomy
- standard palette
- relative scale

Only NOW does strict anatomical consistency begin.

Do not revert toward the Phase-1 design.
Consistency means: make every view match the transformed Phase-2 design.

==================================================
FINAL SIX-REPRESENTATION CHECK / RECHECK
==================================================

The final sheet contains SIX representations of ONE definitive Phase-3 Pokémon:
1. Main hero artwork
2. Front reference view
3. Back reference view
4. Shiny reference view
5. Secondary pose
6. Signature-move illustration

Before rendering, perform a FIRST internal consistency check across all six representations.
Verify identical final head design, facial structure, neck construction, torso construction, limb count, limb architecture, wings/appendages, tail, permanent structures, signature anatomy, markings and placement, type-integrated structures, proportions, silhouette logic and relative scale.

Then perform a SECOND independent recheck.
Do not assume the first check was correct.

If any representation looks like a different individual or an earlier Phase-1 version, SILENTLY CORRECT IT.
Only after both checks pass may the final sheet be rendered.

SHINY EXCEPTION:
Only colors may change. Anatomy, proportions, silhouette, markings, structures, face, appendages and size must remain identical.

SIGNATURE-MOVE EXCEPTION:
Temporary attack and motion effects are allowed. Permanent anatomy must remain identical.

==================================================
FINAL SHEET FORMAT
==================================================

Produce EXACTLY ONE SINGLE COMPLETE IMAGE containing EXACTLY ONE complete sheet.
Do not show alternative, corrected, draft, before/after, duplicated or second full-sheet versions.

Orientation:
LANDSCAPE.

The result must be a premium illustrated Pokédex-like encyclopedia sheet.

Do not generate separate images.

==================================================
UPPER LEFT — IDENTITY
==================================================

Include:
- AI-generated definitive creature name
- category
- type badge(s)
- height
- weight
- a concise behavioral and temperament description of THIS POKÉMON, translated from the Big Five profile provided in the dossier

Do NOT place the main ability or hidden ability in this identity/description panel.
They belong only in the TALENTS & STATS section of the combat band.

The description in this panel must describe THIS POKÉMON's behavior and temperament. The underlying Big Five results come from a human questionnaire, but the prose must be written as characteristics of the Pokémon itself. Never write "this person" or equivalent wording.
Do not display numerical Big Five scores or hidden-axis scores.
Do NOT display a Pokédex number.

==================================================
UPPER CENTER — MAIN ART
==================================================

This is the dominant visual element.

Show a large, polished illustration of the Pokémon.

Requirements:
- full body or nearly full body
- readable silhouette
- expressive Pokémon-style pose
- clear canonical anatomy
- clearly visible palette and markings
- use the canonical BACKGROUND REFERENCE IMAGE from the dossier as the environment for this main artwork
- the Pokémon must remain visually dominant and its silhouette must stay perfectly readable

The main artwork must visually dominate the upper section.

BACKGROUND RULES — ABSOLUTE PRIORITY:
- The dossier contains ONE canonical background reference image selected by the weighted DNA-aware background system.
- This image is the ONLY authoritative environment reference.
- Use this canonical environment for the main artwork.
- Reuse the SAME environment coherently in the signature-move illustration.
- Preserve its biome, environmental identity, major landmarks/motifs, atmosphere and palette family.
- The signature-move panel may become more dynamic through framing, particles, energy and action, but it must remain recognizably the SAME environment.
- Do NOT switch to an unrelated environment between panels.
- Do NOT replace or merge the canonical background with scenery taken from the Visual Seed.
- COMPLETELY IGNORE the environment, scenery, weather, sky, architecture, vegetation, water, terrain, atmospheric effects and environmental lighting visible in the Visual Seed image.
- The Visual Seed influences ONLY the Pokémon design.
- The canonical background must remain unchanged in identity regardless of the Visual Seed background.
- The background must NEVER overpower the Pokémon.
- The Pokémon silhouette must remain perfectly readable.
- Front, back, Shiny and secondary pose views must use neutral or heavily simplified backgrounds.

==================================================
UPPER RIGHT — SECONDARY VIEWS
==================================================

Show several reference views of the exact same Pokémon.

Include:
- front view
- back view
- SHINY view
- one secondary pose appropriate to the anatomy

DO NOT include a dedicated side/profile view.
The former profile slot is reserved for the SHINY version.

The shiny view must depict the exact same Pokémon with identical:
- anatomy
- proportions
- markings and pattern placement
- appendages
- silhouette
- size

ONLY the shiny color palette may change.

The other reference views must also represent the same exact creature.

==================================================
COMBAT BAND
==================================================

Create one large horizontal combat section.

LEFT — STANDARD ATTACKS:
Show EXACTLY THREE standard attacks, no more and no less.

These are exactly:
1. ONE original move created from EITHER a characteristic of the source animal OR the main type identity
2. ONE existing official move from the dossier
3. ONE SECOND, DISTINCT existing official move from the dossier

THE SIGNATURE MOVE MUST NOT APPEAR IN THIS LIST.
Never show a fourth or fifth entry in the standard attacks panel.

For EACH of the three standard attacks, show exactly these content elements:
0. a designed function icon illustrating the tactical role/function of the move
1. move name
2. type badge(s)
3. category (Physique / Spéciale / Statut)
4. power (numeric when applicable, otherwise a clear dash)
5. concise description/effect

Type badges must use the SAME visual type-icon system as the type badge(s) in the identity/description panel.
They should be visually close to the familiar official Pokémon type icon + label language (as seen in standard Pokémon type references), while remaining integrated into this original sheet layout.

CENTER — SIGNATURE MOVE:
Show EXACTLY ONE signature move in its own separate premium panel.

IMPORTANT: the dossier intentionally does NOT provide a finished signature-move name or final prose.
YOU must creatively generate the signature move from its canonical brief.

Generate:
0. a designed function icon
1. ONE original French move name, naturally pronounceable and 2 to 4 words long
2. the exact type badge(s) fixed by the dossier
3. the exact category fixed by the dossier
4. the exact power fixed by the dossier
5. a concise original French description/effect derived from the canonical mechanic brief
6. a dedicated associated illustrative visual showing the signature move in action

The generated name must NOT be an existing official move name.
Do NOT build the name as a generic concatenation of animal + type.
Avoid generic systematic formulas such as "Apogée + animal + type", "Ultime + type" or "Suprême + animal".
Prefer a short, evocative, Pokémon-like French attack name with good rhythm and phonetics.

The signature move illustration and wording must use the exact canonical type identity, category, power and mechanic described in the dossier.
The move choreography must be adapted to the FINAL Phase-3 anatomy rather than forcing the final creature to reproduce a motion imagined for the Phase-1 body.

SIGNATURE MOVE — POST-TRANSFORMATION PHYSICS:
Internally build one continuous physical action chain:
FINAL ANATOMY → STARTING POSTURE → BODY PREPARATION → FORCE/ENERGY GENERATION → ANATOMICAL SOURCE → BODY MOTION → EMISSION OR CONTACT → TRAJECTORY → IMPACT/EFFECT → FOLLOW-THROUGH.

CHECK and then RECHECK:
- Can this exact final body physically perform the movement?
- Is its balance and center of gravity coherent?
- Does the attack visibly originate from a plausible anatomical source or movement?
- Do neck, torso, limbs, wings, tail and appendages move coherently?
- Does the visual effect logically result from the movement?
- Does the choreography match the canonical Physique / Spéciale / Statut category?
- Does the apparent intensity match the canonical power?
- Is the follow-through physically plausible?

For PHYSICAL moves, credible momentum/contact must be central.
For SPECIAL moves, energy must have a clear anatomical origin and coherent emission direction.
For STATUS moves, pose and effect must communicate the tactical action without falsely implying an unrelated damaging strike.

If the move would require impossible deformation or unexplained movement, modify the choreography — NOT the final canonical anatomy.

RIGHT — TALENTS & STATS:
Include:
- the main ability exactly as provided by the dossier; it is an existing official ability and must NOT be renamed or rewritten into a different mechanic
- the hidden ability as an ORIGINAL AI-NAMED ability generated from its canonical brief
- six battle statistics
- BST

For the HIDDEN ABILITY:
- generate ONE original French ability name, naturally pronounceable and 1 to 4 words long
- generate a concise French description/effect wording
- preserve EXACTLY the canonical trigger, effect, magnitude, combat role and type synergies supplied by the dossier
- do NOT invent a new mechanic, new trigger, additional bonus, additional penalty or permanent anatomy
- the generated name must NOT be an existing official ability name
- do NOT simply concatenate the animal name and type name
- avoid repeatedly defaulting to generic starters such as "Instinct", "Aura", "Pouvoir", "Force" or "Esprit"
- prefer a short evocative Pokémon-like French talent name with strong rhythm and natural phonetics

The hidden ability may be creatively NAMED and WORDED by the final AI, but its gameplay mechanic is canonical and immutable.


==================================================
VISUAL INTERFACE
==================================================

Use a premium dark encyclopedic interface.

Use:
- translucent dark panels
- rounded containers
- excellent visual hierarchy
- high text readability
- strong separation between content areas

The interface may feel inspired by a modern Pokédex,
but must remain an original graphic composition.

Do not reproduce:
- official Pokémon logos
- official Pokédex logos
- an exact official Pokédex interface
- copyrighted UI branding

==================================================
MANDATORY CONSISTENCY RULES
==================================================

${rules
  .map(
    (item) =>
      `- ${item}`
  )
  .join('\n')}

==================================================
FORBIDDEN
==================================================

${forbidden
  .map(
    (item) =>
      `- ${item}`
  )
  .join('\n')}

- photorealism
- realistic wildlife rendering
- documentary animal illustration
- realistic dark fantasy
- grotesque anatomy
- body horror
- unrelated permanent anatomy
- four or five attacks in the standard Attacks panel
- signature move duplicated inside the standard Attacks panel
- inconsistent type badge/icon systems between identity and attacks
- plain text-only role line instead of the required graphical role badge
- separate bottom band for shiny, cry, footprint or size comparison
- cry waveform panel
- footprint panel
- size-comparison panel
- dedicated side/profile slot in the reference-view panel
- different creature between panels
- inconsistent Pokémon name between panels
- exposing a backend placeholder, legacy candidate name or "À créer par l’IA finale" as the final Pokémon name
- official Pokémon logos
- Pokédex number
- multiple complete encyclopedia sheets in the same image
- alternate or corrected full-sheet versions
- before/after full-sheet comparisons
- visible drafts, revision stages or second attempts
- contact-sheet layouts containing multiple complete sheets

==================================================
FINAL OBJECTIVE
==================================================

Create one polished, highly readable Pokémon-style encyclopedia sheet.

The result must immediately communicate:

"This is an original Pokémon."

It must not communicate:

"This is a realistic animal"
or
"This is a generic fantasy creature."

Faithfully follow the attached dossier.

FINAL OUTPUT CHECK — PERFORM SILENTLY BEFORE RENDERING:
1. Exactly ONE final image?
2. Exactly ONE complete landscape encyclopedia sheet?
3. All six representations belong to the same locked Phase-3 Pokémon?
4. No draft, alternate, corrected duplicate, before/after version or second full-sheet composition?
5. Selected morphology variant still clearly recognizable, without collapse into another or generic animal morphotype?
6. Canonical background preserved and Visual Seed background completely ignored?
6. Signature-move choreography physically coherent with the final body?

If any answer is no, silently correct it and render ONLY the single final corrected sheet.

When information in this prompt and the creative dossier overlap,
the creative dossier is authoritative for creature-specific facts.

Layout version:
${render.layout_version ?? 'creature-sheet-landscape-v1'}
  `.trim()
}

module.exports = {
  buildPromptFicheComplete,
}