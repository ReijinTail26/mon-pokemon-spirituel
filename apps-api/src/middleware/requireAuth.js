function requireAuth(req, res, next) {
  if (req.isAuthenticated?.() && req.user) return next()
  return res.status(401).json({
    error: { code: 'AUTH_REQUIRED', message: 'Connexion requise.' },
  })
}

module.exports = { requireAuth }
