'use client';

import { useEffect, useState } from 'react';
import type { PlayEventResponse, EventData, PlayerData } from '@/services/game-api';

// Shot types per FIBA/data-models.md
export type ShotType =
  | 'layup'
  | 'dunk'
  | 'jump_shot'
  | 'hook_shot'
  | 'tip_in'
  | 'floater'
  | 'fadeaway'
  | 'stepback'
  | 'pullup'
  | 'alley_oop'
  | 'putback';

// Shot zones per FIBA/data-models.md
export type ShotZone = 'paint' | 'mid_range' | 'three_point';

const SHOT_TYPES: { value: ShotType; label: string }[] = [
  { value: 'layup', label: 'Layup' },
  { value: 'dunk', label: 'Dunk' },
  { value: 'jump_shot', label: 'Jump Shot' },
  { value: 'hook_shot', label: 'Hook' },
  { value: 'floater', label: 'Floater' },
  { value: 'tip_in', label: 'Tip-in' },
  { value: 'fadeaway', label: 'Fadeaway' },
  { value: 'stepback', label: 'Stepback' },
  { value: 'pullup', label: 'Pull-up' },
  { value: 'alley_oop', label: 'Alley-oop' },
  { value: 'putback', label: 'Putback' },
];

export interface ShotDetails {
  shotType?: ShotType;
  shotZone?: ShotZone;
  isFastBreak?: boolean;
  isSecondChance?: boolean;
  assistedBy?: string;
}

interface ShotTypeModalProps {
  isOpen: boolean;
  event?: PlayEventResponse | null;
  playerName?: string;
  playerNumber?: number;
  // Assist props - only used for made shots
  teammates?: PlayerData[];
  teamColor?: string;
  onSave: (eventId: string, details: ShotDetails) => void;
  onCancel: () => void;
}

