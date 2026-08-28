const types =
  require(
    '../src/data/types.json'
  )

const animals =
  require(
    '../src/data/animals.json'
  )

const typeVisualRules =
  require(
    '../src/data/typeVisualRules.json'
  )

const {
  buildDnaBase,
} = require(
  '../src/services/dna'
)

const {
  buildTypeVisualDesign,
  buildDeterministicVisualConcept,
  validateVisualConcept,
} = require(
  '../src/services/visualArchitect'
)

function assert(
  condition,
  message
) {
  if (!condition) {
    throw new Error(
      message
    )
  }
}

function buildTestDna({
  animal,
  type1,
  type2 = null,
  suffix = '',
}) {
  return buildDnaBase({
    assessmentId:
      `test-${animal.name}-${type1}-${type2 ?? 'mono'}-${suffix}`,

    scores: {
      O: 58,
      C: 61,
      E: 55,
      A: 57,
      N: 43,
      R: 62,
      L: 59,
      P: 64,
      H: 56,
      I: 60,
      M: 63,
    },

    classification: {
      animal: {
        name:
          animal.name,

        bucket:
          animal.bucket,
      },

      types: [
        type1,
        type2,
      ].filter(Boolean),
    },

    scoringVersion:
      'test',

    animalEngineVersion:
      'test',

    typeEngineVersion:
      'test',
  })
}

function runTests() {
  const expectedTypeNames =
    types.map(
      (type) => type.name
    )

  const ruleNames =
    typeVisualRules.map(
      (rule) => rule.name
    )

  assert(
    typeVisualRules.length === 18,
    `18 règles visuelles attendues, obtenu ${typeVisualRules.length}.`
  )

  assert(
    new Set(ruleNames).size ===
      ruleNames.length,
    'Les noms de règles visuelles doivent être uniques.'
  )

  for (
    const typeName of
      expectedTypeNames
  ) {
    assert(
      ruleNames.includes(
        typeName
      ),
      `Règle visuelle absente pour ${typeName}.`
    )
  }

  const hexPattern =
    /^#[0-9A-F]{6}$/

  for (
    const rule of
      typeVisualRules
  ) {
    for (
      const field of [
        'primary',
        'secondary',
        'accent',
        'energy',
      ]
    ) {
      assert(
        hexPattern.test(
          rule.palette?.[field] ?? ''
        ),
        `Palette ${field} invalide pour ${rule.name}.`
      )
    }

    assert(
      Array.isArray(
        rule.visual_markers
      ) &&
        rule.visual_markers.length >=
          3,
      `Marqueurs visuels insuffisants pour ${rule.name}.`
    )

    assert(
      Boolean(
        rule.surface_influence
      ),
      `surface_influence absent pour ${rule.name}.`
    )

    assert(
      Boolean(
        rule.pattern_rule
      ),
      `pattern_rule absent pour ${rule.name}.`
    )

    assert(
      Boolean(
        rule.energy_effect
      ),
      `energy_effect absent pour ${rule.name}.`
    )

    assert(
      Array.isArray(
        rule.forbidden
      ) &&
        rule.forbidden.length >=
          2,
      `Contraintes interdites insuffisantes pour ${rule.name}.`
    )
  }

  console.log(
    '✓ 18 référentiels visuels de type complets'
  )

  const paon =
    animals.find(
      (animal) =>
        animal.name === 'Paon'
    )

  assert(
    paon,
    'Animal de test Paon introuvable.'
  )

  for (
    const type of
      expectedTypeNames
  ) {
    const dna =
      buildTestDna({
        animal:
          paon,

        type1:
          type,
      })

    const concept =
      buildDeterministicVisualConcept(
        dna
      )

    const evaluation =
      validateVisualConcept(
        concept,
        dna
      )

    assert(
      evaluation.valid,
      `${type} mono-type invalide : ${evaluation.errors.join(' | ')}`
    )

    assert(
      concept.markers.types.length ===
        1,
      `${type} doit produire exactement un marqueur de type en mono-type.`
    )

    assert(
      concept.markers.types[0]
        .startsWith(
          `${type} — `
        ),
      `Le marqueur ${type} n'est pas traçable.`
    )
  }

  console.log(
    '✓ 18 concepts mono-type valides'
  )

  let dualCount = 0

  for (
    let first = 0;
    first <
      expectedTypeNames.length;
    first += 1
  ) {
    for (
      let second =
        first + 1;
      second <
        expectedTypeNames.length;
      second += 1
    ) {
      const type1 =
        expectedTypeNames[first]

      const type2 =
        expectedTypeNames[second]

      const dna =
        buildTestDna({
          animal:
            paon,

          type1,

          type2,
        })

      const concept =
        buildDeterministicVisualConcept(
          dna
        )

      const evaluation =
        validateVisualConcept(
          concept,
          dna
        )

      assert(
        evaluation.valid,
        `${type1}/${type2} invalide : ${evaluation.errors.join(' | ')}`
      )

      assert(
        concept.markers.types.length ===
          2,
        `${type1}/${type2} doit produire deux marqueurs distincts.`
      )

      assert(
        concept.markers.types[0]
          .startsWith(
            `${type1} — `
          ),
        `Marqueur primaire absent pour ${type1}/${type2}.`
      )

      assert(
        concept.markers.types[1]
          .startsWith(
            `${type2} — `
          ),
        `Marqueur secondaire absent pour ${type1}/${type2}.`
      )

      dualCount += 1
    }
  }

  assert(
    dualCount === 153,
    `153 combinaisons duales attendues, obtenu ${dualCount}.`
  )

  console.log(
    '✓ 153 combinaisons dual-type valides'
  )

  let animalTypeCount = 0

  for (
    const animal of
      animals
  ) {
    for (
      const type of
        expectedTypeNames
    ) {
      const dna =
        buildTestDna({
          animal,

          type1:
            type,

          suffix:
            animalTypeCount,
        })

      const concept =
        buildDeterministicVisualConcept(
          dna
        )

      const evaluation =
        validateVisualConcept(
          concept,
          dna
        )

      assert(
        evaluation.valid,
        `${animal.name}/${type} invalide : ${evaluation.errors.join(' | ')}`
      )

      assert(
        concept.anatomy.body_plan ===
          (concept.morphology_variant?.body_plan ?? dna.BIOLOGY.body_plan),
        `${animal.name}/${type} : morphotype animal sélectionné perdu.`
      )

      animalTypeCount += 1
    }
  }

  assert(
    animalTypeCount ===
      50 * 18,
    `900 cas animal/type attendus, obtenu ${animalTypeCount}.`
  )

  console.log(
    '✓ 900 combinaisons animal × type valides'
  )

  const fireWater =
    buildTypeVisualDesign({
      type1:
        'Feu',

      type2:
        'Eau',
    })

  assert(
    fireWater.markers.length ===
      2,
    'Le design Feu/Eau doit conserver deux marqueurs.'
  )

  assert(
    fireWater.palette.primary ===
      '#C94432',
    'Le type principal doit conserver la couleur primaire dominante.'
  )

  assert(
    fireWater.palette.accent ===
      '#9BE7F5',
    'Le second type doit contribuer explicitement à la couleur accent.'
  )

  console.log(
    '✓ Fusion visuelle dual-type déterministe'
  )

  console.log(
    '✓ Référentiel visuel des 18 types opérationnel'
  )
}

runTests()
