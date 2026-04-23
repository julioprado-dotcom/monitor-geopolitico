import { createClient, type Client } from '@libsql/client'

const globalForDb = globalThis as unknown as {
  db: Client | undefined
}

function createDbClient(): Client {
  // If TURSO_URL is set, use Turso (remote libSQL)
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })
  }

  // Otherwise, use local SQLite (development)
  return createClient({
    url: process.env.DATABASE_URL || 'file:./db/dev.db',
  })
}

export const db = globalForDb.db ?? createDbClient()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db
