'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { RosterEditor } from '@/components/game-setup';
import { loadSavedRosters, saveRoster, deleteSavedRoster } from '@/services/saved-rosters';
import { createGame } from '@/services/games';
import type { SavedRoster, TeamInput, PlayerInput, SavedRosterPlayer } from '@/types';

const STORAGE_KEY = 'game-setup-data';

interface GameSetupData {
  date: string;
  venue?: string;
  homeTeam: TeamInput;
  awayTeam: TeamInput;
  homePlayers: PlayerInput[];
  awayPlayers: PlayerInput[];
}

export default function RosterPage() {
  const router = useRouter();
  const [savedRosters, setSavedRosters] = useState<SavedRoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [setupData, setSetupData] = useState<GameSetupData | null>(null);
  const [homePlayers, setHomePlayers] = useState<PlayerInput[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerInput[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');

  // Load data from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // No setup data, redirect back to first step
      router.replace('/game/new');
      return;
    }

    try {
      const data: GameSetupData = JSON.parse(stored);
      setSetupData(data);
      setHomePlayers(data.homePlayers || []);
      setAwayPlayers(data.awayPlayers || []);
    } catch {
      router.replace('/game/new');
    }
  }, [router]);

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

  const handleLoadRoster = (roster: SavedRoster, side: 'home' | 'away') => {
    const players: PlayerInput[] = roster.players.map((p, i) => ({
      number: p.number,
      name: p.name,
      position: p.position,
      isCaptain: p.isCaptain,
      isStarter: i < 5,
    }));

    if (side === 'home') {
      setHomePlayers(players);
    } else {
      setAwayPlayers(players);
    }
  };

  const handleSaveRoster = async (side: 'home' | 'away') => {
    if (!setupData) return;

    const team = side === 'home' ? setupData.homeTeam : setupData.awayTeam;
    const players = side === 'home' ? homePlayers : awayPlayers;

    const rosterPlayers: SavedRosterPlayer[] = players.map((p) => ({
      number: p.number,
      name: p.name,
      position: p.position,
      isCaptain: p.isCaptain,
    }));

    try {
      const newRoster = await saveRoster({
        teamName: team.name,
        shortName: team.shortName,
        color: team.color,
        players: rosterPlayers,
      });
      setSavedRosters((prev) => [newRoster, ...prev]);
    } catch (error) {
      console.error('Failed to save roster:', error);
      setError('Failed to save roster');
    }
  };

  const handleDeleteRoster = async (rosterId: string) => {
    try {
      await deleteSavedRoster(rosterId);
      setSavedRosters((prev) => prev.filter((r) => r.id !== rosterId));
    } catch (error) {
      console.error('Failed to delete roster:', error);
      setError('Failed to delete roster');
    }
  };

  const validateRosters = () => {
    const homeStarters = homePlayers.filter((p) => p.isStarter);
    const awayStarters = awayPlayers.filter((p) => p.isStarter);
    const homeCaptain = homePlayers.find((p) => p.isCaptain);
    const awayCaptain = awayPlayers.find((p) => p.isCaptain);

    if (homeStarters.length !== 5) {
      return 'Home team needs exactly 5 starters';
    }
    if (awayStarters.length !== 5) {
      return 'Away team needs exactly 5 starters';
    }
    if (!homeCaptain) {
      return 'Home team needs a captain';
    }
    if (!awayCaptain) {
      return 'Away team needs a captain';
    }

    // Check for empty names
    const emptyHomeName = homePlayers.find((p) => !p.name.trim());
    const emptyAwayName = awayPlayers.find((p) => !p.name.trim());
    if (emptyHomeName) {
      return `Home player #${emptyHomeName.number} needs a name`;
    }
    if (emptyAwayName) {
      return `Away player #${emptyAwayName.number} needs a name`;
    }

    return null;
  };

  const handleStartGame = async () => {
    if (!setupData) return;

    const validationError = validateRosters();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const homeStarters = homePlayers.filter((p) => p.isStarter).map((p) => p.number);
      const awayStarters = awayPlayers.filter((p) => p.isStarter).map((p) => p.number);

      const game = await createGame({
        date: setupData.date,
        venue: setupData.venue,
        homeTeam: {
          ...setupData.homeTeam,
          players: homePlayers.map((p) => ({
            number: p.number,
            name: p.name,
            position: p.position,
            isCaptain: p.isCaptain,
          })),
          startingFive: homeStarters,
        },
        awayTeam: {
          ...setupData.awayTeam,
          players: awayPlayers.map((p) => ({
            number: p.number,
            name: p.name,
            position: p.position,
            isCaptain: p.isCaptain,
          })),
          startingFive: awayStarters,
        },
      });

      // Clear session storage
      sessionStorage.removeItem(STORAGE_KEY);

      // Navigate to the game (live scoring page - placeholder for now)
      router.push(`/game/${game.id}`);
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create game. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!setupData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const homeComplete = homePlayers.filter((p) => p.isStarter).length === 5 && homePlayers.some((p) => p.isCaptain);
  const awayComplete = awayPlayers.filter((p) => p.isStarter).length === 5 && awayPlayers.some((p) => p.isCaptain);
  const canStart = homeComplete && awayComplete && homePlayers.every((p) => p.name.trim()) && awayPlayers.every((p) => p.name.trim());

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-[var(--space-4)] py-[var(--space-8)]">
        {/* Header */}
        <div className="mb-[var(--space-8)]">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-[var(--space-2)]">
            Set Up Rosters
          </h1>
          <p className="text-text-secondary">
            Add players to each team and select starting lineups.
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
              ✓
            </span>
            <span className="text-sm text-text-secondary">Teams</span>
          </div>
          <div className="flex-1 h-px bg-primary" />
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="
              w-8 h-8 flex items-center justify-center
              bg-primary text-text-inverse
              rounded-full font-medium
            ">
              2
            </span>
            <span className="text-sm font-medium text-text-primary">Rosters</span>
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

        {/* Error Banner */}
        {error && (
          <div className="
            mb-[var(--space-6)]
            p-[var(--space-4)]
            bg-[rgba(255,107,53,0.15)]
            border border-accent
            rounded-[var(--radius-lg)]
            text-accent
          ">
            {error}
          </div>
        )}

        {/* Tab Switcher (Mobile) */}
        <div className="flex gap-[var(--space-2)] mb-[var(--space-6)] lg:hidden">
          <Button
            variant={activeTab === 'home' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('home')}
            className="flex-1"
          >
            <span
              className="w-2 h-2 rounded-full mr-[var(--space-2)]"
              style={{ backgroundColor: setupData.homeTeam.color }}
            />
            {setupData.homeTeam.shortName}
            {homeComplete && <span className="ml-[var(--space-2)]">✓</span>}
          </Button>
          <Button
            variant={activeTab === 'away' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('away')}
            className="flex-1"
          >
            <span
              className="w-2 h-2 rounded-full mr-[var(--space-2)]"
              style={{ backgroundColor: setupData.awayTeam.color }}
            />
            {setupData.awayTeam.shortName}
            {awayComplete && <span className="ml-[var(--space-2)]">✓</span>}
          </Button>
        </div>

        {/* Roster Editors */}
        <div className="space-y-[var(--space-6)] lg:grid lg:grid-cols-2 lg:gap-[var(--space-6)] lg:space-y-0">
          {/* Home Team */}
          <div className={`${activeTab === 'away' ? 'hidden lg:block' : ''}`}>
            <RosterEditor
              team={setupData.homeTeam}
              players={homePlayers}
              onPlayersChange={setHomePlayers}
              savedRosters={savedRosters}
              onLoadRoster={(r) => handleLoadRoster(r, 'home')}
              onSaveRoster={() => handleSaveRoster('home')}
              onDeleteRoster={handleDeleteRoster}
              isRosterLoading={isLoading}
              side="home"
            />
          </div>

          {/* Away Team */}
          <div className={`${activeTab === 'home' ? 'hidden lg:block' : ''}`}>
            <RosterEditor
              team={setupData.awayTeam}
              players={awayPlayers}
              onPlayersChange={setAwayPlayers}
              savedRosters={savedRosters}
              onLoadRoster={(r) => handleLoadRoster(r, 'away')}
              onSaveRoster={() => handleSaveRoster('away')}
              onDeleteRoster={handleDeleteRoster}
              isRosterLoading={isLoading}
              side="away"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-[var(--space-8)]">
          <Button
            variant="ghost"
            onClick={() => router.push('/game/new')}
          >
            ← Back to Teams
          </Button>
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={!canStart || isSaving}
            isLoading={isSaving}
          >
            {isSaving ? 'Creating Game...' : 'Start Game →'}
          </Button>
        </div>
      </div>
    </main>
  );
}
