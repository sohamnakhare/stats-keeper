'use client';

import { useState, useCallback } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { PlayerRow } from './PlayerRow';
import { StartingFiveSelector } from './StartingFiveSelector';
import { SavedRosterSelector } from './SavedRosterSelector';
import type { SavedRoster, PlayerInput, TeamInput } from '@/types';

interface RosterEditorProps {
  team: TeamInput;
  players: PlayerInput[];
  onPlayersChange: (players: PlayerInput[]) => void;
  savedRosters: SavedRoster[];
  onLoadRoster: (roster: SavedRoster) => void;
  onSaveRoster: () => void;
  onDeleteRoster: (rosterId: string) => void;
  isRosterLoading?: boolean;
  side: 'home' | 'away';
}

export function RosterEditor({
  team,
  players,
  onPlayersChange,
  savedRosters,
  onLoadRoster,
  onSaveRoster,
  onDeleteRoster,
  isRosterLoading = false,
  side,
}: RosterEditorProps) {
  const [validationErrors, setValidationErrors] = useState<Record<number, { number?: string; name?: string }>>({});

  // Get starters (jersey numbers)
  const starters = players.filter((p) => p.isStarter).map((p) => p.number);
  const captainNumber = players.find((p) => p.isCaptain)?.number;

  const validatePlayer = useCallback((player: PlayerInput, index: number, allPlayers: PlayerInput[]) => {
    const errors: { number?: string; name?: string } = {};

    // Check for duplicate jersey numbers
    const duplicates = allPlayers.filter((p, i) => i !== index && p.number === player.number);
    if (duplicates.length > 0) {
      errors.number = 'Duplicate number';
    }

    // Check jersey number range
    if (player.number < 0 || player.number > 99) {
      errors.number = 'Must be 0-99';
    }

    // Check name length
    if (player.name.length > 0 && (player.name.length < 2 || player.name.length > 50)) {
      errors.name = 'Name must be 2-50 characters';
    }

    return errors;
  }, []);

  const handlePlayerUpdate = (index: number, updatedPlayer: PlayerInput) => {
    const newPlayers = [...players];
    newPlayers[index] = updatedPlayer;
    
    // Validate
    const errors = validatePlayer(updatedPlayer, index, newPlayers);
    setValidationErrors((prev) => ({ ...prev, [index]: errors }));
    
    onPlayersChange(newPlayers);
  };

  const handlePlayerDelete = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    // Re-index validation errors
    const newErrors: Record<number, { number?: string; name?: string }> = {};
    Object.entries(validationErrors).forEach(([key, value]) => {
      const keyNum = parseInt(key);
      if (keyNum < index) {
        newErrors[keyNum] = value;
      } else if (keyNum > index) {
        newErrors[keyNum - 1] = value;
      }
    });
    setValidationErrors(newErrors);
    onPlayersChange(newPlayers);
  };

  const handleAddPlayer = () => {
    // Find next available jersey number
    const usedNumbers = new Set(players.map((p) => p.number));
    let nextNumber = 0;
    while (usedNumbers.has(nextNumber) && nextNumber <= 99) {
      nextNumber++;
    }

    const newPlayer: PlayerInput = {
      number: nextNumber,
      name: '',
      position: undefined,
      isCaptain: false,
      isStarter: players.length < 5, // Auto-select as starter if less than 5 players
    };

    onPlayersChange([...players, newPlayer]);
  };

  const handleStarterToggle = (index: number) => {
    const player = players[index];
    const newPlayers = [...players];

    if (player.isStarter) {
      // Remove from starters
      newPlayers[index] = { ...player, isStarter: false };
      // If player was captain, remove captain status
      if (player.isCaptain) {
        newPlayers[index].isCaptain = false;
      }
    } else {
      // Add to starters if less than 5
      if (starters.length < 5) {
        newPlayers[index] = { ...player, isStarter: true };
      }
    }

    onPlayersChange(newPlayers);
  };

  const handleCaptainToggle = (index: number) => {
    const player = players[index];
    if (!player.isStarter) return; // Captain must be starter

    const newPlayers = players.map((p, i) => ({
      ...p,
      isCaptain: i === index ? !player.isCaptain : false, // Only one captain
    }));

    onPlayersChange(newPlayers);
  };

  const handleStartersChange = (jerseyNumbers: number[]) => {
    const newPlayers = players.map((player) => {
      const isStarter = jerseyNumbers.includes(player.number);
      return {
        ...player,
        isStarter,
        // Remove captain if no longer starter
        isCaptain: isStarter ? player.isCaptain : false,
      };
    });
    onPlayersChange(newPlayers);
  };

  const borderColor = side === 'home' ? 'border-l-team-home' : 'border-l-team-away';

  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-[var(--space-2)] sm:gap-[var(--space-4)]">
        <CardTitle className="flex items-center gap-[var(--space-2)] text-base sm:text-lg">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: team.color }}
          />
          <span className="truncate">{team.name} Roster</span>
        </CardTitle>
        <div className="flex items-center gap-[var(--space-2)] sm:ml-auto">
          <SavedRosterSelector
            rosters={savedRosters}
            onSelect={onLoadRoster}
            onDelete={onDeleteRoster}
            isLoading={isRosterLoading}
          />
          {players.length >= 5 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSaveRoster}
              className="flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)] text-xs sm:text-sm"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span className="hidden xs:inline sm:inline">Save</span>
              <span className="hidden sm:inline"> Template</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-[var(--space-4)] sm:space-y-[var(--space-6)]">
        {/* Player List */}
        <div className="space-y-[var(--space-3)] sm:space-y-[var(--space-4)]">
          <p className="text-xs sm:text-sm font-medium text-text-secondary">
            Players ({players.length})
          </p>

          {players.length === 0 ? (
            <div className="
              flex items-center justify-center
              p-[var(--space-4)] sm:p-[var(--space-8)]
              bg-bg-tertiary
              border border-dashed border-border
              rounded-[var(--radius-lg)]
              text-xs sm:text-sm text-text-muted text-center
            ">
              No players added yet. Add at least 5 players to start a game.
            </div>
          ) : (
            <div className="space-y-[var(--space-2)] sm:space-y-[var(--space-3)]">
              {players.map((player, index) => (
                <PlayerRow
                  key={index}
                  player={player}
                  onUpdate={(updated) => handlePlayerUpdate(index, updated)}
                  onDelete={() => handlePlayerDelete(index)}
                  isStarter={player.isStarter}
                  onStarterToggle={() => handleStarterToggle(index)}
                  isCaptain={player.isCaptain}
                  onCaptainToggle={() => handleCaptainToggle(index)}
                  errors={validationErrors[index]}
                />
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={handleAddPlayer}
            className="w-full text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-[var(--space-2)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Player
          </Button>
        </div>

        {/* Starting Five Visual Selector */}
        {players.length > 0 && (
          <StartingFiveSelector
            players={players}
            starters={starters}
            onStartersChange={handleStartersChange}
            teamColor={team.color}
          />
        )}

        {/* Validation Summary */}
        {players.length > 0 && (
          <div className="flex flex-wrap gap-[var(--space-2)] sm:gap-[var(--space-4)] text-xs sm:text-sm">
            {starters.length < 5 && (
              <span className="text-accent">
                ⚠ Need {5 - starters.length} more starter{5 - starters.length !== 1 ? 's' : ''}
              </span>
            )}
            {!captainNumber && starters.length >= 5 && (
              <span className="text-gold">
                ⚠ No captain selected
              </span>
            )}
            {starters.length === 5 && captainNumber && (
              <span className="text-primary">
                ✓ Roster complete
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
