const {
  loadDnaSource,
} = require(
  './dnaSource'
)

const {
  ensureCanonicalCreatureSpec,
} = require(
  './canonicalCreatureSpec'
)

const {
  buildCreativePackage,
} = require(
  './creativePackage'
)

async function loadCreativePackage(
  assessmentId
) {
  const dna =
    await loadDnaSource(
      assessmentId
    )

  if (!dna) {
    return null
  }

  const canonicalSpec =
    await ensureCanonicalCreatureSpec(
      assessmentId
    )

  if (!canonicalSpec) {
    return null
  }

  return await buildCreativePackage({
    assessmentId,
    dna,
    visualConcept:
      canonicalSpec.spec,
  })
}

module.exports = {
  loadCreativePackage,
}
