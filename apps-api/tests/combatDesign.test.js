const assert = require('assert')

const animals = require('../src/data/animals.json')
const types = require('../src/data/types.json')
const officialCatalog = require('../src/data/officialCatalog.json')
const { buildDnaBase } = require('../src/services/dna')

const neutralScores = {
  O: 50,
  C: 50,
  E: 50,
  A: 50,
  N: 50,
  R: 50,
  L: 50,
  P: 50,
  H: 50,
  I: 50,
  M: 50,
}

const officialAbilityNames = new Set(
  officialCatalog.abilities.map((item) => item.name)
)

const officialMoveNames = new Set(
  officialCatalog.moves.map((item) => item.name)
)

function buildDna(animal, typeName, scores = neutralScores, suffix = 'neutral') {
  return buildDnaBase({
    assessmentId: `combat-audit-${animal.name}-${typeName}-${suffix}`,
    scores,
    classification: {
      animal: {
        name: animal.name,
        bucket: animal.bucket,
      },
      types: [typeName],
    },
    scoringVersion: 'audit',
    animalEngineVersion: 'audit',
    typeEngineVersion: 'audit',
  })
}

let tested = 0
const selectedAbilities = new Set()
const selectedOfficialMoves = new Set()

for (const animal of animals) {
  for (const type of types) {
    const dna = buildDna(animal, type.name)
    const combat = dna.COMBAT
    const moves = Object.values(combat.moves).filter(Boolean)

    assert.strictEqual(moves.length, 4)
    assert.strictEqual(moves.filter((move) => move.is_signature).length, 1)

    const original = combat.moves.original_move
    const official1 = combat.moves.official_move_1
    const official2 = combat.moves.official_move_2
    const signature = combat.moves.signature_move

    assert.ok(original)
    assert.ok(['animal-original', 'type-original'].includes(original.origin))
    assert.ok(original.name)
    assert.ok(original.type)
    assert.ok(original.category)
    assert.ok(original.description)
    assert.ok(original.effect)

    if (original.origin === 'animal-original') {
      assert.ok(original.anatomical_source)
    } else {
      assert.ok(original.energy_effect)
      assert.ok(original.effect_shape)
    }

    for (const officialMove of [official1, official2]) {
      assert.ok(officialMove)
      assert.strictEqual(officialMove.origin, 'official-existing')
      assert.strictEqual(officialMove.official, true)
      assert.ok(officialMove.name)
      assert.ok(officialMoveNames.has(officialMove.name))
      assert.ok(officialMove.type)
      assert.ok(officialMove.category)
      selectedOfficialMoves.add(officialMove.name)
    }

    assert.notStrictEqual(official1.name, official2.name)

    assert.ok(signature)
    assert.strictEqual(signature.origin, 'signature-original')
    assert.strictEqual(signature.is_signature, true)
    assert.strictEqual(signature.name, null)
    assert.strictEqual(signature.name_policy, 'AI_GENERATED')
    assert.ok(signature.type)
    assert.ok(signature.category)
    assert.ok(signature.anatomical_source)
    assert.ok(signature.effect_shape)
    assert.ok(signature.mechanic_brief)
    assert.ok(signature.generation_brief)
    assert.strictEqual(signature.generation_brief.policy, 'AI_GENERATED_FROM_CANONICAL_BRIEF')
    assert.strictEqual(signature.generation_brief.writing_requirements.generate_name, true)
    assert.strictEqual(signature.generation_brief.writing_requirements.generate_description, true)
    assert.strictEqual(signature.generation_brief.writing_requirements.generate_effect_wording, true)

    for (const move of [original, official1, official2, signature]) {
      if (move.category !== 'Statut' && move.power != null) {
        assert.ok(Number.isFinite(move.power))
        assert.ok(move.power > 0)
      }
    }

    assert.ok(combat.main_ability)
    assert.ok(officialAbilityNames.has(combat.main_ability.name))

    assert.ok(combat.hidden_ability)
    assert.strictEqual(combat.hidden_ability.official, false)
    assert.strictEqual(combat.hidden_ability.name, null)
    assert.strictEqual(combat.hidden_ability.name_policy, 'AI_GENERATED')
    assert.ok(combat.hidden_ability.trigger)
    assert.ok(combat.hidden_ability.effect)
    assert.ok(combat.hidden_ability.mechanic_brief)
    assert.ok(combat.hidden_ability.generation_brief)
    assert.strictEqual(
      combat.hidden_ability.generation_brief.writing_requirements.generate_name,
      true
    )
    assert.strictEqual(
      combat.hidden_ability.generation_brief.writing_requirements.do_not_invent_new_mechanics,
      true
    )

    selectedAbilities.add(combat.main_ability.name)
    tested += 1
  }
}

assert.strictEqual(tested, 900)
assert.ok(
  selectedAbilities.size >= 10,
  `Diversité insuffisante des talents principaux : ${selectedAbilities.size}`
)
assert.ok(
  selectedOfficialMoves.size >= 20,
  `Diversité insuffisante des attaques officielles : ${selectedOfficialMoves.size}`
)

console.log('✓ Combat Design : 900 combinaisons validées avec 1 originale + 2 officielles distinctes + 1 signature générée par IA')
