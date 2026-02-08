'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { EventType, Period } from '@/types';
import {
  loadGame,
  loadEvents,
  saveEvent,
  deleteEvent,
  updateEvent as updateEventApi,
  updateGameState,
  type GameWithTeams,
  type PlayEventResponse,
  type PlayEventInput,
  type PlayerData,
  type EventData,
} from '@/services/game-api';

// ============================================
// Types
// ============================================

export interface LiveGameState {
  game: GameWithTeams | null;
  events: PlayEventResponse[];
  selectedPlayerId: string | null;
  selectedTeam: 'home' | 'away' | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export interface ComputedStats {
  homeScore: number;
  awayScore: number;
  lastEvent: PlayEventResponse | null;
  isUndoAvailable: boolean;
}

export interface QuickStatInput {
  statType: 'shot' | 'rebound' | 'assist' | 'steal' | 'block' | 'turnover' | 'foul' | 'free_throw';
  made?: boolean;
  points?: 2 | 3;
  // Free throw specific
  freeThrowNumber?: number;
  totalFreeThrows?: number;
  // Turnover specific
  turnoverType?: string;
  // Foul specific
  foulType?: string;
  drawnBy?: string; // Player ID who drew the foul (was fouled on)
}

// ============================================
// Score Computation
// ============================================

function computeScores(events: PlayEventResponse[], game: GameWithTeams | null) {
  if (!game) return { homeScore: 0, awayScore: 0 };

  let homeScore = 0;
  let awayScore = 0;

  for (const event of events) {
    const isHomeTeam = event.teamId === game.homeTeamId;

    if (event.eventType === 'field_goal_made') {
      const points = event.eventData?.points || 2;
      if (isHomeTeam) {
        homeScore += points;
      } else {
        awayScore += points;
      }
    } else if (event.eventType === 'free_throw_made') {
      if (isHomeTeam) {
        homeScore += 1;
      } else {
        awayScore += 1;
      }
    }
  }

  return { homeScore, awayScore };
}

// ============================================
// Hook
// ============================================

export function useLiveGame(gameId: string, clockDisplayTime?: string) {
  // Use provided clock time or default to "10:00"
  const gameTime = clockDisplayTime ?? '10:00';
  // State
  const [state, setState] = useState<LiveGameState>({
    game: null,
    events: [],
    selectedPlayerId: null,
    selectedTeam: null,
    isLoading: true,
    error: null,
    isSaving: false,
  });

  // Load game and events on mount
  useEffect(() => {
    async function load() {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const [game, events] = await Promise.all([
          loadGame(gameId),
          loadEvents(gameId),
        ]);

        // Update game status to in_progress if scheduled
        if (game.status === 'scheduled') {
          await updateGameState(gameId, { status: 'in_progress' });
          game.status = 'in_progress';
        }

        setState((prev) => ({
          ...prev,
          game,
          events,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load game',
        }));
      }
    }

    load();
  }, [gameId]);

