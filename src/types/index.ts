// Basketball Stats Keeper - Type Definitions
// Based on specs/data-models.md and FIBA Statisticians' Manual 2024

// ============================================
// Core Entities
// ============================================

export type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type Period = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT1' | 'OT2' | 'OT3';
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface PeriodData {
  period: Period;
  homeScore: number;
  awayScore: number;
  startTime?: Date;
  endTime?: Date;
}

export interface Player {
  id: string;
  teamId: string;
  number: number;
  name: string;
  position?: Position;
  isCaptain: boolean;
  isOnCourt: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  players: Player[];
  startingFive: string[];
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  venue?: string;
  status: GameStatus;
  currentPeriod: Period;
  currentPossession: 'home' | 'away' | null;
  possessionArrow: 'home' | 'away';
  periods: PeriodData[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Saved Rosters (for roster reuse)
// ============================================

export interface SavedRosterPlayer {
  number: number;
  name: string;
  position?: Position;
  isCaptain: boolean;
}

export interface SavedRoster {
  id: string;
  teamName: string;
  shortName: string;
  color: string;
  players: SavedRosterPlayer[];
  createdAt: Date;
  lastUsed: Date;
}

// ============================================
// Form/Input Types
// ============================================

export interface NewGameInput {
  date: Date;
  venue?: string;
  homeTeam: TeamInput;
  awayTeam: TeamInput;
}

export interface TeamInput {
  name: string;
  shortName: string;
  color: string;
}

export interface PlayerInput {
  number: number;
  name: string;
  position?: Position;
  isCaptain: boolean;
  isStarter: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SavedRosterListResponse {
  rosters: SavedRoster[];
}

// ============================================
// Event Types (for live scoring - defined here for completeness)
// ============================================

export type EventType =
  | 'field_goal_made'
  | 'field_goal_missed'
  | 'free_throw_made'
  | 'free_throw_missed'
  | 'offensive_rebound'
  | 'defensive_rebound'
  | 'team_rebound'
  | 'assist'
  | 'turnover'
  | 'steal'
  | 'block'
  | 'foul'
  | 'substitution'
  | 'timeout'
  | 'period_start'
  | 'period_end';

export interface PlayEvent {
  id: string;
  gameId: string;
  period: Period;
  gameTime: string;
  timestamp: Date;
  teamId: string;
  playerId?: string;
  eventType: EventType;
}

// ============================================
// Storage Types
// ============================================

export interface LiveGameState {
  game: Game;
  events: PlayEvent[];
  lastSavedAt: Date;
}

// ============================================
// Computed Statistics (per FIBA Appendix C)
// ============================================

export interface PlayerBoxScore {
  playerId: string;
  playerName: string;
  playerNumber: number;
  isStarter: boolean;

  // Time
  minutesPlayed: string; // "32:45" format

  // Scoring
  points: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowPercentage: number;

  // Rebounds
  offensiveRebounds: number;
  defensiveRebounds: number;
  totalRebounds: number;

  // Playmaking
  assists: number;
  turnovers: number;

  // Defense
  steals: number;
  blocks: number;

  // Fouls
  personalFouls: number;
  foulsDrawn: number;

  // Advanced
  plusMinus: number;
  efficiencyRating: number; // PTS - (FGA-FGM) - (FTA-FTM) + REB + AST - TO + STL + BLK
}

export interface TeamBoxScore {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamColor: string;

  // Score
  totalPoints: number;
  pointsByPeriod: Record<Period, number>;

  // Shooting
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowPercentage: number;

  // Rebounds
  offensiveRebounds: number;
  defensiveRebounds: number;
  totalRebounds: number;

  // Other
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  personalFouls: number;

  // FIBA Appendix C - Additional Data
  pointsInPaint: number;
  fastBreakPoints: number;
  secondChancePoints: number;
  pointsOffTurnovers: number;
  benchPoints: number;

  // Game Flow
  largestLead: number;
  largestLeadTime: string; // When it occurred ("Q2 3:45")
  timeLeading: string; // Total time with lead
}

export interface GameFlowStats {
  scoreTiedCount: number; // Times score was tied (excluding 0-0)
  leadChanges: number; // Times lead changed teams
  largestScoringRun: {
    team: 'home' | 'away';
    teamName: string;
    points: number;
    startTime: string;
    endTime: string;
    period: Period;
  } | null;
  homeTeamLargestLead: {
    points: number;
    time: string;
    period: Period;
  };
  awayTeamLargestLead: {
    points: number;
    time: string;
    period: Period;
  };
}

export interface GameSummary {
  gameId: string;
  date: Date;
  venue?: string;
  status: GameStatus;

  homeTeam: TeamBoxScore;
  awayTeam: TeamBoxScore;
  homePlayers: PlayerBoxScore[];
  awayPlayers: PlayerBoxScore[];

  // Game Flow
  gameFlow: GameFlowStats;

  // Play-by-play
  totalPlays: number;
  playsByPeriod: Partial<Record<Period, number>>;
}

// ============================================
// Play-by-Play Filter Types
// ============================================

export interface PlayByPlayFilters {
  period?: Period;
  teamId?: string;
  playerId?: string;
  eventTypes?: EventType[];
}

export type ExportFormat = 'pdf' | 'csv' | 'json';
