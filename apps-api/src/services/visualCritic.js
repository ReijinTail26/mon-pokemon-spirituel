const {
  validateVisualConcept,
} = require(
  './visualArchitect'
)

const VISUAL_CRITIC_VERSION =
  'visual-critic-v1'

const VISUAL_CONCEPT_PASS_SCORE =
  88

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

function scoreVisualConcept({
  concept,
  dna,
}) {
  /*
    Première couche :
    validation structurelle stricte.
  */
  const structural =
    validateVisualConcept(
      concept,
      dna
    )

  if (!structural.valid) {
    return {
      version:
        VISUAL_CRITIC_VERSION,

      status:
        'FAIL',

      score:
        Math.min(
          structural.score,
          69
        ),

      structural_score:
        structural.score,

      dimensions: {
        anatomy_coherence: 0,
        animal_fidelity: 0,
        morphology_fidelity: 0,
        type_integration: 0,
        silhouette_clarity: 0,
        personality_expression: 0,
        combat_expression: 0,
        originality: 0,
        production_readiness: 0,
      },

      errors:
        structural.errors,

      feedback:
        structural.errors,
    }
  }

  const dimensions = {}

  /*
    ANIMAL FIDELITY
  */
  const animalMarkers =
    concept.markers
      ?.animal ??
    []

  dimensions.animal_fidelity =
    clamp(
      70 +
        Math.min(
          animalMarkers.length,
          3
        ) *
          10
    )

  /*
    MORPHOLOGY FIDELITY — CRITICAL

    Le critic structurel ne voit pas encore l'image finale,
    mais il exige que le concept encode explicitement le
    morphotype sélectionné et ses invariants principaux.
  */
  const morphology =
    concept.morphology_variant ?? null

  const morphologyFields = [
    morphology?.id,
    morphology?.label,
    morphology?.body_plan,
    morphology?.silhouette,
    morphology?.head,
    morphology?.limb_configuration,
  ].filter(Boolean).length

  const hasMorphologyPriority =
    morphology?.priority === 'CRITICAL' ||
    morphology?.morphology_priority === 'CRITICAL'

  const hasRequiredBodyPlan =
    Array.isArray(morphology?.required_body_plan) &&
    morphology.required_body_plan.length >= 5

  const hasForbiddenBodyPlans =
    Array.isArray(morphology?.forbidden_body_plans) &&
    morphology.forbidden_body_plans.length >= 1

  const hasMorphologyGate =
    morphology?.morphology_gate?.must_pass_before_design === true &&
    morphology?.morphology_gate?.fail_if_final_morphotype_not_recognizable === true

  dimensions.morphology_fidelity =
    clamp(
      30 +
        morphologyFields * 6 +
        (hasMorphologyPriority ? 10 : 0) +
        (hasRequiredBodyPlan ? 10 : 0) +
        (hasForbiddenBodyPlans ? 7 : 0) +
        (hasMorphologyGate ? 7 : 0)
    )

  /*
    TYPE INTEGRATION
  */
  const expectedTypes =
    [
      dna.IDENTITY.type_1,
      dna.IDENTITY.type_2,
    ].filter(Boolean)

  const typeMarkers =
    concept.markers
      ?.types ??
    []

  const typeRatio =
    expectedTypes.length > 0
      ? Math.min(
          1,
          typeMarkers.length /
            expectedTypes.length
        )
      : 1

  dimensions.type_integration =
    clamp(
      70 +
        typeRatio * 25
    )

  /*
    ANATOMICAL COHERENCE
  */
  const limbCount =
    concept.anatomy
      ?.limbs
      ?.count ??
    0

  const hasBodyPlan =
    Boolean(
      concept.anatomy
        ?.body_plan
    )

  const hasProportions =
    Boolean(
      concept.anatomy
        ?.proportions
        ?.torso
    )

  dimensions.anatomy_coherence =
    clamp(
      60 +
        (
          hasBodyPlan
            ? 15
            : 0
        ) +
        (
          hasProportions
            ? 15
            : 0
        ) +
        (
          limbCount >= 0
            ? 10
            : 0
        )
    )

  /*
    SILHOUETTE
  */
  const silhouette =
    concept.anatomy
      ?.silhouette

  dimensions.silhouette_clarity =
    clamp(
      55 +
        (
          silhouette
            ?.description
            ? 20
            : 0
        ) +
        (
          silhouette
            ?.center_of_mass
            ? 10
            : 0
        ) +
        (
          Number.isFinite(
            silhouette
              ?.verticality
          )
            ? 5
            : 0
        ) +
        (
          Number.isFinite(
            silhouette
              ?.width
          )
            ? 5
            : 0
        ) +
        (
          Number.isFinite(
            silhouette
              ?.symmetry
          )
            ? 5
            : 0
        )
    )

  /*
    PERSONALITY
  */
  dimensions.personality_expression =
    clamp(
      60 +
        (
          concept.presentation
            ?.posture
            ? 15
            : 0
        ) +
        (
          concept.presentation
            ?.default_expression
            ? 15
            : 0
        ) +
        (
          concept.presentation
            ?.visual_attitude
            ? 10
            : 0
        )
    )

  /*
    COMBAT
  */
  dimensions.combat_expression =
    clamp(
      60 +
        (
          concept
            .signature_move_visual_concept
            ?.anatomical_source
            ? 15
            : 0
        ) +
        (
          concept
            .signature_move_visual_concept
            ?.action
            ? 15
            : 0
        ) +
        (
          concept
            .signature_move_visual_concept
            ?.effect_shape
            ? 10
            : 0
        )
    )

  /*
    ORIGINALITÉ

    On ne peut pas réellement détecter
    une ressemblance à un Pokémon
    existant sans critic IA / vision.

    Ici on vérifie seulement que le
    concept possède plusieurs décisions
    spécifiques et non génériques.
  */
  const signatureCount =
    concept.anatomy
      ?.signature_anatomy
      ?.length ??
    0

  const patternCount =
    concept.patterns
      ?.length ??
    0

  dimensions.originality =
    clamp(
      65 +
        signatureCount *
          8 +
        Math.min(
          patternCount,
          2
        ) *
          5
    )

  /*
    PRODUCTION READINESS
  */
  const biologyReady =
    Number.isFinite(
      Number(
        concept.biology
          ?.height_m
      )
    ) &&
    Number.isFinite(
      Number(
        concept.biology
          ?.weight_kg
      )
    )

  const paletteReady =
    Boolean(
      concept.palette
        ?.primary &&
      concept.palette
        ?.secondary &&
      concept.palette
        ?.accent &&
      concept.palette
        ?.energy
    )

  dimensions.production_readiness =
    clamp(
      60 +
        (
          biologyReady
            ? 20
            : 0
        ) +
        (
          paletteReady
            ? 20
            : 0
        )
    )

  /*
    Pondération du critic.
  */
  const score =
    Number(
      (
        dimensions
          .morphology_fidelity *
          0.20 +

        dimensions
          .anatomy_coherence *
          0.15 +

        dimensions
          .animal_fidelity *
          0.12 +

        dimensions
          .type_integration *
          0.10 +

        dimensions
          .silhouette_clarity *
          0.13 +

        dimensions
          .personality_expression *
          0.08 +

        dimensions
          .combat_expression *
          0.08 +

        dimensions
          .originality *
          0.08 +

        dimensions
          .production_readiness *
          0.06
      ).toFixed(1)
    )

  const feedback = []

  if (dimensions.morphology_fidelity < 90) {
    feedback.push('morphology_fidelity est CRITIQUE : le morphotype sélectionné doit être explicitement renforcé avant validation.')
  }

  for (
    const [
      dimension,
      value,
    ] of Object.entries(
      dimensions
    )
  ) {
    if (value < 80) {
      feedback.push(
        `${dimension} doit être renforcé.`
      )
    }
  }

  return {
    version:
      VISUAL_CRITIC_VERSION,

    status:
      score >=
      VISUAL_CONCEPT_PASS_SCORE
        ? 'PASS'
        : 'FAIL',

    score,

    structural_score:
      structural.score,

    dimensions,

    errors: [],

    feedback,
  }
}

module.exports = {
  VISUAL_CRITIC_VERSION,
  VISUAL_CONCEPT_PASS_SCORE,
  scoreVisualConcept,
}