// Games API - GET, PATCH, DELETE single game
import { NextResponse } from 'next/server';
import { db, games, teams, players, startingFive, periodScores, playEvents } from '@/db';
import { eq } from 'drizzle-orm';
import type { GameStatus, Period } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/games/[id] - Get single game
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id));

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
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

    return NextResponse.json({
      data: {
        ...game,
        homeTeam: { ...homeTeam, players: homePlayers },
        awayTeam: { ...awayTeam, players: awayPlayers },
      },
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// DELETE /api/games/[id] - Delete game and related data
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if game exists
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id));

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Delete in order to respect foreign key constraints
    // 1. Delete play events
    await db.delete(playEvents).where(eq(playEvents.gameId, id));
    
    // 2. Delete starting five
    await db.delete(startingFive).where(eq(startingFive.gameId, id));
    
    // 3. Delete period scores
    await db.delete(periodScores).where(eq(periodScores.gameId, id));
    
    // 4. Delete players for both teams
    await db.delete(players).where(eq(players.teamId, game.homeTeamId));
    await db.delete(players).where(eq(players.teamId, game.awayTeamId));
    
    // 5. Delete the game
    await db.delete(games).where(eq(games.id, id));
    
    // 6. Delete teams
    await db.delete(teams).where(eq(teams.id, game.homeTeamId));
    await db.delete(teams).where(eq(teams.id, game.awayTeamId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}

// PATCH /api/games/[id] - Update game state (period, possession, status)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if game exists
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id));

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: Partial<{
      status: GameStatus;
      currentPeriod: Period;
      currentPossession: 'home' | 'away' | null;
      possessionArrow: 'home' | 'away';
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) {
      updates.status = body.status;
    }
    if (body.currentPeriod !== undefined) {
      updates.currentPeriod = body.currentPeriod;
    }
    if (body.currentPossession !== undefined) {
      updates.currentPossession = body.currentPossession;
    }
    if (body.possessionArrow !== undefined) {
      updates.possessionArrow = body.possessionArrow;
    }

    // Update the game
    await db
      .update(games)
      .set(updates)
      .where(eq(games.id, id));

    // Fetch updated game
    const [updatedGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, id));

    return NextResponse.json({ data: updatedGame });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}
