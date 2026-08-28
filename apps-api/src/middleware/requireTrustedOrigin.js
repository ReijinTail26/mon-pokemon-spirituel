const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function normalizedOrigin(value) {
  try {
    return new URL(String(value)).origin
  } catch {
    return null
  }
}

function requireTrustedOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next()

  const expectedOrigin = normalizedOrigin(process.env.WEB_ORIGIN ?? 'http://localhost:5173')
  const requestOrigin = normalizedOrigin(req.get('origin'))

  if (!expectedOrigin || requestOrigin !== expectedOrigin) {
    return res.status(403).json({
      error: {
        code: 'UNTRUSTED_ORIGIN',
        message: 'Cette opération doit être effectuée depuis le site officiel.',
      },
    })
  }

  next()
}

module.exports = { requireTrustedOrigin }
