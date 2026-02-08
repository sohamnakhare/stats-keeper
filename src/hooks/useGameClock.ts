'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToClockUpdates,
  controlClock,
  type ClockState,
  type ClockAction,
} from '@/services/game-api';

// ============================================
// Types
// ============================================

export interface UseGameClockOptions {
  onClockZero?: () => void;
}

export interface UseGameClockReturn {
  // Display state
  timeRemaining: number; // milliseconds
  displayTime: string; // "MM:SS" format
  isRunning: boolean;
  periodDuration: number;

  // Connection state
  isConnected: boolean;
  error: string | null;

  // Actions
  start: () => Promise<void>;
  pause: () => Promise<void>;
  reset: () => Promise<void>;
  setTime: (milliseconds: number) => Promise<void>;
}

// ============================================
// Helpers
// ============================================

/**
 * Format milliseconds to MM:SS display
 */
export function formatClockTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse MM:SS string to milliseconds
 */
export function parseClockTime(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return (minutes * 60 + seconds) * 1000;
}

/**
 * Calculate current time based on server state
 */
function calculateCurrentTime(state: ClockState): number {
  if (!state.isRunning || !state.lastStartedAt) {
    return state.timeRemaining;
  }

  const now = Date.now();
  const elapsed = now - state.lastStartedAt;
  return Math.max(0, state.timeRemaining - elapsed);
}

// ============================================
// Hook
// ============================================

export function useGameClock(gameId: string, options?: UseGameClockOptions): UseGameClockReturn {
  const { onClockZero } = options ?? {};

  // Server state (from SSE)
  const [serverState, setServerState] = useState<ClockState | null>(null);

  // Local display state (updated every frame when running)
  const [displayTimeMs, setDisplayTimeMs] = useState<number>(600000); // 10 min default

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for animation frame and tracking clock zero
  const animationFrameRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasTriggeredZeroRef = useRef(false);
  const onClockZeroRef = useRef(onClockZero);

  // Keep callback ref updated
  useEffect(() => {
    onClockZeroRef.current = onClockZero;
  }, [onClockZero]);

  // Subscribe to SSE updates
  useEffect(() => {
    const eventSource = subscribeToClockUpdates(
      gameId,
      (state) => {
        setServerState(state);
        const currentTime = calculateCurrentTime(state);
        setDisplayTimeMs(currentTime);
        setIsConnected(true);
        setError(null);

        // Reset the zero trigger if clock is reset (time > 0)
        if (currentTime > 0) {
          hasTriggeredZeroRef.current = false;
        }
      },
      () => {
        setIsConnected(false);
        setError('Connection lost. Reconnecting...');
      }
    );

    eventSourceRef.current = eventSource;

    // Handle reconnection
    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [gameId]);

  // Local countdown animation when clock is running
  useEffect(() => {
    if (!serverState?.isRunning || !serverState.lastStartedAt) {
      // Cancel animation if clock is not running
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateDisplay = () => {
      const currentTime = calculateCurrentTime(serverState);
      setDisplayTimeMs(currentTime);

      // Trigger onClockZero callback when reaching 0 (only once per reset)
      if (currentTime <= 0 && !hasTriggeredZeroRef.current) {
        hasTriggeredZeroRef.current = true;
        onClockZeroRef.current?.();
        return;
      }

      // Auto-pause when reaching 0
      if (currentTime <= 0) {
        // Server will handle the actual pause
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateDisplay);
    };

    animationFrameRef.current = requestAnimationFrame(updateDisplay);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [serverState]);

  // Clock control actions with optimistic updates
  // The SSE stream will reconcile the authoritative state from the server
  
  const start = useCallback(async () => {
    if (!serverState) return;
    
    // Store previous state for rollback
    const previousState = serverState;
    const now = Date.now();
    
    // Optimistic update: start clock immediately
    setServerState((prev) =>
      prev ? { ...prev, isRunning: true, lastStartedAt: now } : null
    );
    setError(null);

    try {
      await controlClock(gameId, 'start');
      // SSE will sync the authoritative state
    } catch (e) {
      // Rollback on failure
      setServerState(previousState);
      setError(e instanceof Error ? e.message : 'Failed to start clock');
    }
  }, [gameId, serverState]);

  const pause = useCallback(async () => {
    if (!serverState) return;
    
    // Store previous state for rollback
    const previousState = serverState;
    
    // Calculate the current time remaining at pause
    const currentTime = calculateCurrentTime(serverState);
    
    // Optimistic update: pause clock immediately
    setServerState((prev) =>
      prev
        ? { ...prev, isRunning: false, lastStartedAt: null, timeRemaining: currentTime }
        : null
    );
    setDisplayTimeMs(currentTime);
    setError(null);

    try {
      await controlClock(gameId, 'pause');
      // SSE will sync the authoritative state
    } catch (e) {
      // Rollback on failure
      setServerState(previousState);
      setError(e instanceof Error ? e.message : 'Failed to pause clock');
    }
  }, [gameId, serverState]);

  const reset = useCallback(async () => {
    if (!serverState) return;
    
    // Store previous state for rollback
    const previousState = serverState;
    const periodDuration = serverState.periodDuration;
    
    // Reset the zero trigger
    hasTriggeredZeroRef.current = false;
    
    // Optimistic update: reset clock immediately
    setServerState((prev) =>
      prev
        ? { ...prev, isRunning: false, lastStartedAt: null, timeRemaining: periodDuration }
        : null
    );
    setDisplayTimeMs(periodDuration);
    setError(null);

    try {
      await controlClock(gameId, 'reset');
      // SSE will sync the authoritative state
    } catch (e) {
      // Rollback on failure
      setServerState(previousState);
      setError(e instanceof Error ? e.message : 'Failed to reset clock');
    }
  }, [gameId, serverState]);

  const setTime = useCallback(
    async (milliseconds: number) => {
      if (!serverState) return;
      
      // Store previous state for rollback
      const previousState = serverState;
      
      // Reset the zero trigger if setting to non-zero
      if (milliseconds > 0) {
        hasTriggeredZeroRef.current = false;
      }
      
      // Optimistic update: set time immediately
      setServerState((prev) =>
        prev
          ? { ...prev, isRunning: false, lastStartedAt: null, timeRemaining: milliseconds }
          : null
      );
      setDisplayTimeMs(milliseconds);
      setError(null);

      try {
        await controlClock(gameId, 'set', milliseconds);
        // SSE will sync the authoritative state
      } catch (e) {
        // Rollback on failure
        setServerState(previousState);
        setError(e instanceof Error ? e.message : 'Failed to set clock time');
      }
    },
    [gameId, serverState]
  );

  return {
    // Display state
    timeRemaining: displayTimeMs,
    displayTime: formatClockTime(displayTimeMs),
    isRunning: serverState?.isRunning ?? false,
    periodDuration: serverState?.periodDuration ?? 600000,

    // Connection state
    isConnected,
    error,

    // Actions
    start,
    pause,
    reset,
    setTime,
  };
}
