'use client';

import type { PlayerInput } from '@/types';

interface StartingFiveSelectorProps {
  players: PlayerInput[];
  starters: number[]; // Jersey numbers of starters
  onStartersChange: (jerseyNumbers: number[]) => void;
  teamColor: string;
  maxStarters?: number;
}

export function StartingFiveSelector({
  players,
  starters,
  onStartersChange,
  teamColor,
  maxStarters = 5,
}: StartingFiveSelectorProps) {
  const starterPlayers = players.filter((p) => starters.includes(p.number));
  const benchPlayers = players.filter((p) => !starters.includes(p.number));

  const toggleStarter = (jerseyNumber: number) => {
    if (starters.includes(jerseyNumber)) {
      // Remove from starters
      onStartersChange(starters.filter((n) => n !== jerseyNumber));
    } else if (starters.length < maxStarters) {
      // Add to starters
      onStartersChange([...starters, jerseyNumber]);
    }
  };

  const swapWithBench = (starterNumber: number, benchNumber: number) => {
    const newStarters = starters.map((n) => 
      n === starterNumber ? benchNumber : n
    );
    onStartersChange(newStarters);
  };

  return (
    <div className="space-y-[var(--space-4)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">
          Select Starting Five
        </h3>
        <span
          className={`
            text-sm font-mono px-[var(--space-2)] py-[var(--space-1)]
            rounded-[var(--radius-sm)]
            ${starters.length === maxStarters 
              ? 'bg-[rgba(0,245,160,0.15)] text-primary' 
              : 'bg-[rgba(255,107,53,0.15)] text-accent'
            }
          `}
        >
          {starters.length}/{maxStarters} selected
        </span>
      </div>

      {/* Starters Section */}
      <div className="space-y-[var(--space-2)]">
        <p className="text-xs text-text-muted uppercase tracking-wide">Starters</p>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {Array.from({ length: maxStarters }).map((_, index) => {
            const player = starterPlayers[index];
            
            if (player) {
              return (
                <button
                  key={player.number}
                  type="button"
                  onClick={() => toggleStarter(player.number)}
                  className="
                    w-[var(--tap-target-xl)] h-[var(--tap-target-xl)]
                    flex flex-col items-center justify-center gap-[var(--space-1)]
                    bg-surface
                    border-2 border-primary
                    rounded-[var(--radius-lg)]
                    shadow-[var(--glow-primary)]
                    transition-all duration-[var(--duration-fast)]
                    hover:scale-105
                  "
                  style={{ borderColor: teamColor }}
                >
                  <span className="font-display text-2xl text-text-primary">
                    #{player.number}
                  </span>
                  <span className="text-xs text-text-secondary truncate max-w-[70px]">
                    {player.name.split(' ').pop()}
                  </span>
                </button>
              );
            }

            // Empty slot
            return (
              <div
                key={`empty-${index}`}
                className="
                  w-[var(--tap-target-xl)] h-[var(--tap-target-xl)]
                  flex items-center justify-center
                  bg-bg-tertiary
                  border-2 border-dashed border-border
                  rounded-[var(--radius-lg)]
                "
              >
                <span className="text-text-muted text-xs">Empty</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bench Section */}
      {benchPlayers.length > 0 && (
        <div className="space-y-[var(--space-2)]">
          <p className="text-xs text-text-muted uppercase tracking-wide">
            Bench (tap to add as starter)
          </p>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {benchPlayers.map((player) => (
              <button
                key={player.number}
                type="button"
                onClick={() => toggleStarter(player.number)}
                disabled={starters.length >= maxStarters}
                className="
                  w-[var(--tap-target-xl)] h-[var(--tap-target-xl)]
                  flex flex-col items-center justify-center gap-[var(--space-1)]
                  bg-surface
                  border border-border
                  rounded-[var(--radius-lg)]
                  transition-all duration-[var(--duration-fast)]
                  hover:border-text-muted
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <span className="font-display text-xl text-text-secondary">
                  #{player.number}
                </span>
                <span className="text-xs text-text-muted truncate max-w-[70px]">
                  {player.name.split(' ').pop()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {players.length === 0 && (
        <div className="
          flex items-center justify-center
          p-[var(--space-8)]
          bg-bg-tertiary
          border border-dashed border-border
          rounded-[var(--radius-lg)]
          text-text-muted
        ">
          Add players to select starting five
        </div>
      )}

      {/* Insufficient Players Warning */}
      {players.length > 0 && players.length < maxStarters && (
        <p className="text-xs text-accent">
          Need at least {maxStarters} players to select a full starting lineup
        </p>
      )}
    </div>
  );
}
