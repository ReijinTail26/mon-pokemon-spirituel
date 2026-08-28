require('dotenv').config()

const fs = require('fs/promises')
const path = require('path')
const db = require('../db')
const { generatedObjectKey, putObject, sheetObjectKey } = require('../src/services/objectStorage')

const API_ROOT = path.join(__dirname, '..')

async function uploadIfPresent({ key, localPath, contentType }) {
  try {
    const body = await fs.readFile(localPath)
    await putObject({ key, body, contentType, localPath })
    console.log(`Envoyé: ${key}`)
    return 1
  } catch (error) {
    if (error.code === 'ENOENT') return 0
    throw error
  }
}

async function main() {
  if (process.env.STORAGE_DRIVER !== 'r2') throw new Error('STORAGE_DRIVER_MUST_BE_R2')

  const result = await db.query(`
    SELECT a.id, a.final_sheet_filename, a.final_sheet_mime_type,
           a.evolution_sheet_filename, a.evolution_sheet_mime_type,
           a.evolution_seed_pdf_created_at, gj.status AS generation_status
    FROM assessments a
    LEFT JOIN generation_jobs gj ON gj.assessment_id = a.id
    WHERE a.deleted_at IS NULL
  `)

  let uploaded = 0
  for (const row of result.rows) {
    const id = String(row.id)
    if (row.generation_status === 'READY') {
      for (const [filename, contentType] of [
        ['dossier-creatif.pdf', 'application/pdf'],
        ['prompt-fiche-complete.txt', 'text/plain; charset=utf-8'],
      ]) {
        uploaded += await uploadIfPresent({
          key: generatedObjectKey(id, filename),
          localPath: path.join(API_ROOT, 'generated-dossiers', id, filename),
          contentType,
        })
      }
    }
    if (row.evolution_seed_pdf_created_at) {
      uploaded += await uploadIfPresent({
        key: generatedObjectKey(id, 'seed-evolutif.pdf'),
        localPath: path.join(API_ROOT, 'generated-dossiers', id, 'seed-evolutif.pdf'),
        contentType: 'application/pdf',
      })
    }
    for (const [filename, contentType] of [
      [row.final_sheet_filename, row.final_sheet_mime_type],
      [row.evolution_sheet_filename, row.evolution_sheet_mime_type],
    ]) {
      if (!filename) continue
      const safeName = path.basename(filename)
      uploaded += await uploadIfPresent({
        key: sheetObjectKey(id, safeName),
        localPath: path.join(API_ROOT, 'uploads', 'final-sheets', id, safeName),
        contentType: contentType || 'application/octet-stream',
      })
    }
  }

  console.log(`Migration terminée: ${uploaded} fichier(s) envoyé(s) dans R2.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.end())

