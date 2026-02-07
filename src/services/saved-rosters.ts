// Saved Rosters Service - Client-side API wrapper
import type { SavedRoster, SavedRosterPlayer } from '@/types';

const API_BASE = '/api/templates';

/**
 * Fetch all saved rosters, sorted by most recently used
 */
export async function loadSavedRosters(): Promise<SavedRoster[]> {
  const response = await fetch(API_BASE);
  
  if (!response.ok) {
    throw new Error('Failed to load saved rosters');
  }

  const data = await response.json();
  return data.rosters;
}

/**
 * Get a single saved roster by ID (also updates lastUsed timestamp)
 */
export async function getSavedRoster(id: string): Promise<SavedRoster> {
  const response = await fetch(`${API_BASE}/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Saved roster not found');
    }
    throw new Error('Failed to get saved roster');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Save a new roster
 */
export async function saveRoster(roster: {
  teamName: string;
  shortName: string;
  color: string;
  players: SavedRosterPlayer[];
}): Promise<SavedRoster> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roster),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save roster');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update an existing saved roster
 */
export async function updateSavedRoster(
  id: string,
  updates: Partial<{
    teamName: string;
    shortName: string;
    color: string;
    players: SavedRosterPlayer[];
  }>
): Promise<SavedRoster> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update saved roster');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete a saved roster
 */
export async function deleteSavedRoster(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Saved roster not found');
    }
    throw new Error('Failed to delete saved roster');
  }
}

/**
 * Convert a saved roster to player input format for use in game setup
 */
export function rosterToPlayerInputs(roster: SavedRoster): Array<{
  number: number;
  name: string;
  position?: string;
  isCaptain: boolean;
  isStarter: boolean;
}> {
  return roster.players.map((player, index) => ({
    number: player.number,
    name: player.name,
    position: player.position,
    isCaptain: player.isCaptain,
    isStarter: index < 5, // First 5 players are starters by default
  }));
}
