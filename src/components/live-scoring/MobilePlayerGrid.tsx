'use client';

import type { PlayerData } from '@/services/game-api';

interface MobilePlayerGridProps {
  players: PlayerData[];
  teamColor: string;
  playerFouls?: Record<string, number>;
  onPlayerSelect: (playerId: string) => void;
  selectedPlayerId?: string | null;
}

export function MobilePlayerGrid({
  players,
  teamColor,
  playerFouls = {},
  onPlayerSelect,
  selectedPlayerId,
}: MobilePlayerGridProps) {
  // Separate on-court and bench players
  const onCourt = players.filter((p) => p.isOnCourt);
  const bench = players.filter((p) => !p.isOnCourt);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* On Court */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-wide">
            On Court
          </h3>
          <span className="text-text-muted text-xs">{onCourt.length}/5</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {onCourt.map((player) => (
            <PlayerTile
              key={player.id}
              player={player}
              color={teamColor}
              isSelected={selectedPlayerId === player.id}
              onClick={() => onPlayerSelect(player.id)}
              isOnCourt
              foulCount={playerFouls[player.id] || 0}
            />
          ))}
          {onCourt.length === 0 && (
            <p className="text-text-muted text-sm italic col-span-3 text-center py-4">
              No players on court
            </p>
          )}
        </div>
      </section>

      {/* Bench */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-text-muted text-xs font-bold uppercase tracking-wide">
            Bench
          </h3>
          <span className="text-text-muted text-xs">{bench.length} players</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {bench.map((player) => (
            <PlayerTile
              key={player.id}
              player={player}
              color={teamColor}
              isSelected={selectedPlayerId === player.id}
              onClick={() => onPlayerSelect(player.id)}
              isOnCourt={false}
              foulCount={playerFouls[player.id] || 0}
            />
          ))}
          {bench.length === 0 && (
            <p className="text-text-muted text-sm italic col-span-4 text-center py-4">
              No players on bench
            </p>
          )}
        </div>
      </section>

      {/* Tap hint */}
      <p className="text-center text-text-muted text-xs pt-2">
        Tap a player to record stats
      </p>
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
  isOnCourt: boolean;
  foulCount: number;
}

function PlayerTile({ player, color, isSelected, onClick, isOnCourt, foulCount }: PlayerTileProps) {
  // Foul trouble: 4 fouls = warning (yellow), 5 fouls = fouled out (red)
  const isInFoulTrouble = foulCount >= 4;
  const isFouledOut = foulCount >= 5;

  return (
    <button
      onClick={onClick}
      className={`
        ${isOnCourt ? 'aspect-square' : 'aspect-square'}
        relative
        flex flex-col items-center justify-center
        bg-bg-tertiary
        border-2
        rounded-xl
        transition-all duration-100
        active:scale-[0.95]
        ${isSelected 
          ? '' 
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
          font-display ${isOnCourt ? 'text-2xl' : 'text-xl'} leading-none
          ${isSelected ? '' : 'text-text-primary'}
        `}
        style={{ color: isSelected ? color : undefined }}
      >
        {player.number}
      </span>
      <span className={`
        ${isOnCourt ? 'text-xs' : 'text-[10px]'} text-text-muted mt-1
        max-w-full px-1 truncate
      `}>
        {player.name.split(' ').pop()}
      </span>
      {player.isCaptain && (
        <span className="text-[10px] text-gold">★</span>
      )}
      
      {/* Foul dots indicator */}
      {foulCount > 0 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: Math.min(foulCount, 5) }).map((_, i) => (
            <div
              key={i}
              className={`
                w-1.5 h-1.5 rounded-full
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
