// Export API - Generate CSV/JSON exports for game statistics
import { NextResponse } from 'next/server';
import { db, games, teams, players, playEvents } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { calculateGameSummary } from '@/lib/stats-calculator';
import { generateExport } from '@/lib/export-generator';
import type { GameWithTeams, PlayEventResponse } from '@/services/game-api';
import type { ExportFormat, GameStatus, Period } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/games/[id]/summary/export?format=csv|json
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const format = (url.searchParams.get('format') || 'csv') as ExportFormat;

    // Validate format
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: csv, json' },
        { status: 400 }
      );
    }

    // Fetch game data
    const [game] = await db.select().from(games).where(eq(games.id, id));

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Fetch teams
    const [homeTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, game.homeTeamId));
    const [awayTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, game.awayTeamId));

    // Fetch players
    const homePlayers = await db
      .select()
      .from(players)
      .where(eq(players.teamId, game.homeTeamId));
    const awayPlayers = await db
      .select()
      .from(players)
      .where(eq(players.teamId, game.awayTeamId));

    // Fetch events
    const events = await db
      .select()
      .from(playEvents)
      .where(eq(playEvents.gameId, id))
      .orderBy(desc(playEvents.timestamp));

    // Parse event data
    const parsedEvents: PlayEventResponse[] = events.map((event) => ({
      ...event,
      timestamp: event.timestamp.toISOString(),
      eventData: event.eventData ? JSON.parse(event.eventData) : null,
    })) as PlayEventResponse[];

    // Construct game data
    const gameWithTeams: GameWithTeams = {
      id: game.id,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      date: game.date.toISOString(),
      venue: game.venue,
      status: game.status as GameStatus,
      currentPeriod: game.currentPeriod as Period,
      currentPossession: game.currentPossession as 'home' | 'away' | null,
      possessionArrow: game.possessionArrow as 'home' | 'away',
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
      homeTeam: {
        ...homeTeam,
        players: homePlayers.map((p) => ({
          ...p,
          position: p.position,
        })),
      },
      awayTeam: {
        ...awayTeam,
        players: awayPlayers.map((p) => ({
          ...p,
          position: p.position,
        })),
      },
    };

    // Calculate summary
    const summary = calculateGameSummary(gameWithTeams, parsedEvents);

    // Generate export
    const exportResult = generateExport(summary, { format });

    // Return file response
    return new NextResponse(exportResult.content, {
      status: 200,
      headers: {
        'Content-Type': exportResult.mimeType,
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}
