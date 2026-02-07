// Single Event API - DELETE for undo functionality
import { NextResponse } from 'next/server';
import { db, playEvents, players } from '@/db';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/events/[id] - Delete a single event (undo)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if event exists
    const [event] = await db
      .select()
      .from(playEvents)
      .where(eq(playEvents.id, id));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Handle substitution events - reverse the isOnCourt changes
    if (event.eventType === 'substitution' && event.eventData) {
      const eventData = JSON.parse(event.eventData);
      const { playerIn, playerOut } = eventData;

      if (playerIn && playerOut) {
        // Reverse the substitution: playerOut goes back on court, playerIn goes back to bench
        await db
          .update(players)
          .set({ isOnCourt: true })
          .where(eq(players.id, playerOut));

        await db
          .update(players)
          .set({ isOnCourt: false })
          .where(eq(players.id, playerIn));
      }
    }

    // Delete the event
    await db.delete(playEvents).where(eq(playEvents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Update event data (for shot details, etc.)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if event exists
    const [event] = await db
      .select()
      .from(playEvents)
      .where(eq(playEvents.id, id));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Merge existing eventData with new data
    const existingData = event.eventData ? JSON.parse(event.eventData) : {};
    const updatedData = {
      ...existingData,
      ...body.eventData,
    };

    // Update the event
    await db
      .update(playEvents)
      .set({ eventData: JSON.stringify(updatedData) })
      .where(eq(playEvents.id, id));

    // Fetch the updated event
    const [updatedEvent] = await db
      .select()
      .from(playEvents)
      .where(eq(playEvents.id, id));

    return NextResponse.json({
      data: {
        ...updatedEvent,
        eventData: updatedEvent.eventData ? JSON.parse(updatedEvent.eventData) : null,
      },
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id] - Get a single event
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [event] = await db
      .select()
      .from(playEvents)
      .where(eq(playEvents.id, id));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...event,
        eventData: event.eventData ? JSON.parse(event.eventData) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
