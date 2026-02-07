// Database Schema - Drizzle ORM
// Based on specs/data-models.md

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================
// Teams Table
// ============================================
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  color: text('color').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// Players Table
// ============================================
export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  name: text('name').notNull(),
  position: text('position'), // PG, SG, SF, PF, C
  isCaptain: integer('is_captain', { mode: 'boolean' }).notNull().default(false),
  isOnCourt: integer('is_on_court', { mode: 'boolean' }).notNull().default(false),
});

// ============================================
// Games Table
// ============================================
export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  homeTeamId: text('home_team_id').notNull().references(() => teams.id),
  awayTeamId: text('away_team_id').notNull().references(() => teams.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  venue: text('venue'),
  status: text('status').notNull().default('scheduled'), // scheduled, in_progress, completed, cancelled
  currentPeriod: text('current_period').notNull().default('Q1'),
  currentPossession: text('current_possession'), // home, away, null
  possessionArrow: text('possession_arrow').notNull().default('home'),
  // Game clock fields
  clockTimeRemaining: integer('clock_time_remaining'), // milliseconds remaining in period
  clockIsRunning: integer('clock_is_running', { mode: 'boolean' }).default(false),
  clockLastStartedAt: integer('clock_last_started_at', { mode: 'timestamp' }), // when clock was last started
  periodDuration: integer('period_duration').default(600000), // 10 minutes in milliseconds
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// Starting Five Junction Table
// ============================================
export const startingFive = sqliteTable('starting_five', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  teamId: text('team_id').notNull().references(() => teams.id),
  playerId: text('player_id').notNull().references(() => players.id),
});

// ============================================
// Period Scores Table
// ============================================
export const periodScores = sqliteTable('period_scores', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  period: text('period').notNull(), // Q1, Q2, Q3, Q4, OT1, OT2, OT3
  homeScore: integer('home_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  startTime: integer('start_time', { mode: 'timestamp' }),
  endTime: integer('end_time', { mode: 'timestamp' }),
});

// ============================================
// Play Events Table
// ============================================
export const playEvents = sqliteTable('play_events', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  period: text('period').notNull(),
  gameTime: text('game_time').notNull(), // "09:45" format
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  teamId: text('team_id').notNull().references(() => teams.id),
  playerId: text('player_id').references(() => players.id),
  eventType: text('event_type').notNull(),
  // Additional event data stored as JSON
  eventData: text('event_data'), // JSON string for event-specific fields
});

// ============================================
// Saved Rosters Table (for roster reuse)
// ============================================
export const savedRosters = sqliteTable('saved_rosters', {
  id: text('id').primaryKey(),
  teamName: text('team_name').notNull(),
  shortName: text('short_name').notNull(),
  color: text('color').notNull(),
  // Players stored as JSON array
  players: text('players').notNull(), // JSON string of SavedRosterPlayer[]
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  lastUsed: integer('last_used', { mode: 'timestamp' }).notNull(),
});

// ============================================
// Type Exports for Drizzle
// ============================================
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type SavedRoster = typeof savedRosters.$inferSelect;
export type NewSavedRoster = typeof savedRosters.$inferInsert;

export type PlayEvent = typeof playEvents.$inferSelect;
export type NewPlayEvent = typeof playEvents.$inferInsert;
