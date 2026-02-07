'use client';

import { useEffect } from 'react';
import type { PlayerData } from '@/services/game-api';

// FIBA Appendix B Turnover Types
export type TurnoverType =
  | 'bad_pass'
  | 'ball_handling'
  | 'out_of_bounds'
  | 'travelling'
  | 'three_seconds'
  | 'five_seconds'
  | 'eight_seconds'
  | 'shot_clock'
  | 'backcourt'
  | 'offensive_foul'
  | 'double_dribble'
  | 'carrying'
  | 'other';

const TURNOVER_TYPES: { value: TurnoverType; label: string }[] = [
  { value: 'bad_pass', label: 'Bad Pass' },
  { value: 'ball_handling', label: 'Ball Handling' },
  { value: 'out_of_bounds', label: 'Out of Bounds' },
  { value: 'travelling', label: 'Travelling' },
  { value: 'three_seconds', label: '3 Seconds' },
  { value: 'five_seconds', label: '5 Seconds' },
  { value: 'eight_seconds', label: '8 Seconds' },
  { value: 'shot_clock', label: 'Shot Clock' },
  { value: 'backcourt', label: 'Backcourt' },
  { value: 'offensive_foul', label: 'Off. Foul' },
  { value: 'double_dribble', label: 'Double Dribble' },
  { value: 'carrying', label: 'Carrying' },
  { value: 'other', label: 'Other' },
];

interface TurnoverTypeModalProps {
  player: PlayerData;
  isOpen: boolean;
  onSelect: (type: TurnoverType) => void;
  onCancel: () => void;
}

export function TurnoverTypeModal({
  player,
  isOpen,
  onSelect,
  onCancel,
}: TurnoverTypeModalProps) {
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
          w-full max-w-lg mx-4
          bg-surface-elevated
          border border-border
          rounded-[var(--radius-xl)]
          shadow-[var(--shadow-xl)]
          animate-slide-up
        "
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="turnover-modal-title"
      >
        {/* Header */}
        <div className="
          flex items-center justify-between
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
        ">
          <div>
            <h2
              id="turnover-modal-title"
              className="text-text-primary font-heading font-semibold text-lg"
            >
              Turnover Type
            </h2>
            <p className="text-text-muted text-sm">
              #{player.number} {player.name}
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

        {/* Content - Turnover Type Grid */}
        <div className="px-[var(--space-5)] py-[var(--space-4)]">
          <div className="grid grid-cols-3 gap-[var(--space-2)]">
            {TURNOVER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onSelect(value)}
                className="
                  min-h-[var(--tap-target-md)]
                  px-[var(--space-3)]
                  flex items-center justify-center
                  bg-bg-tertiary
                  border-2 border-transparent
                  rounded-[var(--radius-md)]
                  text-text-secondary
                  font-heading font-semibold text-sm
                  transition-all duration-[var(--duration-fast)]
                  hover:bg-bg-hover hover:border-accent/50 hover:text-accent
                  active:scale-[0.98]
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                "
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="
          flex justify-end
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
