const db =
  require('../../db')

const {
  buildDnaBase,
} = require(
  './dna'
)

async function loadDnaSource(
  assessmentId
) {
  const result =
    await db.query(
      `
      SELECT
        ar.assessment_id,
        ar.scoring_version,

        ar.o,
        ar.c,
        ar.e,
        ar.a,
        ar.n,

        ar.r,
        ar.l,
        ar.p,
        ar.h,
        ar.i,
        ar.m,

        ac.animal_name,
        ac.animal_bucket,

        ac.type_1_name,
        ac.type_2_name,

        ac.animal_engine_version,
        ac.type_engine_version

      FROM assessment_results ar

      INNER JOIN
        assessment_classifications ac
          ON ac.assessment_result_id =
             ar.id

      WHERE
        ar.assessment_id = $1

      LIMIT 1
      `,
      [
        assessmentId,
      ]
    )

  if (
    result.rows.length === 0
  ) {
    return null
  }

  const row =
    result.rows[0]

  return buildDnaBase({
    assessmentId:
      row.assessment_id,

    scores: {
      O: Number(row.o),
      C: Number(row.c),
      E: Number(row.e),
      A: Number(row.a),
      N: Number(row.n),
      R: Number(row.r),
      L: Number(row.l),
      P: Number(row.p),
      H: Number(row.h),
      I: Number(row.i),
      M: Number(row.m),
    },

    classification: {
      animal: {
        name:
          row.animal_name,

        bucket:
          row.animal_bucket,
      },

      types: [
        row.type_1_name,
        row.type_2_name,
      ].filter(Boolean),
    },

    scoringVersion:
      row.scoring_version,

    animalEngineVersion:
      row.animal_engine_version,

    typeEngineVersion:
      row.type_engine_version,
  })
}

module.exports = {
  loadDnaSource,
}
