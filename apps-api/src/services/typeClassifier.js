const types =
  require('../data/types.json')

const rules =
  require('../data/typeRules.json')

const AXES = [
  'R',
  'L',
  'P',
  'H',
  'I',
  'M',
]

function calculateRawDistance(
  userProfile,
  typeProfile
) {
  const sigma =
    rules.reference_sigma

  let total = 0

  for (const axis of AXES) {
    const normalizedDifference =
      (
        userProfile[axis] -
        typeProfile[axis]
      ) /
      sigma[axis]

    total += Math.pow(
      Math.abs(normalizedDifference),
      rules.distance_exponent
    )
  }

  return Math.sqrt(total)
}

function classifyTypes(userProfile) {
  const ranking = types.map(
    (type) => {
      const rawDistance =
        calculateRawDistance(
          userProfile,
          type
        )

      return {
        name: type.name,
        raw_distance:
          rawDistance,

        coefficient:
          type.correction_coefficient,
      }
    }
  )

  ranking.sort(
    (a, b) =>
      a.raw_distance -
      b.raw_distance
  )

  const bestRaw =
    ranking[0].raw_distance

  const eligibleNames =
    new Set(
      ranking
        .slice(
          0,
          rules.raw_top_n_guardrail
        )
        .filter(
          (candidate) =>
            candidate.raw_distance <=
            bestRaw *
              rules.max_raw_distance_ratio
        )
        .map(
          (candidate) =>
            candidate.name
        )
    )

  for (const candidate of ranking) {
    candidate.eligible =
      eligibleNames.has(
        candidate.name
      )

    candidate.corrected_distance =
      candidate.eligible
        ? candidate.raw_distance *
          candidate.coefficient
        : Number.POSITIVE_INFINITY
  }

  const correctedRanking =
    [...ranking].sort(
      (a, b) =>
        a.corrected_distance -
        b.corrected_distance
    )

  const type1 =
    correctedRanking[0]

  const type2Candidate =
    correctedRanking[1]

  const denominator =
    Math.max(
      type1.corrected_distance,
      1e-9
    )

  const gapRatio =
    (
      type2Candidate.corrected_distance -
      type1.corrected_distance
    ) /
    denominator

  const type2 =
    gapRatio <=
    rules.dual_type_corrected_gap_ratio
      ? type2Candidate
      : null

  return {
    type_1: type1.name,

    type_2:
      type2
        ? type2.name
        : null,

    dual:
      Boolean(type2),

    debug: {
      gap_ratio:
        Number(
          gapRatio.toFixed(6)
        ),

      raw_top_5:
        ranking.slice(0, 5),

      eligible:
        correctedRanking.filter(
          (candidate) =>
            candidate.eligible
        ),
    },
  }
}

module.exports = {
  calculateRawDistance,
  classifyTypes,
}