const animals =
  require('../data/animals.json')

const calibration =
  require('../data/animalCalibration.json')

const TRAITS = [
  'O',
  'C',
  'E',
  'A',
  'N',
]

function calculateDistance(
  userProfile,
  animalProfile
) {
  const sigma =
    calibration.reference_sigma

  let total = 0

  for (const trait of TRAITS) {
    const normalizedDifference =
      (
        userProfile[trait] -
        animalProfile[trait]
      ) /
      sigma[trait]

    total += Math.pow(
      Math.abs(normalizedDifference),
      calibration.distance_exponent
    )
  }

  return Math.sqrt(total)
}

function classifyAnimal(userProfile) {
  const ranking = animals.map((animal) => {
    const rawDistance =
      calculateDistance(
        userProfile,
        animal.big5
      )

    return {
      name: animal.name,
      bucket: animal.bucket,
      raw_distance: rawDistance,
    }
  })

  ranking.sort(
    (a, b) =>
      a.raw_distance -
      b.raw_distance
  )

  const bestRawDistance =
    ranking[0].raw_distance

  const allowedNames =
    new Set(
      ranking
        .slice(
          0,
          calibration.max_raw_rank
        )
        .filter(
          (candidate) =>
            candidate.raw_distance <=
            bestRawDistance +
              calibration.distance_margin
        )
        .map(
          (candidate) =>
            candidate.name
        )
    )

  for (const candidate of ranking) {
    const offset =
      calibration.offsets[
        candidate.name
      ] ?? 0

    candidate.offset = offset

    candidate.eligible =
      allowedNames.has(
        candidate.name
      )

    candidate.corrected_distance =
      candidate.eligible
        ? candidate.raw_distance +
          offset
        : Number.POSITIVE_INFINITY
  }

  const winner =
    ranking.reduce(
      (best, candidate) =>
        candidate.corrected_distance <
        best.corrected_distance
          ? candidate
          : best
    )

  return {
    animal: {
      name: winner.name,
      bucket: winner.bucket,
    },

    debug: {
      winner_raw_distance:
        Number(
          winner.raw_distance.toFixed(6)
        ),

      winner_corrected_distance:
        Number(
          winner.corrected_distance.toFixed(6)
        ),

      raw_top_5:
        ranking.slice(0, 5),

      eligible:
        ranking.filter(
          (candidate) =>
            candidate.eligible
        ),
    },
  }
}

module.exports = {
  calculateDistance,
  classifyAnimal,
}