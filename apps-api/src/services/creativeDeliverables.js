const path =
  require('path')

const {
  buildCreativeDossierModel,
} = require(
  './creativeDossier'
)

const {
  buildPromptFicheComplete,
} = require(
  './finalSheetPrompt'
)

const {
  renderCreativeDossierPdf,
} = require(
  './creativeDossierPdf'
)

const {
  assertValidCreativePackage,
} = require(
  './creativePackageValidator'
)

const {
  createEvolutionSeedPdf,
} = require('./evolutionSeedPdf')

const {
  generatedObjectKey,
  putObject,
} = require('./objectStorage')

const OUTPUT_ROOT =
  path.join(
    __dirname,
    '../../generated-dossiers'
  )

async function createCreativeDeliverables({
  assessmentId,
  creativePackage,
  evolutionUnlocked = false,
}) {
  if (!creativePackage) {
    throw new Error(
      'CREATIVE_PACKAGE_REQUIRED'
    )
  }

  /*
    Dernière barrière métier avant tout livrable public.
    Un package incomplet ne doit jamais produire de PDF ou de prompt.
  */
  assertValidCreativePackage(
    creativePackage
  )

  const creativeDossier =
    buildCreativeDossierModel({
      creativePackage,
    })

  const renderedPdf =
    await renderCreativeDossierPdf({
      assessmentId,
      creativeDossier,
    })

  const prompt =
    buildPromptFicheComplete({
      creativePackage,
      creativeDossier,
    })

  const folder = path.join(OUTPUT_ROOT, assessmentId)

  const promptFilename =
    'prompt-fiche-complete.txt'

  const promptPath =
    path.join(
      folder,
      promptFilename
    )

  const dossierFilename = 'dossier-creatif.pdf'
  await putObject({
    key: generatedObjectKey(assessmentId, dossierFilename),
    body: renderedPdf.pdf_bytes,
    contentType: 'application/pdf',
    contentDisposition: `attachment; filename="${dossierFilename}"`,
    localPath: path.join(folder, dossierFilename),
  })
  await putObject({
    key: generatedObjectKey(assessmentId, promptFilename),
    body: Buffer.from(prompt, 'utf8'),
    contentType: 'text/plain; charset=utf-8',
    contentDisposition: `attachment; filename="${promptFilename}"`,
    localPath: promptPath,
  })

  const evolutionSeed = evolutionUnlocked
    ? await createEvolutionSeedPdf({
        assessmentId,
        creativePackage,
      })
    : null

  if (evolutionSeed) {
    await putObject({
      key: generatedObjectKey(assessmentId, evolutionSeed.filename),
      body: evolutionSeed.bytes,
      contentType: 'application/pdf',
      contentDisposition: `attachment; filename="${evolutionSeed.filename}"`,
      localPath: path.join(folder, evolutionSeed.filename),
    })
    delete evolutionSeed.bytes
  }

  return {
    status:
      'READY',

    dossier: {
      filename:
        dossierFilename,

      file_reference:
        `/generated-dossiers/${assessmentId}/${dossierFilename}`,
    },

    prompt: {
      filename:
        promptFilename,

      file_reference:
        `/generated-dossiers/${assessmentId}/${promptFilename}`,
    },

    evolution_seed: evolutionSeed,
  }
}

module.exports = {
  createCreativeDeliverables,
}
