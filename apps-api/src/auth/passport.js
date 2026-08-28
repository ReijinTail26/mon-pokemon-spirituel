const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const { upsertGoogleUser, findUserById } = require('../services/users')

function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const callbackURL = process.env.GOOGLE_CALLBACK_URL

  if (!clientID || !clientSecret || !callbackURL) {
    throw new Error('GOOGLE_OAUTH_ENV_MISSING')
  }

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL,
    state: true,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const user = await upsertGoogleUser(profile)
      done(null, user)
    } catch (error) {
      done(error)
    }
  }))

  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await findUserById(id))
    } catch (error) {
      done(error)
    }
  })
}

module.exports = { passport, configurePassport }
