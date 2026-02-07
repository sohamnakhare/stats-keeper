// Events API - GET all events, POST new event for a game
import { NextResponse } from 'next/server';
import { db, playEvents, players } from '@/db';
import { eq, desc } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/games/[id]/events - Get all events for a game
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id: gameId } = await params;

    const events = await db
      .select()
      .from(playEvents)
      .where(eq(playEvents.gameId, gameId))
      .orderBy(desc(playEvents.timestamp));

    // Parse eventData JSON for each event
    const parsedEvents = events.map((event) => ({
      ...event,
      eventData: event.eventData ? JSON.parse(event.eventData) : null,
    }));

    return NextResponse.json({ events: parsedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/events - Create new event
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: gameId } = await params;
    const body = await request.json();

    const {
      period,
      gameTime,
      teamId,
      playerId,
      eventType,
      eventData,
    } = body;

    // Validate required fields
    if (!period || !gameTime || !teamId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: period, gameTime, teamId, eventType' },
        { status: 400 }
      );
    }

    // Handle substitution events - update player isOnCourt status
    if (eventType === 'substitution') {
      const { playerIn, playerOut } = eventData || {};

      if (!playerIn || !playerOut) {
        return NextResponse.json(
          { error: 'Substitution requires playerIn and playerOut' },
          { status: 400 }
        );
      }

      // Update playerOut: set isOnCourt = false
      await db
        .update(players)
        .set({ isOnCourt: false })
        .where(eq(players.id, playerOut));

      // Update playerIn: set isOnCourt = true
      await db
        .update(players)
        .set({ isOnCourt: true })
        .where(eq(players.id, playerIn));
    }

    const newEvent = {
      id: crypto.randomUUID(),
      gameId,
      period,
      gameTime,
      timestamp: new Date(),
      teamId,
      playerId: playerId || null,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : null,
    };

    await db.insert(playEvents).values(newEvent);

    // For substitution events, return updated player info
    const response: {
      data: typeof newEvent & { eventData: unknown };
      updatedPlayers?: { playerIn: string; playerOut: string };
    } = {
      data: {
        ...newEvent,
        eventData: eventData || null,
      },
    };

    if (eventType === 'substitution') {
      response.updatedPlayers = {
        playerIn: eventData.playerIn,
        playerOut: eventData.playerOut,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
