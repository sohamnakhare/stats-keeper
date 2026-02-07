'use client';

import { use, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { loadGame, loadEvents, deleteEvent, updateEvent } from '@/services/game-api';
import type { GameWithTeams, PlayEventResponse, EventData } from '@/services/game-api';
import { calculateGameSummary } from '@/lib/stats-calculator';
import type { GameSummary } from '@/types';
import {
  BoxScoreTable,
  TeamComparisonCard,
  ScoreByPeriod,
  PlayByPlayList,
  AdvancedStatsCard,
} from '@/components/game-summary';
import { Button, Card } from '@/components/ui';

interface SummaryPageProps {
  params: Promise<{ id: string }>;
}

type TabType = 'box-score' | 'play-by-play' | 'advanced' | 'export';

const TABS: { id: TabType; label: string }[] = [
  { id: 'box-score', label: 'Box Score' },
  { id: 'play-by-play', label: 'Play-by-Play' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'export', label: 'Export' },
];

export default function SummaryPage({ params }: SummaryPageProps) {
  const { id } = use(params);

  const [game, setGame] = useState<GameWithTeams | null>(null);
  const [events, setEvents] = useState<PlayEventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('box-score');

  // Load game data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [gameData, eventsData] = await Promise.all([
          loadGame(id),
          loadEvents(id),
        ]);
        setGame(gameData);
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Calculate summary statistics
  const summary: GameSummary | null = useMemo(() => {
    if (!game) return null;
    return calculateGameSummary(game, events);
  }, [game, events]);

  // Handle event edit
  const handleEventEdit = useCallback(
    async (event: PlayEventResponse) => {
      // For now, just log - could open a modal for editing
      console.log('Edit event:', event);
      // In a full implementation, you would open a modal to edit the event
    },
    []
  );

  // Handle event delete
  const handleEventDelete = useCallback(
    async (eventId: string) => {
      try {
        await deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    },
    []
  );

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

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
          <p className="text-text-secondary">Loading game summary...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !game || !summary) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-[var(--space-6)]">
          <div className="w-20 h-20 mx-auto flex items-center justify-center bg-accent/15 rounded-full">
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
              Error Loading Summary
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

  const isGameCompleted = game.status === 'completed';

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-[var(--space-4)] py-[var(--space-3)]">
          {/* Top Row: Back + Date */}
          <div className="flex items-center justify-between mb-[var(--space-3)]">
            <Link
              href="/games"
              className="flex items-center gap-[var(--space-2)] text-text-muted hover:text-text-primary transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back to Games</span>
            </Link>
            <span className="text-text-muted text-sm">{formatDate(game.date)}</span>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center gap-[var(--space-6)]">
            {/* Home Team */}
            <div className="flex items-center gap-[var(--space-3)]">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: game.homeTeam.color }}
              />
              <span className="font-heading font-bold text-lg text-text-primary">
                {game.homeTeam.shortName}
              </span>
              <span className="font-display text-4xl text-text-primary">
                {summary.homeTeam.totalPoints}
              </span>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-center">
              <span
                className={`
                  text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide
                  ${isGameCompleted ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'}
                `}
              >
                {isGameCompleted ? 'Final' : game.status.replace('_', ' ')}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-[var(--space-3)]">
              <span className="font-display text-4xl text-text-primary">
                {summary.awayTeam.totalPoints}
              </span>
              <span className="font-heading font-bold text-lg text-text-primary">
                {game.awayTeam.shortName}
              </span>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: game.awayTeam.color }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-4)] overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-[var(--space-4)] py-[var(--space-2)]
                  text-sm font-medium
                  rounded-t-[var(--radius-md)]
                  transition-colors duration-[var(--duration-fast)]
                  ${
                    activeTab === tab.id
                      ? 'bg-bg-primary text-primary border-t border-l border-r border-primary/30'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-[var(--space-4)] py-[var(--space-6)]">
        {/* Box Score Tab */}
        {activeTab === 'box-score' && (
          <div className="space-y-[var(--space-6)]">
            {/* Score by Period */}
            <ScoreByPeriod homeTeam={summary.homeTeam} awayTeam={summary.awayTeam} />

            {/* Home Team Box Score */}
            <BoxScoreTable
              team={summary.homeTeam}
              players={summary.homePlayers}
            />

            {/* Away Team Box Score */}
            <BoxScoreTable
              team={summary.awayTeam}
              players={summary.awayPlayers}
            />

            {/* Team Comparison */}
            <TeamComparisonCard
              homeTeam={summary.homeTeam}
              awayTeam={summary.awayTeam}
            />
          </div>
        )}

        {/* Play-by-Play Tab */}
        {activeTab === 'play-by-play' && (
          <PlayByPlayList
            events={events}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDelete}
          />
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-6)]">
            <AdvancedStatsCard
              gameFlow={summary.gameFlow}
              homeTeam={summary.homeTeam}
              awayTeam={summary.awayTeam}
            />

            {/* Could add more advanced stats cards here */}
            <Card className="p-[var(--space-4)]">
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-[var(--space-4)]">
                Play Distribution
              </h3>
              <div className="space-y-[var(--space-2)]">
                {Object.entries(summary.playsByPeriod).map(([period, count]) => (
                  <div key={period} className="flex justify-between items-center">
                    <span className="text-text-secondary">{period}</span>
                    <div className="flex items-center gap-[var(--space-2)]">
                      <div className="w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${((count || 0) / Math.max(...Object.values(summary.playsByPeriod).filter((v): v is number => v !== undefined))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-text-primary font-mono text-sm w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-[var(--space-4)] pt-[var(--space-3)] border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Total Plays</span>
                  <span className="font-heading font-semibold text-text-primary">
                    {summary.totalPlays}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <Card className="p-[var(--space-6)]">
            <h3 className="font-heading text-xl font-semibold text-text-primary mb-[var(--space-2)]">
              Export Game Data
            </h3>
            <p className="text-text-secondary mb-[var(--space-6)]">
              Download the game statistics in your preferred format.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-4)]">
              {/* CSV Export */}
              <a
                href={`/api/games/${id}/summary/export?format=csv`}
                download
                className="block"
              >
                <Card className="p-[var(--space-4)] hover:bg-bg-hover transition-colors cursor-pointer border-2 border-transparent hover:border-primary">
                  <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
                    <div className="w-10 h-10 bg-primary/15 rounded-[var(--radius-md)] flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-text-primary">
                        CSV
                      </h4>
                      <p className="text-text-muted text-xs">Spreadsheet format</p>
                    </div>
                  </div>
                </Card>
              </a>

              {/* JSON Export */}
              <a
                href={`/api/games/${id}/summary/export?format=json`}
                download
                className="block"
              >
                <Card className="p-[var(--space-4)] hover:bg-bg-hover transition-colors cursor-pointer border-2 border-transparent hover:border-highlight">
                  <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
                    <div className="w-10 h-10 bg-highlight/15 rounded-[var(--radius-md)] flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-highlight"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-text-primary">
                        JSON
                      </h4>
                      <p className="text-text-muted text-xs">Data format</p>
                    </div>
                  </div>
                </Card>
              </a>

              {/* PDF Export (placeholder) */}
              <Card className="p-[var(--space-4)] opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
                  <div className="w-10 h-10 bg-accent/15 rounded-[var(--radius-md)] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-text-primary">
                      PDF
                    </h4>
                    <p className="text-text-muted text-xs">Coming soon</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}
      </div>

      {/* Continue Game Link (if not completed) */}
      {!isGameCompleted && (
        <div className="fixed bottom-[var(--space-6)] right-[var(--space-6)]">
          <Link href={`/game/${id}`}>
            <Button size="lg" className="shadow-lg">
              <svg
                className="w-5 h-5 mr-[var(--space-2)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Continue Game
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
