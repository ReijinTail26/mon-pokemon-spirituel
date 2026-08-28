require('dotenv').config()

const { Pool } = require('pg')

const usesDatabaseUrl = Boolean(process.env.DATABASE_URL)
const sslEnabled = process.env.DB_SSL === 'true' || /sslmode=(require|verify-ca|verify-full)/i.test(process.env.DATABASE_URL || '')

const pool = new Pool({
  ...(usesDatabaseUrl ? {
    connectionString: process.env.DATABASE_URL,
  } : {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
  ...(sslEnabled ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } } : {}),
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000),
})

pool.on('error', error => {
  console.error('Unexpected PostgreSQL pool error:', error)
})

module.exports = pool
