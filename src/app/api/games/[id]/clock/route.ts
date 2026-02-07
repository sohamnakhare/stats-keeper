// Clock API Route - SSE for real-time clock sync and POST for clock control
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ============================================
// Types
// ============================================

interface ClockState {
  timeRemaining: number; // milliseconds
  isRunning: boolean;
  lastStartedAt: number | null; // timestamp in ms
  periodDuration: number; // milliseconds (default 10 min)
}

interface ClockAction {
  action: 'start' | 'pause' | 'reset' | 'set';
  time?: number; // For 'set' action - time in milliseconds
}

// ============================================
// Clock State Calculation
// ============================================

/**
 * Calculate the current time remaining based on server state
 * When clock is running: timeRemaining - (now - lastStartedAt)
 * When paused: timeRemaining as stored
 */
function calculateCurrentTime(state: ClockState): number {
  if (!state.isRunning || !state.lastStartedAt) {
    return state.timeRemaining;
  }

  const now = Date.now();
  const elapsed = now - state.lastStartedAt;
  const remaining = state.timeRemaining - elapsed;

  // Don't go below 0
  return Math.max(0, remaining);
}

// ============================================
// SSE Subscribers Management
// ============================================

// In-memory store for SSE subscribers per game
// In production, you'd use Redis pub/sub or similar
const subscribers = new Map<string, Set<(data: ClockState) => void>>();

function addSubscriber(gameId: string, callback: (data: ClockState) => void) {
  if (!subscribers.has(gameId)) {
    subscribers.set(gameId, new Set());
  }
  subscribers.get(gameId)!.add(callback);
}

function removeSubscriber(gameId: string, callback: (data: ClockState) => void) {
  const subs = subscribers.get(gameId);
  if (subs) {
    subs.delete(callback);
    if (subs.size === 0) {
      subscribers.delete(gameId);
    }
  }
}

function broadcastToSubscribers(gameId: string, state: ClockState) {
  const subs = subscribers.get(gameId);
  if (subs) {
    subs.forEach((callback) => callback(state));
  }
}

// ============================================
// GET - Server-Sent Events Stream
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;

  // Verify game exists
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial clock state
      const initialState: ClockState = {
        timeRemaining: game.clockTimeRemaining ?? game.periodDuration ?? 600000,
        isRunning: game.clockIsRunning ?? false,
        lastStartedAt: game.clockLastStartedAt?.getTime() ?? null,
        periodDuration: game.periodDuration ?? 600000,
      };

      const sendEvent = (data: ClockState) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial state
      sendEvent(initialState);

      // Subscribe to updates
      const callback = (data: ClockState) => {
        sendEvent(data);
      };

      addSubscriber(gameId, callback);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        removeSubscriber(gameId, callback);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ============================================
// POST - Clock Control Actions
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;

  try {
    const body: ClockAction = await request.json();

    // Get current game state
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const currentTimeRemaining = game.clockTimeRemaining ?? game.periodDuration ?? 600000;
    const periodDuration = game.periodDuration ?? 600000;
    const now = new Date();

    let newState: {
      clockTimeRemaining: number;
      clockIsRunning: boolean;
      clockLastStartedAt: Date | null;
    };

    switch (body.action) {
      case 'start': {
        // Calculate actual remaining time if clock was running
        let timeRemaining = currentTimeRemaining;
        if (game.clockIsRunning && game.clockLastStartedAt) {
          const elapsed = now.getTime() - game.clockLastStartedAt.getTime();
          timeRemaining = Math.max(0, currentTimeRemaining - elapsed);
        }

        // Don't start if time is 0
        if (timeRemaining <= 0) {
          return NextResponse.json(
            { error: 'Cannot start clock at 0:00' },
            { status: 400 }
          );
        }

        newState = {
          clockTimeRemaining: timeRemaining,
          clockIsRunning: true,
          clockLastStartedAt: now,
        };
        break;
      }

      case 'pause': {
        // Calculate actual remaining time
        let timeRemaining = currentTimeRemaining;
        if (game.clockIsRunning && game.clockLastStartedAt) {
          const elapsed = now.getTime() - game.clockLastStartedAt.getTime();
          timeRemaining = Math.max(0, currentTimeRemaining - elapsed);
        }

        newState = {
          clockTimeRemaining: timeRemaining,
          clockIsRunning: false,
          clockLastStartedAt: null,
        };
        break;
      }

      case 'reset': {
        newState = {
          clockTimeRemaining: periodDuration,
          clockIsRunning: false,
          clockLastStartedAt: null,
        };
        break;
      }

      case 'set': {
        if (typeof body.time !== 'number' || body.time < 0) {
          return NextResponse.json(
            { error: 'Invalid time value' },
            { status: 400 }
          );
        }

        newState = {
          clockTimeRemaining: body.time,
          clockIsRunning: false,
          clockLastStartedAt: null,
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update database
    await db
      .update(games)
      .set({
        clockTimeRemaining: newState.clockTimeRemaining,
        clockIsRunning: newState.clockIsRunning,
        clockLastStartedAt: newState.clockLastStartedAt,
        updatedAt: now,
      })
      .where(eq(games.id, gameId));

    // Broadcast to all subscribers
    const broadcastState: ClockState = {
      timeRemaining: newState.clockTimeRemaining,
      isRunning: newState.clockIsRunning,
      lastStartedAt: newState.clockLastStartedAt?.getTime() ?? null,
      periodDuration,
    };

    broadcastToSubscribers(gameId, broadcastState);

    return NextResponse.json({
      success: true,
      data: broadcastState,
    });
  } catch (error) {
    console.error('Clock control error:', error);
    return NextResponse.json(
      { error: 'Failed to update clock' },
      { status: 500 }
    );
  }
}
