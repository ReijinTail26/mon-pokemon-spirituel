require('dotenv').config()

const { validateProductionConfig } = require('./src/config/validateProductionConfig')
validateProductionConfig()

const app = require('./src/app')

const {
  startGenerationWorkerLoop,
} = require('./src/workers/generationWorkerLoop')

const PORT =
  Number(process.env.PORT) ||
  3001

const server = app.listen(PORT, () => {
  console.log(
    `API démarrée sur http://localhost:${PORT}`
  )

  startGenerationWorkerLoop()
})

server.headersTimeout = 15 * 1000
server.requestTimeout = 120 * 1000
server.keepAliveTimeout = 5 * 1000
