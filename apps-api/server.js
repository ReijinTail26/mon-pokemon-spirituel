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

app.listen(PORT, () => {
  console.log(
    `API démarrée sur http://localhost:${PORT}`
  )

  startGenerationWorkerLoop()
})
