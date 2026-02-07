'use client';

import { useEffect } from 'react';
import type { PlayerData, PlayEventResponse } from '@/services/game-api';

interface AssistAttributionModalProps {
  isOpen: boolean;
  scoringEvent: PlayEventResponse | null;
  scorerName?: string;
  scorerNumber?: number;
  teammates: PlayerData[];  // On-court teammates (excluding scorer)
  teamColor: string;
  onSelect: (assisterId: string) => void;
  onSkip: () => void;
}

export function AssistAttributionModal({
  isOpen,
  scoringEvent,
  scorerName,
  scorerNumber,
  teammates,
  teamColor,
  onSelect,
  onSkip,
}: AssistAttributionModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onSkip]);

  if (!isOpen || !scoringEvent) return null;

  const points = scoringEvent.eventData?.points || 2;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        backdrop-blur-sm
      "
      onClick={onSkip}
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
        aria-labelledby="assist-modal-title"
      >
        {/* Header */}
        <div className="
          flex items-center justify-between
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
        ">
          <div>
            <h2
              id="assist-modal-title"
              className="text-text-primary font-heading font-semibold text-lg"
            >
              Assisted by?
            </h2>
            <p className="text-text-muted text-sm">
              <span className="text-primary font-semibold">
                #{scorerNumber} {scorerName}
              </span>
              {' '}scored {points}PT
            </p>
          </div>
          <button
            onClick={onSkip}
            className="
              w-8 h-8
              flex items-center justify-center
              text-text-muted
              hover:text-text-primary
              transition-colors
            "
            aria-label="Skip"
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

        {/* Content - Teammates Grid */}
        <div className="px-[var(--space-5)] py-[var(--space-4)]">
          {teammates.length === 0 ? (
            <p className="text-text-muted text-sm italic py-[var(--space-4)] text-center">
              No teammates on court
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-[var(--space-2)]">
              {teammates.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onSelect(player.id)}
                  className="
                    min-h-[var(--tap-target-xl)]
                    flex flex-col items-center justify-center
                    bg-bg-tertiary
                    border-2 border-transparent
                    rounded-[var(--radius-lg)]
                    transition-all duration-[var(--duration-fast)]
                    hover:border-highlight/50
                    hover:bg-bg-hover
                    active:scale-[0.98]
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight
                  "
                >
                  <span
                    className="font-display text-2xl leading-none"
                    style={{ color: teamColor }}
                  >
                    {player.number}
                  </span>
                  <span className="text-xs text-text-muted mt-1 max-w-full px-1 truncate">
                    {player.name.split(' ').pop()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="
          flex justify-center
          px-[var(--space-5)] py-[var(--space-4)]
          border-t border-border
        ">
          <button
            onClick={onSkip}
            className="
              min-h-[var(--tap-target-md)]
              px-[var(--space-6)]
              bg-transparent
              border border-border
              rounded-[var(--radius-md)]
              text-text-secondary
              font-heading font-semibold
              hover:bg-bg-hover hover:text-text-primary
              transition-all duration-[var(--duration-fast)]
            "
          >
            No Assist
          </button>
        </div>
      </div>
    </div>
  );
}
