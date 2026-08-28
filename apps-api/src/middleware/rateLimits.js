const { ipKeyGenerator, rateLimit } = require('express-rate-limit')

function isDisabled() {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_RATE_LIMITS === 'true'
}

function authenticatedKey(req) {
  if (req.user?.id) return `user:${req.user.id}`
  return `ip:${ipKeyGenerator(req.ip || req.socket?.remoteAddress || '127.0.0.1')}`
}

function createLimiter({ identifier, windowMs, limit, keyGenerator }) {
  return rateLimit({
    identifier,
    windowMs,
    limit,
    keyGenerator,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: req => isDisabled() || req.method === 'OPTIONS',
    handler: (req, res) => {
      const resetTime = req.rateLimit?.resetTime
      const retryAfter = resetTime instanceof Date
        ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
        : Math.ceil(windowMs / 1000)
      res.setHeader('Retry-After', String(retryAfter))
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Trop de requêtes ont été envoyées. Patientez quelques instants avant de réessayer.',
          retry_after_seconds: retryAfter,
        },
      })
    },
  })
}

const apiLimiter = createLimiter({
  identifier: 'api-general',
  windowMs: 5 * 60 * 1000,
  limit: 300,
})

const authLimiter = createLimiter({
  identifier: 'google-auth',
  windowMs: 15 * 60 * 1000,
  limit: 20,
})

const healthLimiter = createLimiter({
  identifier: 'health-checks',
  windowMs: 60 * 1000,
  limit: 60,
})

const downloadLimiter = createLimiter({
  identifier: 'private-downloads',
  windowMs: 5 * 60 * 1000,
  limit: 120,
})

const assessmentCreationLimiter = createLimiter({
  identifier: 'assessment-creation',
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: authenticatedKey,
})

const generationLimiter = createLimiter({
  identifier: 'package-generation',
  windowMs: 60 * 60 * 1000,
  limit: 8,
  keyGenerator: authenticatedKey,
})

const uploadLimiter = createLimiter({
  identifier: 'pokedex-uploads',
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: authenticatedKey,
})

const likeLimiter = createLimiter({
  identifier: 'community-likes',
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: authenticatedKey,
})

module.exports = {
  apiLimiter,
  assessmentCreationLimiter,
  authLimiter,
  downloadLimiter,
  generationLimiter,
  healthLimiter,
  likeLimiter,
  uploadLimiter,
}
