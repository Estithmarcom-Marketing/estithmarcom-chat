import pg from 'pg'

const { Pool } = pg

function requireEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    )
  }

  return value
}

const databasePort = Number(
  process.env.DATABASE_PORT ?? '5432',
)

if (
  !Number.isInteger(databasePort) ||
  databasePort <= 0
) {
  throw new Error(
    'DATABASE_PORT must be a valid positive integer',
  )
}

export const databasePool = new Pool({
  host: requireEnvironmentVariable(
    'DATABASE_HOST',
  ),
  port: databasePort,
  database: requireEnvironmentVariable(
    'DATABASE_NAME',
  ),
  user: requireEnvironmentVariable(
    'DATABASE_USER',
  ),
  password: requireEnvironmentVariable(
    'DATABASE_PASSWORD',
  ),

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export async function closeDatabasePool() {
  await databasePool.end()
}