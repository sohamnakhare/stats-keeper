import { defineConfig } from 'drizzle-kit';

// Use Turso in production, local SQLite in development
const isProduction = process.env.TURSO_DATABASE_URL !== undefined;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'file:./data/stats-keeper.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
