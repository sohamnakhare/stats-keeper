// Games Service - Client-side API wrapper

const API_BASE = '/api/games';

interface TeamData {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

interface GameData {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue?: string;
  status: string;
  currentPeriod: string;
  homeTeam?: TeamData;
  awayTeam?: TeamData;
  createdAt: string;
  updatedAt: string;
}

interface CreateGameInput {
  date: Date | string;
  venue?: string;
  homeTeam: {
    name: string;
    shortName: string;
    color: string;
    players: Array<{
      number: number;
      name: string;
      position?: string;
      isCaptain?: boolean;
    }>;
    startingFive: number[]; // Jersey numbers
  };
  awayTeam: {
    name: string;
    shortName: string;
    color: string;
    players: Array<{
      number: number;
      name: string;
      position?: string;
      isCaptain?: boolean;
    }>;
    startingFive: number[]; // Jersey numbers
  };
}

interface CreateGameResponse {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  venue?: string;
  status: string;
}

/**
 * Fetch all games
 */
export async function loadGames(): Promise<GameData[]> {
  const response = await fetch(API_BASE);
  
  if (!response.ok) {
    throw new Error('Failed to load games');
  }

  const data = await response.json();
  return data.games;
}

/**
 * Get a single game by ID
 */
export async function getGame(id: string): Promise<GameData> {
  const response = await fetch(`${API_BASE}/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Game not found');
    }
    throw new Error('Failed to get game');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create a new game with teams and rosters
 */
export async function createGame(input: CreateGameInput): Promise<CreateGameResponse> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      date: input.date instanceof Date ? input.date.toISOString() : input.date,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create game');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete a game
 */
export async function deleteGame(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Game not found');
    }
    throw new Error('Failed to delete game');
  }
}