export function ShotTypeModal({
  isOpen,
  event,
  playerName,
  playerNumber,
  teammates = [],
  teamColor = '#00F5A0',
  onSave,
  onCancel,
}: ShotTypeModalProps) {
  // Initialize state from event data if editing
  const [selectedShotType, setSelectedShotType] = useState<ShotType | undefined>(
    event?.eventData?.shotType as ShotType | undefined
  );
  const [shotZone, setShotZone] = useState<ShotZone>(
    (event?.eventData?.shotZone as ShotZone) ?? 'mid_range'
  );
  const [isFastBreak, setIsFastBreak] = useState(
    event?.eventData?.isFastBreak ?? false
  );
  const [isSecondChance, setIsSecondChance] = useState(
    event?.eventData?.isSecondChance ?? false
  );
  const [assistedBy, setAssistedBy] = useState<string | undefined>(
    event?.eventData?.assistedBy as string | undefined
  );

  // Reset state when event changes
  useEffect(() => {
    if (event) {
      setSelectedShotType(event.eventData?.shotType as ShotType | undefined);
      setShotZone((event.eventData?.shotZone as ShotZone) ?? 'mid_range');
      setIsFastBreak(event.eventData?.isFastBreak ?? false);
      setIsSecondChance(event.eventData?.isSecondChance ?? false);
      setAssistedBy(event.eventData?.assistedBy as string | undefined);
    } else {
      setSelectedShotType(undefined);
      setShotZone('mid_range');
      setIsFastBreak(false);
      setIsSecondChance(false);
      setAssistedBy(undefined);
    }
  }, [event]);

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

  if (!isOpen || !event) return null;

  const handleSave = () => {
    onSave(event.id, {
      shotType: selectedShotType,
      shotZone,
      isFastBreak,
      isSecondChance,
      assistedBy,
    });
  };

  const isMadeShot = event.eventType === 'field_goal_made';
  const shotMadeOrMissed = isMadeShot ? 'Made' : 'Missed';
  const points = event.eventData?.points ?? 2;
  const showAssistSection = isMadeShot && teammates.length > 0;
  const isTwoPointer = points === 2;

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
        aria-labelledby="shot-modal-title"
      >
        {/* Header */}
        <div className="
          flex items-center justify-between
          px-[var(--space-5)] py-[var(--space-4)]
          border-b border-border
        ">
          <div>
            <h2
              id="shot-modal-title"
              className="text-text-primary font-heading font-semibold text-lg"
            >
              Shot Details
            </h2>
            <p className="text-text-muted text-sm">
              {playerNumber !== undefined && `#${playerNumber} `}
              {playerName} · {points}PT {shotMadeOrMissed}
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
        <div className="px-[var(--space-5)] py-[var(--space-4)] space-y-[var(--space-5)]">
          {/* Assist Attribution - Only for made shots */}
          {showAssistSection && (
            <div>
              <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-3)]">
                Assisted By
              </h3>
              <div className="grid grid-cols-5 gap-[var(--space-2)]">
                {teammates.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setAssistedBy(assistedBy === player.id ? undefined : player.id)}
                    className={`
                      min-h-[var(--tap-target-lg)]
                      flex flex-col items-center justify-center
                      rounded-[var(--radius-md)]
                      transition-all duration-[var(--duration-fast)]
                      ${assistedBy === player.id
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-bg-tertiary border-2 border-transparent hover:bg-bg-hover'
                      }
                      active:scale-[0.98]
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                    `}
                  >
                    <span
                      className="font-display text-lg leading-none"
                      style={{ color: assistedBy === player.id ? 'var(--color-primary)' : teamColor }}
                    >
                      {player.number}
                    </span>
                    <span className={`text-xs mt-0.5 max-w-full px-1 truncate ${
                      assistedBy === player.id ? 'text-primary' : 'text-text-muted'
                    }`}>
                      {player.name.split(' ').pop()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shot Qualifiers */}
          <div>
            <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-3)]">
              Qualifiers
            </h3>
            <div className="flex gap-[var(--space-3)]">
              <button
                onClick={() => setIsFastBreak(!isFastBreak)}
                className={`
                  flex-1
                  min-h-[var(--tap-target-md)]
                  px-[var(--space-4)]
                  flex items-center justify-center gap-[var(--space-2)]
                  rounded-[var(--radius-md)]
                  font-heading font-semibold text-sm
                  transition-all duration-[var(--duration-fast)]
                  ${isFastBreak
                    ? 'bg-highlight/20 border-2 border-highlight text-highlight'
                    : 'bg-bg-tertiary border-2 border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }
                  active:scale-[0.98]
                `}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Fastbreak
              </button>
              <button
                onClick={() => setIsSecondChance(!isSecondChance)}
                className={`
                  flex-1
                  min-h-[var(--tap-target-md)]
                  px-[var(--space-4)]
                  flex items-center justify-center gap-[var(--space-2)]
                  rounded-[var(--radius-md)]
                  font-heading font-semibold text-sm
                  transition-all duration-[var(--duration-fast)]
                  ${isSecondChance
                    ? 'bg-gold/20 border-2 border-gold text-gold'
                    : 'bg-bg-tertiary border-2 border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }
                  active:scale-[0.98]
                `}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                2nd Chance
              </button>
            </div>
          </div>

          {/* Shot Zone - Only for 2-point shots */}
          {isTwoPointer && (
            <div>
              <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-3)]">
                Shot Zone
              </h3>
              <div className="flex gap-[var(--space-3)]">
                <button
                  onClick={() => setShotZone('paint')}
                  className={`
                    flex-1
                    min-h-[var(--tap-target-md)]
                    px-[var(--space-4)]
                    flex items-center justify-center gap-[var(--space-2)]
                    rounded-[var(--radius-md)]
                    font-heading font-semibold text-sm
                    transition-all duration-[var(--duration-fast)]
                    ${shotZone === 'paint'
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-bg-tertiary border-2 border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }
                    active:scale-[0.98]
                  `}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                  </svg>
                  Paint
                </button>
                <button
                  onClick={() => setShotZone('mid_range')}
                  className={`
                    flex-1
                    min-h-[var(--tap-target-md)]
                    px-[var(--space-4)]
                    flex items-center justify-center gap-[var(--space-2)]
                    rounded-[var(--radius-md)]
                    font-heading font-semibold text-sm
                    transition-all duration-[var(--duration-fast)]
                    ${shotZone === 'mid_range'
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-bg-tertiary border-2 border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }
                    active:scale-[0.98]
                  `}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  Mid-Range
                </button>
              </div>
            </div>
          )}

          {/* Shot Types */}
          <div>
            <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-3)]">
              Shot Type
            </h3>
            <div className="grid grid-cols-4 gap-[var(--space-2)]">
              {SHOT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedShotType(selectedShotType === value ? undefined : value)}
                  className={`
                    min-h-[var(--tap-target-md)]
                    px-[var(--space-2)]
                    flex items-center justify-center
                    rounded-[var(--radius-md)]
                    font-heading font-semibold text-sm
                    transition-all duration-[var(--duration-fast)]
                    ${selectedShotType === value
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-bg-tertiary border-2 border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }
                    active:scale-[0.98]
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
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
            onClick={handleSave}
            className="
              min-h-[var(--tap-target-md)]
              px-[var(--space-5)]
              bg-primary
              rounded-[var(--radius-md)]
              text-text-inverse
              font-heading font-semibold
              hover:shadow-[var(--glow-primary)]
              transition-all duration-[var(--duration-fast)]
              active:scale-[0.98]
            "
          >
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
}
