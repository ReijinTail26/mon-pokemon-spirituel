const fs = require('fs/promises')
const path = require('path')
const storage = require('../src/services/objectStorage')

async function run() {
  if (storage.isR2()) throw new Error('Ce test doit utiliser STORAGE_DRIVER=local.')

  const root = await fs.mkdtemp(path.join(process.cwd(), 'storage-test-'))
  const localPath = path.join(root, 'nested', 'object.txt')
  try {
    await storage.putObject({
      key: 'test/object.txt',
      localPath,
      body: Buffer.from('stockage-local-ok', 'utf8'),
      contentType: 'text/plain',
    })
    const bytes = await storage.getObject({ key: 'test/object.txt', localPath })
    if (!bytes || bytes.toString('utf8') !== 'stockage-local-ok') {
      throw new Error('Lecture locale incorrecte.')
    }
    await storage.deleteObject({ key: 'test/object.txt', localPath })
    if (await storage.getObject({ key: 'test/object.txt', localPath }) !== null) {
      throw new Error('Suppression locale incorrecte.')
    }
    console.log('✓ Adaptateur de stockage local opérationnel')
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})

