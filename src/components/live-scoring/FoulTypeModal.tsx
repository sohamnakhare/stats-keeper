'use client';

import { useEffect, useState } from 'react';
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
  opponentPlayers: PlayerData[];
  isOpen: boolean;
  onSelect: (type: FoulType, drawnBy?: string) => void;
  onCancel: () => void;
}

type ModalStep = 'foul_type' | 'drawn_by';

export function FoulTypeModal({
  player,
  opponentPlayers,
  isOpen,
  onSelect,
  onCancel,
}: FoulTypeModalProps) {
  const [step, setStep] = useState<ModalStep>('foul_type');
  const [selectedFoulType, setSelectedFoulType] = useState<FoulType | null>(null);
  const [selectedDrawnBy, setSelectedDrawnBy] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('foul_type');
      setSelectedFoulType(null);
      setSelectedDrawnBy(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step === 'drawn_by') {
          setStep('foul_type');
          setSelectedFoulType(null);
        } else {
          onCancel();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, step]);

  if (!isOpen) return null;

  // Handle foul type selection - move to step 2
  const handleFoulTypeSelect = (type: FoulType) => {
    setSelectedFoulType(type);
    // For technical fouls, skip the drawn by step (usually not against a specific player)
    if (type === 'technical') {
      onSelect(type);
    } else {
      setStep('drawn_by');
    }
  };

  // Handle drawn by selection
  const handleDrawnBySelect = (playerId: string) => {
    setSelectedDrawnBy(playerId);
  };

  // Handle confirm with drawn by
  const handleConfirm = () => {
    if (selectedFoulType) {
      onSelect(selectedFoulType, selectedDrawnBy || undefined);
    }
  };

  // Handle skip - record foul without drawn by
  const handleSkip = () => {
    if (selectedFoulType) {
      onSelect(selectedFoulType);
    }
  };

  // Handle back to step 1
  const handleBack = () => {
    setStep('foul_type');
    setSelectedFoulType(null);
    setSelectedDrawnBy(null);
  };

  // Filter to only on-court opponents
  const onCourtOpponents = opponentPlayers.filter((p) => p.isOnCourt);

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
          <div className="flex items-center gap-[var(--space-3)]">
            {step === 'drawn_by' && (
              <button
                onClick={handleBack}
                className="
                  w-8 h-8
                  flex items-center justify-center
                  text-text-muted
                  hover:text-text-primary
                  transition-colors
                "
                aria-label="Back"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2
                id="foul-modal-title"
                className="text-text-primary font-heading font-semibold text-lg"
              >
                {step === 'foul_type' ? 'Foul Type' : 'Fouled On?'}
              </h2>
              <p className="text-text-muted text-sm">
                {step === 'foul_type' 
                  ? `#${player.number} ${player.name}`
                  : `${selectedFoulType?.charAt(0).toUpperCase()}${selectedFoulType?.slice(1)} foul by #${player.number}`
                }
              </p>
            </div>
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
          {step === 'foul_type' ? (
            /* Step 1: Foul Type Selection */
            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              {FOUL_TYPES.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => handleFoulTypeSelect(value)}
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
          ) : (
            /* Step 2: Drawn By Selection */
            <div className="space-y-[var(--space-4)]">
              <p className="text-text-secondary text-sm text-center">
                Select the opponent player who was fouled
              </p>
              
              {onCourtOpponents.length > 0 ? (
                <div className="grid grid-cols-3 gap-[var(--space-2)]">
                  {onCourtOpponents.map((opponent) => (
                    <button
                      key={opponent.id}
                      onClick={() => handleDrawnBySelect(opponent.id)}
                      className={`
                        min-h-[var(--tap-target-lg)]
                        px-[var(--space-2)]
                        flex flex-col items-center justify-center
                        border-2
                        rounded-[var(--radius-lg)]
                        transition-all duration-[var(--duration-fast)]
                        active:scale-[0.98]
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                        ${selectedDrawnBy === opponent.id
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-bg-tertiary border-transparent hover:bg-bg-hover hover:border-primary/30'
                        }
                      `}
                    >
                      <span className={`
                        font-display text-lg leading-none
                        ${selectedDrawnBy === opponent.id ? 'text-primary' : 'text-text-primary'}
                      `}>
                        #{opponent.number}
                      </span>
                      <span className={`
                        text-xs mt-1 truncate max-w-full px-1
                        ${selectedDrawnBy === opponent.id ? 'text-primary' : 'text-text-muted'}
                      `}>
                        {opponent.name.split(' ').pop()}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-[var(--space-4)]">
                  No opponents on court
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="
          flex justify-end gap-[var(--space-3)]
          px-[var(--space-5)] py-[var(--space-4)]
          border-t border-border
        ">
          {step === 'foul_type' ? (
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
          ) : (
            <>
              <button
                onClick={handleSkip}
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
                Skip
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedDrawnBy}
                className="
                  min-h-[var(--tap-target-md)]
                  px-[var(--space-5)]
                  bg-primary
                  border border-primary
                  rounded-[var(--radius-md)]
                  text-bg-primary
                  font-heading font-semibold
                  hover:bg-primary/90
                  transition-all duration-[var(--duration-fast)]
                  disabled:opacity-50 disabled:pointer-events-none
                "
              >
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
