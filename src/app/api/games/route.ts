// Games API - GET all games, POST create new game
import { NextResponse } from 'next/server';
import { db, games, teams, players, startingFive, periodScores } from '@/db';
import { desc, eq } from 'drizzle-orm';

// GET /api/games - List all games
export async function GET() {
  try {
    const allGames = await db
      .select()
      .from(games)
      .orderBy(desc(games.date));

    // Fetch teams for each game
    const gamesWithTeams = await Promise.all(
      allGames.map(async (game) => {
        const [homeTeam] = await db
          .select()
          .from(teams)
          .where(eq(teams.id, game.homeTeamId));
        
        const [awayTeam] = await db
          .select()
          .from(teams)
          .where(eq(teams.id, game.awayTeamId));

        return {
          ...game,
          homeTeam,
          awayTeam,
        };
      })
    );

    return NextResponse.json({ games: gamesWithTeams });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST /api/games - Create new game with teams and players
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { date, venue, homeTeam, awayTeam } = body;

    // Validate required fields
    if (!date || !homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: 'Missing required fields: date, homeTeam, awayTeam' },
        { status: 400 }
      );
    }

    const now = new Date();
    const gameId = crypto.randomUUID();

    // Step 1: Create home team
    const homeTeamId = crypto.randomUUID();
    await db.insert(teams).values({
      id: homeTeamId,
      name: homeTeam.name,
      shortName: homeTeam.shortName,
      color: homeTeam.color,
      createdAt: now,
    });

    // Step 2: Create home team players
    if (homeTeam.players?.length) {
      const homePlayerValues = homeTeam.players.map((player: {
        number: number;
        name: string;
        position?: string;
        isCaptain?: boolean;
      }) => ({
        id: crypto.randomUUID(),
        teamId: homeTeamId,
        number: player.number,
        name: player.name,
        position: player.position || null,
        isCaptain: player.isCaptain || false,
        isOnCourt: false,
      }));
      await db.insert(players).values(homePlayerValues);
    }

    // Step 3: Create away team
    const awayTeamId = crypto.randomUUID();
    await db.insert(teams).values({
      id: awayTeamId,
      name: awayTeam.name,
      shortName: awayTeam.shortName,
      color: awayTeam.color,
      createdAt: now,
    });

    // Step 4: Create away team players
    if (awayTeam.players?.length) {
      const awayPlayerValues = awayTeam.players.map((player: {
        number: number;
        name: string;
        position?: string;
        isCaptain?: boolean;
      }) => ({
        id: crypto.randomUUID(),
        teamId: awayTeamId,
        number: player.number,
        name: player.name,
        position: player.position || null,
        isCaptain: player.isCaptain || false,
        isOnCourt: false,
      }));
      await db.insert(players).values(awayPlayerValues);
    }

    // Step 5: Create game (must be before startingFive due to foreign key)
    await db.insert(games).values({
      id: gameId,
      homeTeamId,
      awayTeamId,
      date: new Date(date),
      venue: venue || null,
      status: 'scheduled',
      currentPeriod: 'Q1',
      currentPossession: null,
      possessionArrow: 'home',
      createdAt: now,
      updatedAt: now,
    });

    // Step 6: Create initial period scores
    const periods = ['Q1', 'Q2', 'Q3', 'Q4'];
    const periodValues = periods.map((period) => ({
      id: crypto.randomUUID(),
      gameId,
      period,
      homeScore: 0,
      awayScore: 0,
    }));
    await db.insert(periodScores).values(periodValues);

    // Type for starting five values
    type StarterValue = { id: string; gameId: string; teamId: string; playerId: string };

    // Step 7: Set starting five for home team (after game exists)
    if (homeTeam.startingFive?.length) {
      const homePlayers = await db
        .select()
        .from(players)
        .where(eq(players.teamId, homeTeamId));

      const homeStarterValues = homeTeam.startingFive
        .map((playerNumber: number) => {
          const player = homePlayers.find((p) => p.number === playerNumber);
          if (player) {
            return {
              id: crypto.randomUUID(),
              gameId,
              teamId: homeTeamId,
              playerId: player.id,
            };
          }
          return null;
        })
        .filter((v: StarterValue | null): v is StarterValue => v !== null);

      if (homeStarterValues.length) {
        await db.insert(startingFive).values(homeStarterValues);

        // Update isOnCourt for home team starters
        const homeStarterIds = homeStarterValues.map((s: StarterValue) => s.playerId);
        for (const playerId of homeStarterIds) {
          await db
            .update(players)
            .set({ isOnCourt: true })
            .where(eq(players.id, playerId));
        }
      }
    }

    // Step 8: Set starting five for away team (after game exists)
    if (awayTeam.startingFive?.length) {
      const awayPlayers = await db
        .select()
        .from(players)
        .where(eq(players.teamId, awayTeamId));

      const awayStarterValues = awayTeam.startingFive
        .map((playerNumber: number) => {
          const player = awayPlayers.find((p) => p.number === playerNumber);
          if (player) {
            return {
              id: crypto.randomUUID(),
              gameId,
              teamId: awayTeamId,
              playerId: player.id,
            };
          }
          return null;
        })
        .filter((v: StarterValue | null): v is StarterValue => v !== null);

      if (awayStarterValues.length) {
        await db.insert(startingFive).values(awayStarterValues);

        // Update isOnCourt for away team starters
        const awayStarterIds = awayStarterValues.map((s: StarterValue) => s.playerId);
        for (const playerId of awayStarterIds) {
          await db
            .update(players)
            .set({ isOnCourt: true })
            .where(eq(players.id, playerId));
        }
      }
    }

    return NextResponse.json({
      data: {
        id: gameId,
        homeTeamId,
        awayTeamId,
        date,
        venue,
        status: 'scheduled',
      },
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
