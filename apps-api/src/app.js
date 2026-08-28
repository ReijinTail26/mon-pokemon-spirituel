const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const path = require('path')

const db = require('../db')

const questionnaireRouter = require('./routes/questionnaire')
const assessmentsRouter = require('./routes/assessments')
const devRouter = require('./routes/dev')
const authRouter = require('./routes/auth')
const accountRouter = require('./routes/account')
const publicRouter = require('./routes/public')
const deliverablesRouter = require('./routes/deliverables')
const { passport, configurePassport } = require('./auth/passport')
const {
  apiLimiter,
  authLimiter,
  downloadLimiter,
  healthLimiter,
} = require('./middleware/rateLimits')
const { requireTrustedOrigin } = require('./middleware/requireTrustedOrigin')

const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

configurePassport()

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
)

// Ces limites s’appliquent avant la session afin de protéger également PostgreSQL.
app.use('/api/v1', apiLimiter)
app.use('/api/v1/auth', authLimiter)
app.use('/generated-dossiers', downloadLimiter)
app.use('/api/v1', requireTrustedOrigin)

app.get('/health', healthLimiter, (req, res) => {
  res.json({
    status: 'ok',
  })
})

app.get('/db-health', healthLimiter, async (req, res) => {
  try {
    const result =
      await db.query(
        'SELECT NOW()'
      )

    res.json({
      status: 'ok',
      database_time:
        result.rows[0].now,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      status: 'error',
    })
  }
})

app.use(express.json({ limit: '64kb', strict: true }))

app.use(session({
  store: new pgSession({ pool: db, tableName: 'user_sessions' }),
  name: 'pokemon.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/generated-dossiers', deliverablesRouter)

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/account', accountRouter)
app.use('/api/v1/public', publicRouter)

app.use(
  '/api/v1/questionnaire',
  questionnaireRouter
)

app.use(
  '/api/v1/assessments',
  assessmentsRouter
)

app.use(
  '/api/v1/dev',
  devRouter
)

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: { code: 'FILE_TOO_LARGE', message: 'Le fichier dépasse la taille maximale autorisée de 15 Mo.' } })
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'REQUEST_TOO_LARGE', message: 'La requête envoyée est trop volumineuse.' } })
  }
  console.error('Unhandled API error:', error)
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.' } })
})

module.exports = app
