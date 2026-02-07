'use client';

import { useEffect } from 'react';
import type { PlayerData } from '@/services/game-api';

// FIBA Foul Types
export type FoulType =
  | 'personal'
  | 'unsportsmanlike'
  | 'technical'
  | 'disqualifying';

const FOUL_TYPES: { value: FoulType; label: string; description: string }[] = [
  { value: 'personal', label: 'Personal', description: 'Standard foul' },
  { value: 'unsportsmanlike', label: 'Unsportsmanlike', description: 'Excessive contact' },
  { value: 'technical', label: 'Technical', description: 'Conduct violation' },
  { value: 'disqualifying', label: 'Disqualifying', description: 'Flagrant conduct' },
];

interface FoulTypeModalProps {
  player: PlayerData;
  isOpen: boolean;
  onSelect: (type: FoulType) => void;
  onCancel: () => void;
}

export function FoulTypeModal({
  player,
  isOpen,
  onSelect,
  onCancel,
}: FoulTypeModalProps) {
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
        aria-labelledby="foul-modal-title"
      >
        {/* Header */}
        <div className="
          flex items-center justify-between
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
        ">
          <div>
            <h2
              id="foul-modal-title"
              className="text-text-primary font-heading font-semibold text-lg"
            >
              Foul Type
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

        {/* Content - Foul Type Grid */}
        <div className="px-[var(--space-5)] py-[var(--space-4)]">
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            {FOUL_TYPES.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => onSelect(value)}
                className="
                  min-h-[var(--tap-target-xl)]
                  px-[var(--space-3)]
                  flex flex-col items-center justify-center
                  bg-bg-tertiary
                  border-2 border-transparent
                  rounded-[var(--radius-lg)]
                  transition-all duration-[var(--duration-fast)]
                  hover:bg-bg-hover hover:border-accent/50
                  active:scale-[0.98]
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                "
              >
                <span className="text-text-primary font-heading font-semibold">
                  {label}
                </span>
                <span className="text-text-muted text-xs mt-1">
                  {description}
                </span>
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
