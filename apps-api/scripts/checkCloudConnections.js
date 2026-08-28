require('dotenv').config()

const assert = require('assert')
const db = require('../db')
const { deleteObject, getObject, putObject } = require('../src/services/objectStorage')

async function main() {
  if (process.env.STORAGE_DRIVER !== 'r2') throw new Error('STORAGE_DRIVER_MUST_BE_R2')

  const database = await db.query('SELECT current_database() AS name, NOW() AS checked_at')
  console.log(`Neon OK: ${database.rows[0].name} (${database.rows[0].checked_at.toISOString()})`)

  const key = `healthchecks/${Date.now()}-${process.pid}.txt`
  const expected = Buffer.from('pokemon-r2-ok', 'utf8')
  await putObject({ key, body: expected, contentType: 'text/plain' })
  const actual = await getObject({ key })
  assert(actual && actual.equals(expected), 'Le contenu relu depuis R2 ne correspond pas.')
  await deleteObject({ key })
  console.log(`R2 OK: ${process.env.R2_BUCKET_NAME} (objet temporaire supprimé)`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.end())

