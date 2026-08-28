const {
  classifyAnimal,
} = require(
  '../src/services/animalClassifier'
)

function assertAnimal(
  profile,
  expected
) {
  const result =
    classifyAnimal(profile)

  if (
    result.animal.name !==
    expected
  ) {
    throw new Error(
      `Attendu ${expected}, obtenu ${result.animal.name}`
    )
  }

  console.log(
    `✓ ${expected} correctement reconnu`
  )
}

function runTests() {
  assertAnimal(
    {
      O: 82,
      C: 58,
      E: 95,
      A: 92,
      N: 18,
    },
    'Dauphin'
  )

  assertAnimal(
    {
      O: 25,
      C: 72,
      E: 58,
      A: 60,
      N: 25,
    },
    'Rhinocéros'
  )

  assertAnimal(
    {
      O: 92,
      C: 58,
      E: 65,
      A: 70,
      N: 42,
    },
    'Kitsune'
  )

  console.log(
    '✓ Animal classifier V1.2 opérationnel'
  )
}

runTests()