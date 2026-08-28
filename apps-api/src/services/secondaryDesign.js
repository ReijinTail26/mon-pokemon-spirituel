const crypto = require('crypto')

const {
  createShinyPalette,
} = require('./shinyPalette')

function hash01(value) {
  const digest = crypto
    .createHash('sha256')
    .update(String(value))
    .digest()

  return digest.readUInt32BE(0) / 0xffffffff
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function buildCryVisual({
  seed,
  personality,
  temperament,
  animal,
  type1,
  type2,
}) {
  const energy = (
    Number(temperament?.R ?? 50) +
    Number(temperament?.I ?? 50) +
    Number(personality?.E ?? 50)
  ) / 3

  const resonance = (
    Number(temperament?.M ?? 50) +
    Number(personality?.O ?? 50)
  ) / 2

  const roughness = (
    Number(temperament?.P ?? 50) +
    Number(personality?.N ?? 50)
  ) / 2

  const pulseSeed = hash01(`${seed}|cry|pulses`)
  const pulseCount = 2 + Math.floor(pulseSeed * 5)

  const pitch = energy >= 67
    ? 'aigu'
    : energy <= 38
      ? 'grave'
      : 'médium'

  const rhythm = Number(temperament?.R ?? 50) >= 65
    ? 'rapide et segmenté'
    : Number(temperament?.R ?? 50) <= 35
      ? 'lent et étiré'
      : 'régulier'

  const envelope = Number(personality?.C ?? 50) >= 60
    ? 'attaque nette, maintien contrôlé, extinction propre'
    : Number(personality?.O ?? 50) >= 65
      ? 'attaque progressive, modulation irrégulière, fin aérienne'
      : 'attaque courte, plateau stable, décroissance naturelle'

  return {
    mode: 'VISUAL_REFERENCE_ONLY',
    audio_required: false,
    representation: 'stylized_waveform',
    pitch,
    rhythm,
    pulse_count: pulseCount,
    roughness: `${Math.round(clamp(roughness, 0, 100))}/100`,
    resonance: `${Math.round(clamp(resonance, 0, 100))}/100`,
    energy: `${Math.round(clamp(energy, 0, 100))}/100`,
    envelope,
    visual_direction: `forme d’onde évoquant ${animal}, avec identité énergétique ${type2 ? `${type1}/${type2}` : type1}`,
  }
}

function buildSecondaryDesign({
  dna,
  visualConcept,
}) {
  const basePalette = visualConcept?.palette ?? {}
  const seed = dna?.TECHNICAL?.seed ?? 0
  const biology = dna?.BIOLOGY ?? {}

  return {
    shiny: {
      rule: 'RECOLOR_ONLY',
      palette: createShinyPalette({
        palette: basePalette,
        seed,
      }),
      immutable_elements: [
        'anatomy',
        'proportions',
        'silhouette',
        'limbs',
        'tail',
        'appendages',
        'patterns',
        'signature_anatomy',
        'face',
        'size',
      ],
      instruction: 'Même créature, même anatomie, mêmes motifs et mêmes proportions ; seule la palette change.',
    },

    cry: buildCryVisual({
      seed,
      personality: dna?.PERSONALITY,
      temperament: dna?.TEMPERAMENT,
      animal: dna?.IDENTITY?.animal,
      type1: dna?.IDENTITY?.type_1,
      type2: dna?.IDENTITY?.type_2,
    }),

    footprint: {
      mode: 'technical_monochrome',
      type: biology.footprint_type,
      anatomical_basis: biology.limbs?.extremities ?? biology.extremities ?? null,
      rendering_rules: [
        'vue orthogonale',
        'monochrome',
        'sans effet artistique',
        'cohérente avec les extrémités de la créature',
      ],
    },

    size_comparison: {
      creature_height_m: biology.height_m,
      creature_weight_kg: biology.weight_kg,
      human_reference_m: 1.75,
      human_reference: 'neutral_human',
      same_ground_line: true,
      creature_silhouette_source: 'canonical_creature_spec',
      decor: false,
      instruction: 'Comparer la silhouette canonique de la créature à un humain neutre, en vue orthographique, sur la même ligne de sol.',
    },
  }
}

module.exports = {
  buildCryVisual,
  buildSecondaryDesign,
}
