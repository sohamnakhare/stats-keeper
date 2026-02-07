// Saved Rosters API - GET all rosters, POST create new roster
import { NextResponse } from 'next/server';
import { db, savedRosters } from '@/db';
import { desc } from 'drizzle-orm';

// GET /api/templates - List all saved rosters
export async function GET() {
  try {
    const rosters = await db
      .select()
      .from(savedRosters)
      .orderBy(desc(savedRosters.lastUsed));

    // Parse players JSON for each roster
    const parsedRosters = rosters.map((roster) => ({
      ...roster,
      players: JSON.parse(roster.players),
    }));

    return NextResponse.json({ rosters: parsedRosters });
  } catch (error) {
    console.error('Error fetching saved rosters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved rosters' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new saved roster
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { teamName, shortName, color, players } = body;

    // Validate required fields
    if (!teamName || !shortName || !color || !players) {
      return NextResponse.json(
        { error: 'Missing required fields: teamName, shortName, color, players' },
        { status: 400 }
      );
    }

    // Validate shortName format (1-3 uppercase letters)
    if (!/^[A-Z]{1,3}$/.test(shortName)) {
      return NextResponse.json(
        { error: 'Short name must be 1-3 uppercase letters' },
        { status: 400 }
      );
    }

    const now = new Date();
    const id = crypto.randomUUID();

    const newRoster = {
      id,
      teamName,
      shortName,
      color,
      players: JSON.stringify(players),
      createdAt: now,
      lastUsed: now,
    };

    await db.insert(savedRosters).values(newRoster);

    return NextResponse.json({
      data: {
        ...newRoster,
        players, // Return parsed version
      },
    });
  } catch (error) {
    console.error('Error creating saved roster:', error);
    return NextResponse.json(
      { error: 'Failed to create saved roster' },
      { status: 500 }
    );
  }
}
