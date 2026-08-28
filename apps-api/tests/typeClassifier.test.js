const {
  classifyTypes,
} = require(
  '../src/services/typeClassifier'
)

function runTests() {
  const fire = classifyTypes({
    R: 72,
    L: 58,
    P: 98,
    H: 22,
    I: 100,
    M: 28,
  })

  if (
    fire.type_1 !== 'Feu'
  ) {
    throw new Error(
      `Attendu Feu, obtenu ${fire.type_1}`
    )
  }

  console.log(
    '✓ Profil Feu correctement reconnu'
  )

  const psychic =
    classifyTypes({
      R: 50,
      L: 68,
      P: 30,
      H: 64,
      I: 46,
      M: 100,
    })

  if (
    psychic.type_1 !== 'Psy'
  ) {
    throw new Error(
      `Attendu Psy, obtenu ${psychic.type_1}`
    )
  }

  console.log(
    '✓ Profil Psy correctement reconnu'
  )

  const steel =
    classifyTypes({
      R: 14,
      L: 18,
      P: 84,
      H: 34,
      I: 18,
      M: 42,
    })

  if (
    steel.type_1 !== 'Acier'
  ) {
    throw new Error(
      `Attendu Acier, obtenu ${steel.type_1}`
    )
  }

  console.log(
    '✓ Profil Acier correctement reconnu'
  )

  console.log(
    '✓ Type classifier V1 opérationnel'
  )
}

runTests()