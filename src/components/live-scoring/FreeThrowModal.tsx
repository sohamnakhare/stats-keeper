'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerData } from '@/services/game-api';

interface FreeThrowModalProps {
  player: PlayerData;
  isOpen: boolean;
  onComplete: (results: boolean[]) => void;
  onCancel: () => void;
}

export function FreeThrowModal({
  player,
  isOpen,
  onComplete,
  onCancel,
}: FreeThrowModalProps) {
  const [freeThrows, setFreeThrows] = useState<1 | 2 | 3>(2);
  const [results, setResults] = useState<(boolean | null)[]>([null, null, null]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFreeThrows(2);
      setResults([null, null, null]);
    }
  }, [isOpen]);

  // Handle result change for a specific FT
  const handleResult = useCallback((index: number, made: boolean) => {
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = made;
      return newResults;
    });
  }, []);

  // Check if all required FTs are recorded
  const allRecorded = results.slice(0, freeThrows).every((r) => r !== null);

  // Handle completion
  const handleComplete = useCallback(() => {
    const finalResults = results.slice(0, freeThrows).filter((r): r is boolean => r !== null);
    onComplete(finalResults);
  }, [freeThrows, results, onComplete]);

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
        aria-labelledby="ft-modal-title"
      >
        {/* Header */}
        <div className="
          flex items-center justify-between
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
        ">
          <div>
            <h2
              id="ft-modal-title"
              className="text-text-primary font-heading font-semibold text-lg"
            >
              Free Throws
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

        {/* Content */}
        <div className="px-[var(--space-5)] py-[var(--space-4)]">
          {/* Number of FTs selector */}
          <div className="mb-[var(--space-5)]">
            <label className="text-text-muted text-xs font-medium uppercase tracking-wide block mb-[var(--space-2)]">
              Number of Free Throws
            </label>
            <div className="flex gap-[var(--space-2)]">
              {([1, 2, 3] as const).map((num) => (
                <button
                  key={num}
                  onClick={() => setFreeThrows(num)}
                  className={`
                    flex-1
                    min-h-[var(--tap-target-md)]
                    flex items-center justify-center
                    border-2
                    rounded-[var(--radius-md)]
                    font-heading font-bold text-lg
                    transition-all duration-[var(--duration-fast)]
                    ${freeThrows === num
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-bg-tertiary border-transparent text-text-secondary hover:border-border'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* FT Results */}
          <div className="space-y-[var(--space-3)]">
            {Array.from({ length: freeThrows }).map((_, index) => (
              <div key={index} className="flex items-center gap-[var(--space-3)]">
                <span className="
                  w-12 text-text-secondary font-medium
                ">
                  FT {index + 1}:
                </span>
                <div className="flex-1 flex gap-[var(--space-2)]">
                  <button
                    onClick={() => handleResult(index, true)}
                    className={`
                      flex-1
                      min-h-[var(--tap-target-md)]
                      flex items-center justify-center gap-[var(--space-2)]
                      border-2
                      rounded-[var(--radius-md)]
                      font-heading font-semibold
                      transition-all duration-[var(--duration-fast)]
                      ${results[index] === true
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-bg-tertiary border-transparent text-text-secondary hover:border-primary/50'
                      }
                    `}
                  >
                    <span className="text-lg">✓</span>
                    MADE
                  </button>
                  <button
                    onClick={() => handleResult(index, false)}
                    className={`
                      flex-1
                      min-h-[var(--tap-target-md)]
                      flex items-center justify-center gap-[var(--space-2)]
                      border-2
                      rounded-[var(--radius-md)]
                      font-heading font-semibold
                      transition-all duration-[var(--duration-fast)]
                      ${results[index] === false
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-bg-tertiary border-transparent text-text-secondary hover:border-accent/50'
                      }
                    `}
                  >
                    <span className="text-lg">✗</span>
                    MISS
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          <button
            onClick={handleComplete}
            disabled={!allRecorded}
            className="
              min-h-[var(--tap-target-md)]
              px-[var(--space-5)]
              bg-primary
              text-text-inverse
              rounded-[var(--radius-md)]
              font-heading font-semibold
              hover:shadow-[var(--glow-primary)]
              active:scale-[0.98]
              disabled:opacity-50 disabled:pointer-events-none
              transition-all duration-[var(--duration-fast)]
            "
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
