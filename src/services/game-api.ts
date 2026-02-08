// Game API Service - Client-side API wrapper for live scoring
import type { EventType, Period, GameStatus } from '@/types';

// ============================================
// Event Types
// ============================================

export interface EventData {
  // Field goal specific
  shotType?: string;
  shotZone?: string;
  points?: 2 | 3;
  assistedBy?: string;
  blockedBy?: string;
  isFastBreak?: boolean;
  isSecondChance?: boolean;
  isPaintPoints?: boolean;
  // Free throw specific
  freeThrowNumber?: number;
  totalFreeThrows?: number;
  // Rebound specific
  isTeamRebound?: boolean;
  followingEventId?: string;
  // Turnover specific
  turnoverType?: string;
  stolenBy?: string;
  // Assist specific
  scoringEventId?: string;
  scoringPlayerId?: string;
  // Steal specific
  turnoverEventId?: string;
  stolenFrom?: string;
  // Block specific
  shotEventId?: string;
  blockedPlayer?: string;
  // Foul specific
  foulType?: string;
  drawnBy?: string;
  freeThrowsAwarded?: number;
  isTeamFoul?: boolean;
  isFlagrant?: boolean;
  // Substitution specific
  playerIn?: string;
  playerOut?: string;
}

export interface PlayEventInput {
  period: Period;
  gameTime: string;
  teamId: string;
  playerId?: string;
  eventType: EventType;
  eventData?: EventData;
}

export interface PlayEventResponse {
  id: string;
  gameId: string;
  period: Period;
  gameTime: string;
  timestamp: string;
  teamId: string;
  playerId: string | null;
  eventType: EventType;
  eventData: EventData | null;
  /** Indicates the event is pending server confirmation (optimistic update) */
  isPending?: boolean;
}

// ============================================
// Optimistic Update Helpers
// ============================================

let tempIdCounter = 0;

/**
 * Generate a temporary ID for optimistic updates
 * These IDs are prefixed with 'temp_' to distinguish from server-generated UUIDs
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${++tempIdCounter}`;
}

/**
 * Check if an ID is a temporary (optimistic) ID
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

export interface GameUpdateInput {
  status?: GameStatus;
  currentPeriod?: Period;
  currentPossession?: 'home' | 'away' | null;
  possessionArrow?: 'home' | 'away';
}

// ============================================
// API Functions
// ============================================

/**
 * Load all events for a game
 */
export async function loadEvents(gameId: string): Promise<PlayEventResponse[]> {
  const response = await fetch(`/api/games/${gameId}/events`);

  if (!response.ok) {
    throw new Error('Failed to load events');
  }

  const data = await response.json();
  return data.events;
}

/**
 * Save a new event to the server
 */
export async function saveEvent(
  gameId: string,
  event: PlayEventInput
): Promise<PlayEventResponse> {
  const response = await fetch(`/api/games/${gameId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save event');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete an event (for undo functionality)
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Failed to delete event');
  }
}

/**
 * Update an event's data (for shot details, etc.)
 */
export async function updateEvent(
  eventId: string,
  eventData: Partial<EventData>
): Promise<PlayEventResponse> {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ eventData }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Event not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to update event');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update game state (period, possession, status)
 */
export async function updateGameState(
  gameId: string,
  updates: GameUpdateInput
): Promise<void> {
  const response = await fetch(`/api/games/${gameId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update game state');
  }
}

/**
 * Load full game data with teams and players
 */
export async function loadGame(gameId: string): Promise<GameWithTeams> {
  const response = await fetch(`/api/games/${gameId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Game not found');
    }
    throw new Error('Failed to load game');
  }

  const data = await response.json();
  return data.data;
}

// ============================================
// Response Types
// ============================================

export interface PlayerData {
  id: string;
  teamId: string;
  number: number;
  name: string;
  position: string | null;
  isCaptain: boolean;
  isOnCourt: boolean;
}

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  color: string;
  players: PlayerData[];
}

export interface GameWithTeams {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue: string | null;
  status: GameStatus;
  currentPeriod: Period;
  currentPossession: 'home' | 'away' | null;
  possessionArrow: 'home' | 'away';
  homeTeam: TeamData;
  awayTeam: TeamData;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Clock Types
// ============================================

export interface ClockState {
  timeRemaining: number; // milliseconds
  isRunning: boolean;
  lastStartedAt: number | null; // timestamp in ms
  periodDuration: number; // milliseconds
}

export type ClockAction = 'start' | 'pause' | 'reset' | 'set';

// ============================================
// Clock API Functions
// ============================================

/**
 * Control the game clock (start, pause, reset, or set time)
 */
export async function controlClock(
  gameId: string,
  action: ClockAction,
  time?: number
): Promise<ClockState> {
  const response = await fetch(`/api/games/${gameId}/clock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, time }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to control clock');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create an EventSource for clock SSE updates
 */
export function subscribeToClockUpdates(
  gameId: string,
  onUpdate: (state: ClockState) => void,
  onError?: (error: Event) => void
): EventSource {
  const eventSource = new EventSource(`/api/games/${gameId}/clock`);

  eventSource.onmessage = (event) => {
    try {
      const state: ClockState = JSON.parse(event.data);
      onUpdate(state);
    } catch (e) {
      console.error('Failed to parse clock state:', e);
    }
  };

  eventSource.onerror = (error) => {
    if (onError) {
      onError(error);
    }
  };

  return eventSource;
}
