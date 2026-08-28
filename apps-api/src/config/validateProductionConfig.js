function requireValue(name) {
  const value = String(process.env[name] || '').trim()
  if (!value || /REMPLACE|VOTRE-|ACCOUNT_ID/i.test(value)) {
    throw new Error(`Configuration de production manquante ou factice : ${name}`)
  }
  return value
}

function requireHttpsUrl(name) {
  const value = requireValue(name)
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`URL de production invalide : ${name}`)
  }
  if (parsed.protocol !== 'https:') throw new Error(`${name} doit utiliser HTTPS.`)
  return parsed
}

function validateProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return

  requireHttpsUrl('FRONTEND_URL')
  requireHttpsUrl('WEB_ORIGIN')
  requireHttpsUrl('GOOGLE_CALLBACK_URL')
  requireValue('GOOGLE_CLIENT_ID')
  requireValue('GOOGLE_CLIENT_SECRET')

  const databaseUrl = requireValue('DATABASE_URL')
  if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    throw new Error('DATABASE_URL doit être une URL PostgreSQL.')
  }

  const sessionSecret = requireValue('SESSION_SECRET')
  if (sessionSecret.length < 32) throw new Error('SESSION_SECRET doit contenir au moins 32 caractères.')

  if (process.env.STORAGE_DRIVER !== 'r2') {
    throw new Error('STORAGE_DRIVER doit valoir r2 en production.')
  }
  requireHttpsUrl('R2_ENDPOINT')
  requireValue('R2_BUCKET_NAME')
  requireValue('R2_ACCESS_KEY_ID')
  requireValue('R2_SECRET_ACCESS_KEY')
}

module.exports = { validateProductionConfig }

