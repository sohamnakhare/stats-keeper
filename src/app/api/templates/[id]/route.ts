// Saved Rosters API - GET, PUT, DELETE single roster
import { NextResponse } from 'next/server';
import { db, savedRosters } from '@/db';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/templates/[id] - Get single saved roster
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const [roster] = await db
      .select()
      .from(savedRosters)
      .where(eq(savedRosters.id, id));

    if (!roster) {
      return NextResponse.json(
        { error: 'Saved roster not found' },
        { status: 404 }
      );
    }

    // Update lastUsed timestamp
    await db
      .update(savedRosters)
      .set({ lastUsed: new Date() })
      .where(eq(savedRosters.id, id));

    return NextResponse.json({
      data: {
        ...roster,
        players: JSON.parse(roster.players),
      },
    });
  } catch (error) {
    console.error('Error fetching saved roster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved roster' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update saved roster
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { teamName, shortName, color, players } = body;

    // Check if roster exists
    const [existing] = await db
      .select()
      .from(savedRosters)
      .where(eq(savedRosters.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: 'Saved roster not found' },
        { status: 404 }
      );
    }

    // Validate shortName format if provided
    if (shortName && !/^[A-Z]{1,3}$/.test(shortName)) {
      return NextResponse.json(
        { error: 'Short name must be 1-3 uppercase letters' },
        { status: 400 }
      );
    }

    const updates: Partial<typeof savedRosters.$inferInsert> = {
      lastUsed: new Date(),
    };

    if (teamName) updates.teamName = teamName;
    if (shortName) updates.shortName = shortName;
    if (color) updates.color = color;
    if (players) updates.players = JSON.stringify(players);

    await db
      .update(savedRosters)
      .set(updates)
      .where(eq(savedRosters.id, id));

    // Fetch updated roster
    const [updated] = await db
      .select()
      .from(savedRosters)
      .where(eq(savedRosters.id, id));

    return NextResponse.json({
      data: {
        ...updated,
        players: JSON.parse(updated.players),
      },
    });
  } catch (error) {
    console.error('Error updating saved roster:', error);
    return NextResponse.json(
      { error: 'Failed to update saved roster' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete saved roster
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if roster exists
    const [existing] = await db
      .select()
      .from(savedRosters)
      .where(eq(savedRosters.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: 'Saved roster not found' },
        { status: 404 }
      );
    }

    await db
      .delete(savedRosters)
      .where(eq(savedRosters.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved roster:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved roster' },
      { status: 500 }
    );
  }
}
