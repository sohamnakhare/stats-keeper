'use client';

import type { PlayerData } from '@/services/game-api';

interface MobilePlayerGridProps {
  players: PlayerData[];
  teamColor: string;
  onPlayerSelect: (playerId: string) => void;
  selectedPlayerId?: string | null;
}

export function MobilePlayerGrid({
  players,
  teamColor,
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
}

function PlayerTile({ player, color, isSelected, onClick, isOnCourt }: PlayerTileProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${isOnCourt ? 'aspect-square' : 'aspect-square'}
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
    </button>
  );
}
