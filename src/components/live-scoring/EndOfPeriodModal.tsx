'use client';

import { useEffect } from 'react';
import type { Period } from '@/types';

// Period progression order
const PERIOD_ORDER: Period[] = ['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2', 'OT3'];

const PERIOD_LABELS: Record<Period, string> = {
  Q1: 'Quarter 1',
  Q2: 'Quarter 2',
  Q3: 'Quarter 3',
  Q4: 'Quarter 4',
  OT1: 'Overtime 1',
  OT2: 'Overtime 2',
  OT3: 'Overtime 3',
};

interface EndOfPeriodModalProps {
  currentPeriod: Period;
  isOpen: boolean;
  onConfirm: (nextPeriod: Period) => void;
  onDismiss: () => void;
}

/**
 * Get the next period in sequence
 */
function getNextPeriod(currentPeriod: Period): Period | null {
  const currentIndex = PERIOD_ORDER.indexOf(currentPeriod);
  if (currentIndex === -1 || currentIndex === PERIOD_ORDER.length - 1) {
    return null; // No next period (already at OT3 or invalid)
  }
  return PERIOD_ORDER[currentIndex + 1];
}

export function EndOfPeriodModal({
  currentPeriod,
  isOpen,
  onConfirm,
  onDismiss,
}: EndOfPeriodModalProps) {
  const nextPeriod = getNextPeriod(currentPeriod);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (nextPeriod) {
      onConfirm(nextPeriod);
    }
  };

  // If we're at OT3, show game end message
  const isLastPeriod = !nextPeriod;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        backdrop-blur-sm
      "
      onClick={onDismiss}
    >
      <div
        className="
          w-full max-w-sm mx-4
          bg-surface-elevated
          border border-border
          rounded-[var(--radius-xl)]
          shadow-[var(--shadow-xl)]
          animate-slide-up
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="end-period-title"
        aria-describedby="end-period-desc"
      >
        {/* Header */}
        <div className="
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
          text-center
        ">
          {/* Clock icon */}
          <div className="
            w-14 h-14 mx-auto mb-[var(--space-3)]
            flex items-center justify-center
            bg-primary/15
            rounded-full
          ">
            <svg
              className="w-7 h-7 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2
            id="end-period-title"
            className="text-text-primary font-heading font-bold text-xl"
          >
            End of {PERIOD_LABELS[currentPeriod]}
          </h2>
          <p
            id="end-period-desc"
            className="text-text-muted text-sm mt-[var(--space-1)]"
          >
            {isLastPeriod
              ? 'This is the final overtime period.'
              : `Ready to start ${PERIOD_LABELS[nextPeriod!]}?`}
          </p>
        </div>

        {/* Actions */}
        <div className="
          flex gap-[var(--space-3)]
          px-[var(--space-5)] py-[var(--space-4)]
        ">
          <button
            onClick={onDismiss}
            className="
              flex-1
              min-h-[var(--tap-target-md)]
              px-[var(--space-4)]
              bg-transparent
              border border-border
              rounded-[var(--radius-md)]
              text-text-secondary
              font-heading font-semibold
              hover:bg-bg-hover hover:text-text-primary
              transition-all duration-[var(--duration-fast)]
              active:scale-[0.98]
            "
          >
            {isLastPeriod ? 'Close' : 'Not Yet'}
          </button>

          {!isLastPeriod && (
            <button
              onClick={handleConfirm}
              className="
                flex-1
                min-h-[var(--tap-target-md)]
                px-[var(--space-4)]
                bg-primary
                text-text-inverse
                rounded-[var(--radius-md)]
                font-heading font-semibold
                hover:shadow-[var(--glow-primary)]
                transition-all duration-[var(--duration-fast)]
                active:scale-[0.98]
              "
            >
              Start {PERIOD_LABELS[nextPeriod!].split(' ')[0]} {PERIOD_LABELS[nextPeriod!].split(' ')[1]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
