'use client';

import type { PlayerData } from '@/services/game-api';

interface TeamPanelProps {
  teamName: string;
  shortName: string;
  color: string;
  players: PlayerData[];
  onPlayerSelect: (playerId: string) => void;
  selectedPlayerId?: string | null;
  isActiveTeam: boolean;
  side: 'home' | 'away';
}

export function TeamPanel({
  teamName,
  shortName,
  color,
  players,
  onPlayerSelect,
  selectedPlayerId,
  isActiveTeam,
  side,
}: TeamPanelProps) {
  // Separate on-court and bench players
  const onCourt = players.filter((p) => p.isOnCourt);
  const bench = players.filter((p) => !p.isOnCourt);

  return (
    <div
      className={`
        bg-surface
        border border-border
        rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)]
        p-[var(--space-2)] sm:p-[var(--space-4)]
        transition-all duration-[var(--duration-fast)]
        ${isActiveTeam ? 'ring-2 ring-primary/50' : ''}
      `}
    >
      {/* Team Header */}
      <div className={`
        flex items-center gap-[var(--space-1)] sm:gap-[var(--space-2)] mb-[var(--space-2)] sm:mb-[var(--space-4)]
        ${side === 'away' ? 'flex-row-reverse' : ''}
      `}>
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className={`min-w-0 ${side === 'away' ? 'text-right' : ''}`}>
          <h2 className="text-text-primary font-heading font-semibold text-sm sm:text-lg truncate">
            {shortName}
          </h2>
          <p className="text-text-muted text-[10px] sm:text-xs truncate hidden sm:block">{teamName}</p>
        </div>
      </div>

      {/* On Court */}
      <div className="mb-[var(--space-2)] sm:mb-[var(--space-4)]">
        <h3 className="text-text-muted text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-[var(--space-1)] sm:mb-[var(--space-2)]">
          On Court
        </h3>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-[var(--space-1)] sm:gap-[var(--space-2)]">
          {onCourt.map((player) => (
            <PlayerTile
              key={player.id}
              player={player}
              color={color}
              isSelected={selectedPlayerId === player.id}
              onClick={() => onPlayerSelect(player.id)}
              size="large"
            />
          ))}
          {onCourt.length === 0 && (
            <p className="text-text-muted text-xs sm:text-sm italic col-span-3">No players on court</p>
          )}
        </div>
      </div>

      {/* Bench */}
      <div>
        <h3 className="text-text-muted text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-[var(--space-1)] sm:mb-[var(--space-2)]">
          Bench
        </h3>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-[var(--space-1)] sm:gap-[var(--space-2)]">
          {bench.map((player) => (
            <PlayerTile
              key={player.id}
              player={player}
              color={color}
              isSelected={selectedPlayerId === player.id}
              onClick={() => onPlayerSelect(player.id)}
              size="small"
            />
          ))}
          {bench.length === 0 && (
            <p className="text-text-muted text-xs sm:text-sm italic col-span-3">No players on bench</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Player Tile Component
// ============================================

interface PlayerTileProps {
  player: PlayerData;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  size: 'large' | 'small';
}

function PlayerTile({ player, color, isSelected, onClick, size }: PlayerTileProps) {
  const sizeClasses = size === 'large' 
    ? 'aspect-square sm:w-[var(--tap-target-xl)] sm:h-[var(--tap-target-xl)] sm:aspect-auto'
    : 'aspect-square sm:w-[var(--tap-target-lg)] sm:h-[var(--tap-target-lg)] sm:aspect-auto';

  const numberSize = size === 'large' ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl';
  const nameSize = size === 'large' ? 'text-[10px] sm:text-sm' : 'text-[10px] sm:text-xs';

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        flex flex-col items-center justify-center
        bg-bg-tertiary
        border-2
        rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)]
        transition-all duration-[var(--duration-fast)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        hover:bg-bg-hover
        active:scale-[0.98]
        ${isSelected 
          ? 'shadow-[var(--glow-primary)]' 
          : 'border-transparent hover:border-border'
        }
      `}
      style={{
        borderColor: isSelected ? color : undefined,
        boxShadow: isSelected ? `0 0 20px ${color}40` : undefined,
      }}
      aria-label={`Select ${player.name}, number ${player.number}`}
      aria-pressed={isSelected}
    >
      <span 
        className={`
          font-display ${numberSize} leading-none
          ${isSelected ? '' : 'text-text-primary'}
        `}
        style={{ color: isSelected ? color : undefined }}
      >
        {player.number}
      </span>
      <span className={`
        ${nameSize} text-text-muted mt-0.5 sm:mt-1
        max-w-full px-0.5 sm:px-1 truncate hidden sm:block
      `}>
        {player.name.split(' ').pop()}
      </span>
    </button>
  );
}
