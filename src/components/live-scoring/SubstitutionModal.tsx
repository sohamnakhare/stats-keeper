'use client';

import { useEffect } from 'react';
import type { PlayerData } from '@/services/game-api';

const FOUL_OUT_LIMIT = 5;

interface SubstitutionModalProps {
  playerOut: PlayerData;
  benchPlayers: PlayerData[];
  playerFouls: Record<string, number>;
  teamColor: string;
  isOpen: boolean;
  onConfirm: (playerInId: string) => void;
  onCancel: () => void;
}

export function SubstitutionModal({
  playerOut,
  benchPlayers,
  playerFouls,
  teamColor,
  isOpen,
  onConfirm,
  onCancel,
}: SubstitutionModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        backdrop-blur-sm
      "
      onClick={onCancel}
    >
      <div
        className="
          w-full max-w-md mx-4
          bg-surface-elevated
          border border-border
          rounded-[var(--radius-xl)]
          shadow-[var(--shadow-xl)]
          animate-slide-up
        "
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-modal-title"
      >
        {/* Header */}
        <div className="
          flex items-center justify-between
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
        ">
          <div>
            <h2
              id="sub-modal-title"
              className="text-text-primary font-heading font-semibold text-lg"
            >
              Substitution
            </h2>
            <p className="text-text-muted text-sm">
              <span className="text-accent">OUT:</span>{' '}
              #{playerOut.number} {playerOut.name}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="
              w-8 h-8
              flex items-center justify-center
              text-text-muted
              hover:text-text-primary
              transition-colors
            "
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-[var(--space-5)] py-[var(--space-4)]">
          <label className="text-text-muted text-xs font-medium uppercase tracking-wide block mb-[var(--space-3)]">
            Select Player Coming In
          </label>

          {benchPlayers.length === 0 ? (
            <p className="text-text-muted text-sm italic py-[var(--space-4)]">
              No players available on bench
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-[var(--space-2)]">
              {benchPlayers.map((player) => {
                const foulCount = playerFouls[player.id] || 0;
                const isFouledOut = foulCount >= FOUL_OUT_LIMIT;

                return (
                  <button
                    key={player.id}
                    onClick={() => !isFouledOut && onConfirm(player.id)}
                    disabled={isFouledOut}
                    className={`
                      min-h-[var(--tap-target-xl)]
                      flex flex-col items-center justify-center
                      bg-bg-tertiary
                      border-2 border-transparent
                      rounded-[var(--radius-lg)]
                      transition-all duration-[var(--duration-fast)]
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                      ${isFouledOut
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-primary/50 hover:bg-bg-hover active:scale-[0.98]'
                      }
                    `}
                    style={{
                      ['--hover-border' as string]: teamColor,
                    }}
                    aria-disabled={isFouledOut}
                    title={isFouledOut ? 'Player fouled out' : undefined}
                  >
                    <span
                      className="font-display text-2xl leading-none"
                      style={{ color: isFouledOut ? 'var(--color-text-muted)' : teamColor }}
                    >
                      {player.number}
                    </span>
                    <span className="text-xs text-text-muted mt-1 max-w-full px-2 truncate">
                      {player.name}
                    </span>
                    {isFouledOut ? (
                      <span className="text-[10px] text-danger font-medium">
                        FOULED OUT
                      </span>
                    ) : player.position ? (
                      <span className="text-[10px] text-text-muted/60">
                        {player.position}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="
          flex justify-end gap-[var(--space-3)]
          px-[var(--space-5)] py-[var(--space-4)]
          border-t border-border
        ">
          <button
            onClick={onCancel}
            className="
              min-h-[var(--tap-target-md)]
              px-[var(--space-5)]
              bg-transparent
              border border-border
              rounded-[var(--radius-md)]
              text-text-secondary
              font-heading font-semibold
              hover:bg-bg-hover hover:text-text-primary
              transition-all duration-[var(--duration-fast)]
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
