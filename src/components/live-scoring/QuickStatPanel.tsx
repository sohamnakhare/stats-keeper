'use client';

import type { QuickStatInput } from '@/hooks/useLiveGame';

interface QuickStatPanelProps {
  selectedPlayerName?: string;
  selectedPlayerNumber?: number;
  selectedPlayerIsOnCourt?: boolean;
  onStatRecord: (stat: QuickStatInput) => void;
  onShotRecorded?: (eventId: string) => void;
  onFreeThrowClick: () => void;
  onTurnoverClick: () => void;
  onFoulClick: () => void;
  onSubstitutionClick: () => void;
  onUndoClick: () => void;
  disabled: boolean;
  isUndoAvailable: boolean;
  isSaving: boolean;
}

export function QuickStatPanel({
  selectedPlayerName,
  selectedPlayerNumber,
  selectedPlayerIsOnCourt,
  onStatRecord,
  onShotRecorded,
  onFreeThrowClick,
  onTurnoverClick,
  onFoulClick,
  onSubstitutionClick,
  onUndoClick,
  disabled,
  isUndoAvailable,
  isSaving,
}: QuickStatPanelProps) {
  const handleShot = (points: 2 | 3, made: boolean) => {
    onStatRecord({ statType: 'shot', points, made });
    // The callback will be triggered from the parent after recordStat completes
  };

  const handleStat = (statType: QuickStatInput['statType']) => {
    onStatRecord({ statType });
  };

  return (
    <div className="
      bg-surface
      border border-border
      rounded-[var(--radius-lg)]
      p-[var(--space-4)]
    ">
      {/* Header with selected player */}
      <div className="
        flex items-center justify-between
        mb-[var(--space-4)]
        pb-[var(--space-3)]
        border-b border-border
      ">
        <div className="flex items-center gap-[var(--space-2)]">
          {selectedPlayerNumber !== undefined ? (
            <>
              <span className="
                font-display text-3xl text-primary leading-none
              ">
                #{selectedPlayerNumber}
              </span>
              <span className="
                font-heading font-semibold text-text-primary text-lg uppercase
              ">
                {selectedPlayerName}
              </span>
            </>
          ) : (
            <span className="text-text-muted italic">
              Select a player to record stats
            </span>
          )}
        </div>
        
        {/* Undo Button */}
        <button
          onClick={onUndoClick}
          disabled={!isUndoAvailable || isSaving}
          className="
            min-h-[var(--tap-target-min)]
            px-[var(--space-4)]
            flex items-center gap-[var(--space-2)]
            bg-bg-tertiary
            border border-border
            rounded-[var(--radius-md)]
            text-text-secondary
            font-heading font-semibold text-sm
            transition-all duration-[var(--duration-fast)]
            hover:bg-bg-hover hover:text-text-primary
            disabled:opacity-50 disabled:pointer-events-none
          "
          aria-label="Undo last action"
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
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
          UNDO
        </button>
      </div>

      {/* Shot Buttons */}
      <div className="mb-[var(--space-4)]">
        <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-2)]">
          Shots
        </h3>
        <div className="grid grid-cols-4 gap-[var(--space-2)]">
          <StatButton
            label="2PT"
            sublabel="MADE"
            icon="✓"
            variant="success"
            onClick={() => handleShot(2, true)}
            disabled={disabled}
          />
          <StatButton
            label="2PT"
            sublabel="MISS"
            icon="✗"
            variant="danger"
            onClick={() => handleShot(2, false)}
            disabled={disabled}
          />
          <StatButton
            label="3PT"
            sublabel="MADE"
            icon="✓"
            variant="success"
            onClick={() => handleShot(3, true)}
            disabled={disabled}
          />
          <StatButton
            label="3PT"
            sublabel="MISS"
            icon="✗"
            variant="danger"
            onClick={() => handleShot(3, false)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Other Stats */}
      <div className="mb-[var(--space-4)]">
        <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-2)]">
          Stats
        </h3>
        <div className="grid grid-cols-4 gap-[var(--space-2)]">
          <StatButton
            label="REB"
            onClick={() => handleStat('rebound')}
            disabled={disabled}
          />
          <StatButton
            label="AST"
            onClick={() => handleStat('assist')}
            disabled={disabled}
          />
          <StatButton
            label="STL"
            onClick={() => handleStat('steal')}
            disabled={disabled}
          />
          <StatButton
            label="BLK"
            onClick={() => handleStat('block')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Turnovers, Fouls, Free Throws, Substitution */}
      <div>
        <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-[var(--space-2)]">
          Other
        </h3>
        <div className="grid grid-cols-4 gap-[var(--space-2)]">
          <StatButton
            label="T/O"
            variant="warning"
            onClick={onTurnoverClick}
            disabled={disabled}
          />
          <StatButton
            label="FOUL"
            variant="warning"
            onClick={onFoulClick}
            disabled={disabled}
          />
          <StatButton
            label="FT"
            onClick={onFreeThrowClick}
            disabled={disabled}
          />
          <StatButton
            label="SUB"
            icon="↔"
            onClick={onSubstitutionClick}
            disabled={disabled || !selectedPlayerIsOnCourt}
          />
        </div>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="
          mt-[var(--space-3)]
          flex items-center justify-center gap-[var(--space-2)]
          text-text-muted text-sm
        ">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving...
        </div>
      )}
    </div>
  );
}

// ============================================
// Stat Button Component
// ============================================

interface StatButtonProps {
  label: string;
  sublabel?: string;
  icon?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  onClick: () => void;
  disabled: boolean;
}

function StatButton({
  label,
  sublabel,
  icon,
  variant = 'default',
  onClick,
  disabled,
}: StatButtonProps) {
  const variantClasses = {
    default: 'bg-bg-tertiary hover:bg-bg-hover border-transparent hover:border-primary/50',
    success: 'bg-[rgba(0,245,160,0.1)] hover:bg-[rgba(0,245,160,0.2)] border-primary/30',
    danger: 'bg-[rgba(255,107,53,0.1)] hover:bg-[rgba(255,107,53,0.2)] border-accent/30',
    warning: 'bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] border-gold/30',
  };

  const textClasses = {
    default: 'text-text-primary',
    success: 'text-primary',
    danger: 'text-accent',
    warning: 'text-gold',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        min-h-[var(--tap-target-lg)]
        flex flex-col items-center justify-center
        border-2
        rounded-[var(--radius-lg)]
        transition-all duration-[var(--duration-fast)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        active:scale-[0.98]
        disabled:opacity-40 disabled:pointer-events-none
        ${variantClasses[variant]}
      `}
      aria-label={sublabel ? `${label} ${sublabel}` : label}
    >
      {icon && (
        <span className={`text-lg ${textClasses[variant]}`}>
          {icon}
        </span>
      )}
      <span className={`
        font-heading font-bold text-sm
        ${textClasses[variant]}
      `}>
        {label}
      </span>
      {sublabel && (
        <span className="text-xs text-text-muted">
          {sublabel}
        </span>
      )}
    </button>
  );
}
