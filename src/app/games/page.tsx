'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { loadGames, deleteGame } from '@/services/games';

interface GameData {
  id: string;
  date: string;
  venue?: string;
  status: string;
  homeTeam?: {
    name: string;
    shortName: string;
    color: string;
  };
  awayTeam?: {
    name: string;
    shortName: string;
    color: string;
  };
}

export default function GamesListPage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const data = await loadGames();
      setGames(data);
    } catch (err) {
      console.error('Failed to load games:', err);
      setError('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }

    try {
      setDeletingId(id);
      await deleteGame(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Failed to delete game:', err);
      setError('Failed to delete game');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="default">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="live">Live</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-[var(--space-3)] sm:px-[var(--space-4)] py-[var(--space-4)] sm:py-[var(--space-8)]">
        {/* Back Link */}
        <div className="mb-[var(--space-3)] sm:mb-[var(--space-4)]">
          <Link 
            href="/" 
            className="text-text-muted hover:text-text-primary transition-colors text-sm inline-flex items-center gap-[var(--space-1)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--space-3)] mb-[var(--space-4)] sm:mb-[var(--space-8)]">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-[var(--space-1)]">
              All Games
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              {games.length} game{games.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <Link href="/game/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <svg
                className="w-5 h-5 mr-[var(--space-2)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New Game</span>
            </Button>
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="
            mb-[var(--space-4)] sm:mb-[var(--space-6)]
            p-[var(--space-3)] sm:p-[var(--space-4)]
            bg-[rgba(255,107,53,0.15)]
            border border-accent
            rounded-[var(--radius-lg)]
            text-accent text-sm sm:text-base
            flex items-center justify-between gap-[var(--space-2)]
          ">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-accent hover:text-white flex-shrink-0 p-1">
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-[var(--space-8)] sm:py-[var(--space-12)]">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : games.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-[var(--space-8)] sm:py-[var(--space-12)]">
            <CardContent className="px-[var(--space-4)]">
              <div className="
                w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-[var(--space-3)] sm:mb-[var(--space-4)]
                flex items-center justify-center
                bg-bg-tertiary
                rounded-full
              ">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-semibold text-text-primary mb-[var(--space-2)]">
                No games yet
              </h2>
              <p className="text-text-secondary text-sm sm:text-base mb-[var(--space-4)] sm:mb-[var(--space-6)]">
                Create your first game to start tracking stats.
              </p>
              <Link href="/game/new">
                <Button className="w-full sm:w-auto">Create First Game</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Games List */
          <div className="space-y-[var(--space-3)] sm:space-y-[var(--space-4)]">
            {games.map((game) => (
              <Card key={game.id} className="hover:border-text-muted transition-colors">
                <CardContent className="p-[var(--space-3)] sm:p-[var(--space-4)]">
                  {/* Mobile: Stacked layout */}
                  <div className="flex flex-col gap-[var(--space-3)]">
                    {/* Top row: Teams + Status */}
                    <div className="flex items-start justify-between gap-[var(--space-2)]">
                      {/* Teams */}
                      <div className="flex-1 min-w-0">
                        {/* Teams in one line */}
                        <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-3)]">
                          {/* Home Team */}
                          <div className="flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)] min-w-0">
                            <span
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: game.homeTeam?.color || '#00F5A0' }}
                            />
                            <span className="font-medium text-text-primary text-sm sm:text-base truncate">
                              {game.homeTeam?.shortName || 'HOM'}
                            </span>
                          </div>

                          <span className="text-text-muted text-xs sm:text-base flex-shrink-0">vs</span>

                          {/* Away Team */}
                          <div className="flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)] min-w-0">
                            <span
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: game.awayTeam?.color || '#FF6B35' }}
                            />
                            <span className="font-medium text-text-primary text-sm sm:text-base truncate">
                              {game.awayTeam?.shortName || 'AWY'}
                            </span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-[var(--space-2)] sm:gap-[var(--space-4)] text-xs sm:text-sm text-text-muted mt-[var(--space-1)] sm:mt-[var(--space-2)]">
                          <span className="truncate">{formatDate(game.date)}</span>
                          {game.venue && (
                            <>
                              <span className="flex-shrink-0">•</span>
                              <span className="truncate">{game.venue}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {getStatusBadge(game.status)}
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)] pt-[var(--space-2)] border-t border-border sm:border-0 sm:pt-0 sm:justify-end">
                      <Link href={`/game/${game.id}`} className="flex-1 sm:flex-initial">
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                          {game.status === 'in_progress' ? 'Continue' : 'View'}
                        </Button>
                      </Link>
                      <Link href={`/game/${game.id}/summary`} className="flex-1 sm:flex-initial">
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                          Summary
                        </Button>
                      </Link>
                      <Button
                        variant={confirmDelete === game.id ? 'danger' : 'ghost'}
                        size="sm"
                        onClick={() => handleDelete(game.id)}
                        disabled={deletingId === game.id}
                        isLoading={deletingId === game.id}
                        className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                      >
                        {confirmDelete === game.id ? 'Confirm?' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
