// Database Connection - SQLite (local) or Turso (production)
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Determine if we're using Turso (production) or local SQLite (development)
const isProduction = process.env.TURSO_DATABASE_URL !== undefined;

// Create the database client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/stats-keeper.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export * from './schema';
