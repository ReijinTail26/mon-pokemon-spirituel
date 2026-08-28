const {
  classifyAnimal,
} = require(
  './animalClassifier'
)

const {
  classifyTypes,
} = require(
  './typeClassifier'
)

function classifyProfile(
  scores
) {
  const animal =
    classifyAnimal({
      O: scores.O,
      C: scores.C,
      E: scores.E,
      A: scores.A,
      N: scores.N,
    })

  const types =
    classifyTypes({
      R: scores.R,
      L: scores.L,
      P: scores.P,
      H: scores.H,
      I: scores.I,
      M: scores.M,
    })

  return {
    animal:
      animal.animal,

    types: {
      type_1:
        types.type_1,

      type_2:
        types.type_2,

      dual:
        types.dual,
    },

    debug: {
      animal:
        animal.debug,

      types:
        types.debug,
    },
  }
}

module.exports = {
  classifyProfile,
}