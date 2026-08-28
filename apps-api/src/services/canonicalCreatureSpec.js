const db =
  require('../../db')

const {
  loadDnaSource,
} = require(
  './dnaSource'
)

const {
  buildDeterministicVisualConcept,
} = require(
  './visualArchitect'
)

const {
  selectAnimalMorphologyVariantWithHistory,
} = require(
  './animalMorphologyVariants'
)

const {
  evaluateVisualConcept,
} = require(
  './visualPipeline'
)

async function findCanonicalCreatureSpec(
  assessmentId
) {
  const result =
    await db.query(
      `
      SELECT
        id,
        assessment_id,
        version,
        attempt,
        status,
        spec,
        structural_validation,
        critic_result,
        created_at,
        updated_at

      FROM creature_specs

      WHERE
        assessment_id = $1
        AND status = 'CANONICAL'

      LIMIT 1
      `,
      [
        assessmentId,
      ]
    )

  return (
    result.rows[0] ??
    null
  )
}

async function ensureCanonicalCreatureSpec(
  assessmentId
) {
  const existing =
    await findCanonicalCreatureSpec(
      assessmentId
    )

  if (existing) {
    return existing
  }

  const dna =
    await loadDnaSource(
      assessmentId
    )

  if (!dna) {
    return null
  }

  const morphologyVariant =
    await selectAnimalMorphologyVariantWithHistory({
      animal: dna.IDENTITY?.animal,
      seed: dna.TECHNICAL?.seed,
      assessmentId,
      visual: dna.VISUAL ?? {},
    })

  const concept =
    buildDeterministicVisualConcept(
      dna,
      { morphologyVariant }
    )

  const evaluation =
    evaluateVisualConcept({
      dna,
      concept,
      attempt: 1,
    })

  if (!evaluation.passed) {
    const error =
      new Error(
        'CANONICAL_CREATURE_SPEC_VALIDATION_FAILED'
      )

    error.evaluation =
      evaluation

    throw error
  }

  const saved =
    await db.query(
      `
      INSERT INTO creature_specs (
        assessment_id,
        attempt,
        status,
        spec,
        structural_validation,
        critic_result
      )

      VALUES (
        $1,
        1,
        'CANONICAL',
        $2::jsonb,
        $3::jsonb,
        $4::jsonb
      )

      RETURNING
        id,
        assessment_id,
        version,
        attempt,
        status,
        spec,
        structural_validation,
        critic_result,
        created_at,
        updated_at
      `,
      [
        assessmentId,
        JSON.stringify(concept),
        JSON.stringify(
          evaluation.structural
        ),
        JSON.stringify(
          evaluation.critic
        ),
      ]
    )

  return saved.rows[0]
}

module.exports = {
  findCanonicalCreatureSpec,
  ensureCanonicalCreatureSpec,
}
