'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NewGameForm } from '@/components/game-setup';
import { loadSavedRosters } from '@/services/saved-rosters';
import type { SavedRoster, TeamInput, PlayerInput } from '@/types';

// Store game setup data in sessionStorage for persistence across page navigation
const STORAGE_KEY = 'game-setup-data';

interface GameSetupData {
  date: Date;
  venue?: string;
  homeTeam: TeamInput;
  awayTeam: TeamInput;
  homePlayers: PlayerInput[];
  awayPlayers: PlayerInput[];
}

export default function NewGamePage() {
  const router = useRouter();
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRosters, setSelectedRosters] = useState<{
    home?: SavedRoster;
    away?: SavedRoster;
  }>({});

  // Load saved rosters on mount
  useEffect(() => {
    async function fetchSavedRosters() {
      try {
        const data = await loadSavedRosters();
        setSavedRosters(data);
      } catch (error) {
        console.error('Failed to load saved rosters:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSavedRosters();
  }, []);

  const handleSubmit = (data: {
    date: Date;
    venue?: string;
    homeTeam: TeamInput;
    awayTeam: TeamInput;
  }) => {
    // Get players from selected rosters or start with empty arrays
    const homePlayers: PlayerInput[] = selectedRosters.home?.players.map((p, i) => ({
      number: p.number,
      name: p.name,
      position: p.position,
      isCaptain: p.isCaptain,
      isStarter: i < 5,
    })) || [];

    const awayPlayers: PlayerInput[] = selectedRosters.away?.players.map((p, i) => ({
      number: p.number,
      name: p.name,
      position: p.position,
      isCaptain: p.isCaptain,
      isStarter: i < 5,
    })) || [];

    // Store data in sessionStorage
    const setupData: GameSetupData = {
      ...data,
      homePlayers,
      awayPlayers,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(setupData));

    // Navigate to roster page
    router.push('/game/new/roster');
  };

  const handleSelectRoster = (roster: SavedRoster, side: 'home' | 'away') => {
    setSelectedRosters((prev) => ({
      ...prev,
      [side]: roster,
    }));
  };

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-[var(--space-4)] py-[var(--space-8)]">
        {/* Header */}
        <div className="mb-[var(--space-8)]">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-[var(--space-2)]">
            New Game
          </h1>
          <p className="text-text-secondary">
            Set up the teams for your game. You can load saved rosters or create new ones.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-8)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="
              w-8 h-8 flex items-center justify-center
              bg-primary text-text-inverse
              rounded-full font-medium
            ">
              1
            </span>
            <span className="text-sm font-medium text-text-primary">Teams</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="
              w-8 h-8 flex items-center justify-center
              bg-bg-tertiary text-text-muted
              rounded-full font-medium
            ">
              2
            </span>
            <span className="text-sm text-text-muted">Rosters</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="
              w-8 h-8 flex items-center justify-center
              bg-bg-tertiary text-text-muted
              rounded-full font-medium
            ">
              3
            </span>
            <span className="text-sm text-text-muted">Start</span>
          </div>
        </div>

        {/* Form */}
        {isLoading ? (
          <div className="flex items-center justify-center py-[var(--space-12)]">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <NewGameForm
            onSubmit={handleSubmit}
            recentRosters={savedRosters}
            onSelectRoster={handleSelectRoster}
          />
        )}
      </div>
    </main>
  );
}
