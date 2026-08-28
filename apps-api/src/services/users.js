const db = require('../../db')

async function upsertGoogleUser(profile) {
  const email = profile.emails?.[0]?.value ?? null
  const avatarUrl = profile.photos?.[0]?.value ?? null
  const displayName = profile.displayName ?? email ?? 'Utilisateur'
  const emailVerified = Boolean(profile._json?.email_verified)

  if (!profile.id || !email) {
    throw new Error('GOOGLE_PROFILE_INCOMPLETE')
  }

  const result = await db.query(`
    INSERT INTO users (
      google_sub, email, email_verified, display_name, avatar_url
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (google_sub)
    DO UPDATE SET
      email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW()
    RETURNING id, email, email_verified, display_name, avatar_url, username,
              created_at, updated_at
  `, [profile.id, email.toLowerCase(), emailVerified, displayName, avatarUrl])

  return result.rows[0]
}

async function findUserById(id) {
  const result = await db.query(`
    SELECT id, email, email_verified, display_name, avatar_url, username,
           created_at, updated_at
    FROM users
    WHERE id = $1 AND deleted_at IS NULL
    LIMIT 1
  `, [id])
  return result.rows[0] ?? null
}

module.exports = { upsertGoogleUser, findUserById }
