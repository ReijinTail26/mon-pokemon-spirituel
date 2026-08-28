const crypto = require('crypto')
const { getVisualSeedLibrary } = require('./visualSeedLibraryLoader')
const { reserveSelection, SELECTION_KINDS } = require('./selectionHistory')

const library = getVisualSeedLibrary()

function stableIndex(seed, length) {
  if (!length) return -1
  const hex = crypto.createHash('sha256').update(String(seed)).digest('hex').slice(0, 12)
  return parseInt(hex, 16) % length
}

function getAnimalEntry(animal) {
  return (library.animals ?? []).find(item => item.animal === animal) ?? null
}

function formatVisualSeed({ animal, entry, active, model, antiRepetition = null }) {
  return {
    status: 'SELECTED',
    animal,
    available_models: active.length,
    model: {
      ...model,
      folder: entry.folder,
      asset_relative_path: `${entry.folder}/${model.file}`,
    },
    policy: {
      interpretation: 'morphology_variation_reference_not_copy_target',
      mandatory_reference_for_final_ai: true,
      preserve_dna_priority: true,
      anti_repetition: antiRepetition,
      may_influence: [
        'silhouette rhythm',
        'proportion family',
        'pose energy',
        'mass distribution',
        'head/body relationship',
      ],
      may_not_override: [
        'canonical limb count',
        'signature anatomy',
        'type markers',
        'canonical markings',
        'palette logic',
        'DNA personality cues',
      ],
      instruction:
        "Utiliser l'image comme ancre de variation morphologique. S'inspirer de sa silhouette, de ses proportions et de son énergie générale sans la copier littéralement. Les règles canoniques du DNA restent prioritaires.",
    },
  }
}

function selectVisualSeed({ assessmentId, animal }) {
  const entry = getAnimalEntry(animal)
  if (!entry) return { status: 'NO_ANIMAL_LIBRARY', animal, model: null }

  const active = (entry.models ?? []).filter(model => model.enabled !== false)
  if (active.length < (library.minimum_models_before_activation ?? 2)) {
    return {
      status: 'AWAITING_REFERENCE_IMAGES',
      animal,
      model: null,
      available_models: active.length,
      target_models: entry.target_model_count ?? 10,
    }
  }

  const index = stableIndex(`${assessmentId}|${animal}|visual-seed-v2`, active.length)
  return formatVisualSeed({ animal, entry, active, model: active[index] })
}

async function selectVisualSeedWithHistory({ assessmentId, animal }) {
  const entry = getAnimalEntry(animal)
  if (!entry) return { status: 'NO_ANIMAL_LIBRARY', animal, model: null }

  const active = (entry.models ?? []).filter(model => model.enabled !== false)
  if (active.length < (library.minimum_models_before_activation ?? 2)) {
    return {
      status: 'AWAITING_REFERENCE_IMAGES',
      animal,
      model: null,
      available_models: active.length,
      target_models: entry.target_model_count ?? 10,
    }
  }

  const reservation = await reserveSelection({
    assessmentId,
    selectionKind: SELECTION_KINDS.VISUAL_SEED,
    scopeKey: animal,
    candidateIds: active.map(model => model.id),
    metadata: {
      animal,
      anti_repeat_window: 3,
      library_version: library.version ?? null,
    },
    chooseId: (eligibleIds) => {
      const eligible = active.filter(model => eligibleIds.includes(model.id))
      const index = stableIndex(`${assessmentId}|${animal}|visual-seed-history-v1`, eligible.length)
      return eligible[index].id
    },
  })

  const model = active.find(item => item.id === reservation.selectedId)
  if (!model) throw new Error('VISUAL_SEED_HISTORY_SELECTED_ID_NOT_FOUND')

  return formatVisualSeed({
    animal,
    entry,
    active,
    model,
    antiRepetition: {
      window: 3,
      scope: 'same_animal',
      recent_excluded: reservation.recentIds,
      eligible_count: reservation.eligibleIds.length,
      reused_for_same_assessment: reservation.reusedForAssessment,
    },
  })
}

module.exports = {
  selectVisualSeed,
  selectVisualSeedWithHistory,
}