  // Computed values
  const computed = useMemo<ComputedStats>(() => {
    const { homeScore, awayScore } = computeScores(state.events, state.game);
    const sortedEvents = [...state.events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastEvent = sortedEvents[0] || null;

    return {
      homeScore,
      awayScore,
      lastEvent,
      isUndoAvailable: lastEvent !== null,
    };
  }, [state.events, state.game]);

  // Get selected player data
  const selectedPlayer = useMemo<PlayerData | null>(() => {
    if (!state.game || !state.selectedPlayerId) return null;

    const allPlayers = [
      ...state.game.homeTeam.players,
      ...state.game.awayTeam.players,
    ];

    return allPlayers.find((p) => p.id === state.selectedPlayerId) || null;
  }, [state.game, state.selectedPlayerId]);

  // Select a player
  const selectPlayer = useCallback((playerId: string, team: 'home' | 'away') => {
    setState((prev) => ({
      ...prev,
      selectedPlayerId: prev.selectedPlayerId === playerId ? null : playerId,
      selectedTeam: prev.selectedPlayerId === playerId ? null : team,
    }));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedPlayerId: null,
      selectedTeam: null,
    }));
  }, []);

  // Record a stat - returns the saved event for shot toast functionality
  const recordStat = useCallback(
    async (input: QuickStatInput): Promise<PlayEventResponse | null> => {
      if (!state.game || !state.selectedPlayerId || !state.selectedTeam) {
        return null;
      }

      const teamId =
        state.selectedTeam === 'home'
          ? state.game.homeTeamId
          : state.game.awayTeamId;

      let eventType: EventType;
      let eventData: EventData = {};

      switch (input.statType) {
        case 'shot':
          eventType = input.made ? 'field_goal_made' : 'field_goal_missed';
          eventData = {
            points: input.points || 2,
            shotZone: input.points === 3 ? 'three_point' : 'mid_range',
          };
          break;
        case 'free_throw':
          eventType = input.made ? 'free_throw_made' : 'free_throw_missed';
          eventData = {
            freeThrowNumber: input.freeThrowNumber || 1,
            totalFreeThrows: input.totalFreeThrows || 1,
          };
          break;
        case 'rebound':
          // Determine offensive/defensive based on last event
          const lastShot = state.events.find(
            (e) =>
              e.eventType === 'field_goal_missed' ||
              e.eventType === 'free_throw_missed'
          );
          const isOffensive =
            lastShot && lastShot.teamId === teamId;
          eventType = isOffensive ? 'offensive_rebound' : 'defensive_rebound';
          eventData = {
            followingEventId: lastShot?.id,
          };
          break;
        case 'assist':
          eventType = 'assist';
          break;
        case 'steal':
          eventType = 'steal';
          break;
        case 'block':
          eventType = 'block';
          break;
        case 'turnover':
          eventType = 'turnover';
          eventData = {
            turnoverType: input.turnoverType || 'other',
          };
          break;
        case 'foul':
          eventType = 'foul';
          eventData = {
            foulType: input.foulType || 'personal',
            isTeamFoul: true,
            drawnBy: input.drawnBy,
          };
          break;
        default:
          return null;
      }

      const eventInput: PlayEventInput = {
        period: state.game.currentPeriod as Period,
        gameTime, // Use actual clock time
        teamId,
        playerId: state.selectedPlayerId,
        eventType,
        eventData,
      };

      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        const savedEvent = await saveEvent(gameId, eventInput);

        setState((prev) => ({
          ...prev,
          events: [savedEvent, ...prev.events],
          isSaving: false,
          selectedPlayerId: null,
          selectedTeam: null,
        }));

        return savedEvent;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to save stat',
        }));
        return null;
      }
    },
    [gameId, state.game, state.selectedPlayerId, state.selectedTeam, state.events, gameTime]
  );

  // Record a substitution
  const recordSubstitution = useCallback(
    async (playerOutId: string, playerInId: string) => {
      if (!state.game || !state.selectedTeam) {
        return;
      }

      const teamId =
        state.selectedTeam === 'home'
          ? state.game.homeTeamId
          : state.game.awayTeamId;

      const eventInput: PlayEventInput = {
        period: state.game.currentPeriod as Period,
        gameTime, // Use actual clock time
        teamId,
        playerId: playerOutId, // The player going out is the "primary" player
        eventType: 'substitution',
        eventData: {
          playerOut: playerOutId,
          playerIn: playerInId,
        },
      };

      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        const savedEvent = await saveEvent(gameId, eventInput);

        // Update local state to reflect the substitution
        setState((prev) => {
          if (!prev.game) return { ...prev, isSaving: false };

          const updatePlayers = (players: PlayerData[]) =>
            players.map((p) => {
              if (p.id === playerOutId) {
                return { ...p, isOnCourt: false };
              }
              if (p.id === playerInId) {
                return { ...p, isOnCourt: true };
              }
              return p;
            });

          return {
            ...prev,
            events: [savedEvent, ...prev.events],
            game: {
              ...prev.game,
              homeTeam: {
                ...prev.game.homeTeam,
                players: updatePlayers(prev.game.homeTeam.players),
              },
              awayTeam: {
                ...prev.game.awayTeam,
                players: updatePlayers(prev.game.awayTeam.players),
              },
            },
            isSaving: false,
            selectedPlayerId: null,
            selectedTeam: null,
          };
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to record substitution',
        }));
      }
    },
    [gameId, state.game, state.selectedTeam, gameTime]
  );

  // Undo last action
  const undoLastAction = useCallback(async () => {
    if (!computed.lastEvent) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      await deleteEvent(computed.lastEvent.id);

      // Handle substitution undo - reverse the isOnCourt changes locally
      if (computed.lastEvent.eventType === 'substitution' && computed.lastEvent.eventData) {
        const { playerOut, playerIn } = computed.lastEvent.eventData;

        setState((prev) => {
          if (!prev.game) return { ...prev, isSaving: false };

          const updatePlayers = (players: PlayerData[]) =>
            players.map((p) => {
              if (p.id === playerOut) {
                return { ...p, isOnCourt: true }; // Back on court
              }
              if (p.id === playerIn) {
                return { ...p, isOnCourt: false }; // Back to bench
              }
              return p;
            });

          return {
            ...prev,
            events: prev.events.filter((e) => e.id !== computed.lastEvent?.id),
            game: {
              ...prev.game,
              homeTeam: {
                ...prev.game.homeTeam,
                players: updatePlayers(prev.game.homeTeam.players),
              },
              awayTeam: {
                ...prev.game.awayTeam,
                players: updatePlayers(prev.game.awayTeam.players),
              },
            },
            isSaving: false,
          };
        });
      } else {
        setState((prev) => ({
          ...prev,
          events: prev.events.filter((e) => e.id !== computed.lastEvent?.id),
          isSaving: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to undo',
      }));
    }
  }, [computed.lastEvent]);

  // Update period
  const updatePeriod = useCallback(
    async (period: Period) => {
      if (!state.game) return;

      try {
        await updateGameState(gameId, { currentPeriod: period });

        setState((prev) => ({
          ...prev,
          game: prev.game ? { ...prev.game, currentPeriod: period } : null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to update period',
        }));
      }
    },
    [gameId, state.game]
  );

  // Update possession
  const updatePossession = useCallback(
    async (possession: 'home' | 'away' | null) => {
      if (!state.game) return;

      try {
        await updateGameState(gameId, { currentPossession: possession });

        setState((prev) => ({
          ...prev,
          game: prev.game
            ? { ...prev.game, currentPossession: possession }
            : null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Failed to update possession',
        }));
      }
    },
    [gameId, state.game]
  );

  // Update event data (for shot details, etc.)
  const updateEvent = useCallback(
    async (eventId: string, eventData: Partial<EventData>) => {
      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        const updatedEvent = await updateEventApi(eventId, eventData);

        setState((prev) => ({
          ...prev,
          events: prev.events.map((e) =>
            e.id === eventId ? updatedEvent : e
          ),
          isSaving: false,
        }));

        return updatedEvent;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to update event',
        }));
        return null;
      }
    },
    []
  );

  return {
    // State
    game: state.game,
    events: state.events,
    selectedPlayerId: state.selectedPlayerId,
    selectedTeam: state.selectedTeam,
    selectedPlayer,
    isLoading: state.isLoading,
    error: state.error,
    isSaving: state.isSaving,

    // Computed
    homeScore: computed.homeScore,
    awayScore: computed.awayScore,
    lastEvent: computed.lastEvent,
    isUndoAvailable: computed.isUndoAvailable,

    // Actions
    selectPlayer,
    clearSelection,
    recordStat,
    recordSubstitution,
    undoLastAction,
    updatePeriod,
    updatePossession,
    updateEvent,
  };
}
