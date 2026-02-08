'use client';

import type { PlayerData } from '@/services/game-api';

interface TeamPanelProps {
  teamName: string;
  shortName: string;
  color: string;
  players: PlayerData[];
  playerFouls?: Record<string, number>;
  teamFoulsThisPeriod?: number;
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
  playerFouls = {},
  teamFoulsThisPeriod = 0,
  onPlayerSelect,
  selectedPlayerId,
  isActiveTeam,
  side,
}: TeamPanelProps) {
  // Separate on-court and bench players
  const onCourt = players.filter((p) => p.isOnCourt);
  const bench = players.filter((p) => !p.isOnCourt);

  // Team is in bonus after 4 team fouls (FIBA rules)
  const isInBonus = teamFoulsThisPeriod >= 4;

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
        <div className={`min-w-0 flex-1 ${side === 'away' ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-[var(--space-2)] ${side === 'away' ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-text-primary font-heading font-semibold text-sm sm:text-lg truncate">
              {shortName}
            </h2>
            {/* Team fouls this period - dots */}
            {teamFoulsThisPeriod > 0 && (
              <div className={`flex items-center gap-0.5 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
                {Array.from({ length: Math.min(teamFoulsThisPeriod, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
                      ${isInBonus ? 'bg-gold' : 'bg-text-muted'}
                    `}
                  />
                ))}
                {isInBonus && (
                  <span className="text-[9px] sm:text-[10px] text-gold font-bold ml-1 uppercase">
                    Bonus
                  </span>
                )}
              </div>
            )}
          </div>
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
              foulCount={playerFouls[player.id] || 0}
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
              foulCount={playerFouls[player.id] || 0}
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
  foulCount: number;
}

function PlayerTile({ player, color, isSelected, onClick, size, foulCount }: PlayerTileProps) {
  const sizeClasses = size === 'large' 
    ? 'aspect-square sm:w-[var(--tap-target-xl)] sm:h-[var(--tap-target-xl)] sm:aspect-auto'
    : 'aspect-square sm:w-[var(--tap-target-lg)] sm:h-[var(--tap-target-lg)] sm:aspect-auto';

  const numberSize = size === 'large' ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl';
  const nameSize = size === 'large' ? 'text-[10px] sm:text-sm' : 'text-[10px] sm:text-xs';

  // Foul trouble: 4 fouls = warning (yellow), 5 fouls = fouled out (red)
  const isInFoulTrouble = foulCount >= 4;
  const isFouledOut = foulCount >= 5;

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        relative
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
        ${isFouledOut ? 'opacity-50' : ''}
      `}
      style={{
        borderColor: isSelected ? color : undefined,
        boxShadow: isSelected ? `0 0 20px ${color}40` : undefined,
      }}
      aria-label={`Select ${player.name}, number ${player.number}${foulCount > 0 ? `, ${foulCount} fouls` : ''}`}
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
      
      {/* Foul dots indicator */}
      {foulCount > 0 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: Math.min(foulCount, 5) }).map((_, i) => (
            <div
              key={i}
              className={`
                w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
                ${isFouledOut 
                  ? 'bg-accent' 
                  : isInFoulTrouble 
                    ? 'bg-gold' 
                    : 'bg-text-muted'
                }
              `}
            />
          ))}
        </div>
      )}
    </button>
  );
}
