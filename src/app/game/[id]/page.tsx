'use client';

import { use, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLiveGame } from '@/hooks/useLiveGame';
import { useGameClock } from '@/hooks/useGameClock';
import {
  ScoreHeader,
  TeamPanel,
  QuickStatPanel,
  PlayByPlayFeed,
  FreeThrowModal,
  TurnoverTypeModal,
  FoulTypeModal,
  SubstitutionModal,
  ShotTypeModal,
  MobileTeamTabs,
  MobilePlayerGrid,
  MobileStatModal,
  type TurnoverType,
  type FoulType,
  type ShotDetails,
} from '@/components/live-scoring';
import type { PlayEventResponse } from '@/services/game-api';
import { Button } from '@/components/ui';

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { id } = use(params);

  // Game clock hook
  const clock = useGameClock(id);

  const {
    game,
    events,
    selectedPlayerId,
    selectedTeam,
    selectedPlayer,
    isLoading,
    error,
    isSaving,
    homeScore,
    awayScore,
    lastEvent,
    isUndoAvailable,
    selectPlayer,
    recordStat,
    recordSubstitution,
    undoLastAction,
    updatePossession,
    updateEvent,
  } = useLiveGame(id, clock.displayTime);

  // Modal states
  const [showFreeThrowModal, setShowFreeThrowModal] = useState(false);
  const [showTurnoverModal, setShowTurnoverModal] = useState(false);
  const [showFoulModal, setShowFoulModal] = useState(false);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [showShotTypeModal, setShowShotTypeModal] = useState(false);
  const [shotEventForDetails, setShotEventForDetails] = useState<PlayEventResponse | null>(null);
  const [shotTeamId, setShotTeamId] = useState<string | null>(null);

  // Mobile-specific states
  const [mobileActiveTeam, setMobileActiveTeam] = useState<'home' | 'away'>('home');
  const [showMobileStatModal, setShowMobileStatModal] = useState(false);

  // Toast state for shot details prompt
  const [showShotToast, setShowShotToast] = useState(false);
  const [toastEventId, setToastEventId] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (showShotToast) {
      toastTimeoutRef.current = setTimeout(() => {
        setShowShotToast(false);
        setToastEventId(null);
      }, 3000);
    }
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [showShotToast]);

  // Handle shot toast click - open modal
  const handleShotToastClick = useCallback(() => {
    if (toastEventId) {
      const event = events.find((e) => e.id === toastEventId);
      if (event) {
        setShotEventForDetails(event);
        // shotTeamId is already set from handleStatRecord
        setShowShotTypeModal(true);
      }
    }
    setShowShotToast(false);
    setToastEventId(null);
  }, [toastEventId, events]);

  // Handle shot details save
  const handleShotDetailsSave = useCallback(
    async (eventId: string, details: ShotDetails) => {
      await updateEvent(eventId, {
        shotType: details.shotType,
        isFastBreak: details.isFastBreak,
        isSecondChance: details.isSecondChance,
        assistedBy: details.assistedBy,
      });
      setShowShotTypeModal(false);
      setShotEventForDetails(null);
      setShotTeamId(null);
    },
    [updateEvent]
  );

  // Wrapped recordStat that shows shot details toast for all shots
  const handleStatRecord = useCallback(
    async (stat: Parameters<typeof recordStat>[0]) => {
      // Capture the team info before recording (since selection gets cleared)
      const scorerTeam = selectedTeam;
      const scorerTeamId = scorerTeam === 'home' ? game?.homeTeamId : game?.awayTeamId;
      
      const savedEvent = await recordStat(stat);
      
      // For all shots, show the shot details toast
      if (savedEvent && stat.statType === 'shot') {
        setToastEventId(savedEvent.id);
        setShotTeamId(scorerTeamId || null);
        setShowShotToast(true);
      }
    },
    [recordStat, selectedTeam, game?.homeTeamId, game?.awayTeamId]
  );

  // Handle event tap from play-by-play (for editing shots)
  const handleEventTap = useCallback((event: PlayEventResponse) => {
    // Only allow editing shot events
    if (event.eventType === 'field_goal_made' || event.eventType === 'field_goal_missed') {
      setShotEventForDetails(event);
      setShotTeamId(event.teamId);
      setShowShotTypeModal(true);
    }
  }, []);

  // Handle mobile player selection - opens stat modal
  const handleMobilePlayerSelect = useCallback((playerId: string) => {
    selectPlayer(playerId, mobileActiveTeam);
    setShowMobileStatModal(true);
  }, [selectPlayer, mobileActiveTeam]);

  // Handle mobile stat modal close
  const handleMobileStatModalClose = useCallback(() => {
    setShowMobileStatModal(false);
    // Don't clear selection immediately to allow for follow-up modals
  }, []);

  // Handle free throw completion
  const handleFreeThrowComplete = useCallback(
    async (results: boolean[]) => {
      for (let i = 0; i < results.length; i++) {
        await recordStat({
          statType: 'free_throw',
          made: results[i],
          freeThrowNumber: i + 1,
          totalFreeThrows: results.length,
        });
      }
      setShowFreeThrowModal(false);
    },
    [recordStat]
  );

  // Handle turnover type selection
  const handleTurnoverSelect = useCallback(
    (type: TurnoverType) => {
      recordStat({ statType: 'turnover', turnoverType: type });
      setShowTurnoverModal(false);
    },
    [recordStat]
  );

  // Handle foul type selection
  const handleFoulSelect = useCallback(
    (type: FoulType) => {
      recordStat({ statType: 'foul', foulType: type });
      setShowFoulModal(false);
    },
    [recordStat]
  );

  // Handle substitution confirmation
  const handleSubstitutionConfirm = useCallback(
    (playerInId: string) => {
      if (selectedPlayerId) {
        recordSubstitution(selectedPlayerId, playerInId);
      }
      setShowSubstitutionModal(false);
    },
    [selectedPlayerId, recordSubstitution]
  );

  // Get bench players for the selected team
  const benchPlayersForSelectedTeam = game
    ? selectedTeam === 'home'
      ? game.homeTeam.players.filter((p) => !p.isOnCourt)
      : selectedTeam === 'away'
      ? game.awayTeam.players.filter((p) => !p.isOnCourt)
      : []
    : [];

  // Get the team color for the selected team
  const selectedTeamColor = game
    ? selectedTeam === 'home'
      ? game.homeTeam.color
      : selectedTeam === 'away'
      ? game.awayTeam.color
      : '#00F5A0'
    : '#00F5A0';

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-[var(--space-4)]">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-text-secondary">Loading game...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-[var(--space-6)]">
          <div
            className="
            w-20 h-20 mx-auto
            flex items-center justify-center
            bg-accent/15
            rounded-full
          "
          >
            <svg
              className="w-10 h-10 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary mb-[var(--space-2)]">
              Error Loading Game
            </h1>
            <p className="text-text-secondary">{error || 'Game not found'}</p>
          </div>

          <Link href="/games">
            <Button>Back to Games</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isPlayerSelected = selectedPlayerId !== null;

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col">
      {/* Score Header - Always visible */}
      <ScoreHeader
        homeTeam={{
          name: game.homeTeam.name,
          shortName: game.homeTeam.shortName,
          score: homeScore,
          color: game.homeTeam.color,
        }}
        awayTeam={{
          name: game.awayTeam.name,
          shortName: game.awayTeam.shortName,
          score: awayScore,
          color: game.awayTeam.color,
        }}
        period={game.currentPeriod}
        possession={game.currentPossession}
        onPossessionChange={updatePossession}
        clock={{
          displayTime: clock.displayTime,
          isRunning: clock.isRunning,
          onStart: clock.start,
          onPause: clock.pause,
          onReset: clock.reset,
        }}
      />

      {/* Main Content */}
      <div className="flex-1 p-[var(--space-2)] sm:p-[var(--space-4)]">
        <div className="max-w-7xl mx-auto h-full">
          {/* Desktop/Tablet Layout: 3 columns */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_minmax(320px,400px)_1fr] gap-[var(--space-4)] h-full">
            {/* Home Team Panel */}
            <TeamPanel
              teamName={game.homeTeam.name}
              shortName={game.homeTeam.shortName}
              color={game.homeTeam.color}
              players={game.homeTeam.players}
              onPlayerSelect={(playerId) => selectPlayer(playerId, 'home')}
              selectedPlayerId={selectedTeam === 'home' ? selectedPlayerId : null}
              isActiveTeam={selectedTeam === 'home'}
              side="home"
            />

            {/* Center Panel: Stats + Play-by-Play */}
            <div className="flex flex-col gap-[var(--space-4)]">
              <QuickStatPanel
                selectedPlayerName={selectedPlayer?.name}
                selectedPlayerNumber={selectedPlayer?.number}
                selectedPlayerIsOnCourt={selectedPlayer?.isOnCourt}
                onStatRecord={handleStatRecord}
                onFreeThrowClick={() => setShowFreeThrowModal(true)}
                onTurnoverClick={() => setShowTurnoverModal(true)}
                onFoulClick={() => setShowFoulModal(true)}
                onSubstitutionClick={() => setShowSubstitutionModal(true)}
                onUndoClick={undoLastAction}
                disabled={!isPlayerSelected}
                isUndoAvailable={isUndoAvailable}
                isSaving={isSaving}
              />

              <PlayByPlayFeed
                events={events}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                maxVisible={5}
                onEventTap={handleEventTap}
              />
            </div>

            {/* Away Team Panel */}
            <TeamPanel
              teamName={game.awayTeam.name}
              shortName={game.awayTeam.shortName}
              color={game.awayTeam.color}
              players={game.awayTeam.players}
              onPlayerSelect={(playerId) => selectPlayer(playerId, 'away')}
              selectedPlayerId={selectedTeam === 'away' ? selectedPlayerId : null}
              isActiveTeam={selectedTeam === 'away'}
              side="away"
            />
          </div>

          {/* Mobile Layout: Team Tabs + Player Grid */}
          <div className="lg:hidden flex flex-col h-full -mx-[var(--space-2)] sm:-mx-[var(--space-4)] -mt-[var(--space-2)] sm:-mt-[var(--space-4)]">
            {/* Team Tabs */}
            <MobileTeamTabs
              homeTeam={{
                name: game.homeTeam.name,
                shortName: game.homeTeam.shortName,
                color: game.homeTeam.color,
              }}
              awayTeam={{
                name: game.awayTeam.name,
                shortName: game.awayTeam.shortName,
                color: game.awayTeam.color,
              }}
              activeTeam={mobileActiveTeam}
              onTeamChange={setMobileActiveTeam}
            />

            {/* Player Grid for Active Team */}
            <MobilePlayerGrid
              players={mobileActiveTeam === 'home' ? game.homeTeam.players : game.awayTeam.players}
              teamColor={mobileActiveTeam === 'home' ? game.homeTeam.color : game.awayTeam.color}
              onPlayerSelect={handleMobilePlayerSelect}
              selectedPlayerId={selectedTeam === mobileActiveTeam ? selectedPlayerId : null}
            />

            {/* Bottom Section: Undo + Play-by-Play */}
            <div className="border-t border-border bg-surface">
              {/* Undo Button */}
              {isUndoAvailable && (
                <div className="px-3 py-2 border-b border-border">
                  <button
                    onClick={undoLastAction}
                    disabled={isSaving}
                    className="
                      w-full py-2.5
                      flex items-center justify-center gap-2
                      bg-bg-tertiary
                      border border-border
                      rounded-lg
                      text-text-secondary
                      font-heading font-semibold text-sm
                      transition-all duration-100
                      active:scale-[0.98]
                      disabled:opacity-50
                    "
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7v6h6" />
                      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
                    </svg>
                    Undo
                  </button>
                </div>
              )}

              {/* Play-by-Play Feed */}
              <div className="px-3 py-2">
                <PlayByPlayFeed
                  events={events}
                  homeTeam={game.homeTeam}
                  awayTeam={game.awayTeam}
                  maxVisible={3}
                  onEventTap={handleEventTap}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPlayer && (
        <>
          {/* Mobile Full-Page Stat Modal */}
          <MobileStatModal
            isOpen={showMobileStatModal}
            playerName={selectedPlayer.name}
            playerNumber={selectedPlayer.number}
            teamColor={selectedTeamColor}
            isOnCourt={selectedPlayer.isOnCourt}
            onStatRecord={handleStatRecord}
            onFreeThrowClick={() => {
              setShowMobileStatModal(false);
              setShowFreeThrowModal(true);
            }}
            onTurnoverClick={() => {
              setShowMobileStatModal(false);
              setShowTurnoverModal(true);
            }}
            onFoulClick={() => {
              setShowMobileStatModal(false);
              setShowFoulModal(true);
            }}
            onSubstitutionClick={() => {
              setShowMobileStatModal(false);
              setShowSubstitutionModal(true);
            }}
            onClose={handleMobileStatModalClose}
            isSaving={isSaving}
          />

          <FreeThrowModal
            player={selectedPlayer}
            isOpen={showFreeThrowModal}
            onComplete={handleFreeThrowComplete}
            onCancel={() => setShowFreeThrowModal(false)}
          />

          <TurnoverTypeModal
            player={selectedPlayer}
            isOpen={showTurnoverModal}
            onSelect={handleTurnoverSelect}
            onCancel={() => setShowTurnoverModal(false)}
          />

          <FoulTypeModal
            player={selectedPlayer}
            isOpen={showFoulModal}
            onSelect={handleFoulSelect}
            onCancel={() => setShowFoulModal(false)}
          />

          <SubstitutionModal
            playerOut={selectedPlayer}
            benchPlayers={benchPlayersForSelectedTeam}
            teamColor={selectedTeamColor}
            isOpen={showSubstitutionModal}
            onConfirm={handleSubstitutionConfirm}
            onCancel={() => setShowSubstitutionModal(false)}
          />
        </>
      )}

      {/* Shot Type Modal - can be opened from toast or play-by-play */}
      <ShotTypeModal
        isOpen={showShotTypeModal}
        event={shotEventForDetails}
        playerName={
          shotEventForDetails
            ? [...(game?.homeTeam.players || []), ...(game?.awayTeam.players || [])].find(
                (p) => p.id === shotEventForDetails.playerId
              )?.name
            : undefined
        }
        playerNumber={
          shotEventForDetails
            ? [...(game?.homeTeam.players || []), ...(game?.awayTeam.players || [])].find(
                (p) => p.id === shotEventForDetails.playerId
              )?.number
            : undefined
        }
        teammates={
          shotEventForDetails && shotTeamId && game
            ? (shotTeamId === game.homeTeamId
                ? game.homeTeam.players
                : game.awayTeam.players
              ).filter((p) => p.isOnCourt && p.id !== shotEventForDetails.playerId)
            : []
        }
        teamColor={
          shotTeamId && game
            ? shotTeamId === game.homeTeamId
              ? game.homeTeam.color
              : game.awayTeam.color
            : '#00F5A0'
        }
        onSave={handleShotDetailsSave}
        onCancel={() => {
          setShowShotTypeModal(false);
          setShotEventForDetails(null);
          setShotTeamId(null);
        }}
      />

      {/* Shot Details Toast */}
      {showShotToast && (
        <div
          className="
            fixed bottom-[var(--space-6)] left-1/2 -translate-x-1/2
            z-40
            animate-slide-up
          "
        >
          <button
            onClick={handleShotToastClick}
            className="
              flex items-center gap-[var(--space-3)]
              px-[var(--space-5)] py-[var(--space-3)]
              bg-surface-elevated
              border border-border
              rounded-full
              shadow-[var(--shadow-lg)]
              text-text-primary
              font-heading font-semibold
              hover:bg-bg-hover
              transition-all duration-[var(--duration-fast)]
            "
          >
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Shot recorded
            <span className="text-highlight">· Add details?</span>
          </button>
        </div>
      )}
    </main>
  );
}
