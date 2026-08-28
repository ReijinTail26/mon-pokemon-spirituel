const express = require('express')
const { passport } = require('../auth/passport')

const router = express.Router()
const frontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost:5173'

router.get('/google', passport.authenticate('google', {
  scope: ['openid', 'profile', 'email'],
  prompt: 'select_account',
}))

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${frontendUrl()}/?auth=failed` }),
  (req, res) => res.redirect(`${frontendUrl()}/?auth=success`)
)

router.get('/me', (req, res) => {
  if (!req.user) return res.json({ authenticated: false, user: null })
  res.json({ authenticated: true, user: req.user })
})

router.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error)
    req.session?.destroy(() => {
      res.clearCookie('pokemon.sid')
      res.json({ status: 'ok' })
    })
  })
})

module.exports = router
