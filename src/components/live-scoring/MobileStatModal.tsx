'use client';

import { useEffect } from 'react';
import type { QuickStatInput } from '@/hooks/useLiveGame';

interface MobileStatModalProps {
  isOpen: boolean;
  playerName: string;
  playerNumber: number;
  teamColor: string;
  isOnCourt: boolean;
  onStatRecord: (stat: QuickStatInput) => void;
  onFreeThrowClick: () => void;
  onTurnoverClick: () => void;
  onFoulClick: () => void;
  onSubstitutionClick: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export function MobileStatModal({
  isOpen,
  playerName,
  playerNumber,
  teamColor,
  isOnCourt,
  onStatRecord,
  onFreeThrowClick,
  onTurnoverClick,
  onFoulClick,
  onSubstitutionClick,
  onClose,
  isSaving,
}: MobileStatModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShot = (points: 2 | 3, made: boolean) => {
    onStatRecord({ statType: 'shot', points, made });
    onClose();
  };

  const handleStat = (statType: QuickStatInput['statType']) => {
    onStatRecord({ statType });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
      {/* Header - Compact */}
      <div 
        className="flex items-center justify-between px-3 py-2 border-b border-border"
        style={{ backgroundColor: `${teamColor}15` }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-lg active:bg-black/10"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <span 
            className="font-display text-3xl leading-none"
            style={{ color: teamColor }}
          >
            #{playerNumber}
          </span>
          <span className="font-heading font-bold text-lg text-text-primary uppercase truncate max-w-[150px]">
            {playerName}
          </span>
          {isSaving && (
            <svg className="animate-spin h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
        
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Stats Grid - Compact layout */}
      <div className="flex-1 p-3 flex flex-col gap-3">
        {/* Shots - 4 columns */}
        <section>
          <h3 className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1.5">
            Shots
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            <StatTile
              label="2PT"
              sublabel="✓"
              variant="success"
              onClick={() => handleShot(2, true)}
            />
            <StatTile
              label="2PT"
              sublabel="✗"
              variant="danger"
              onClick={() => handleShot(2, false)}
            />
            <StatTile
              label="3PT"
              sublabel="✓"
              variant="success"
              onClick={() => handleShot(3, true)}
            />
            <StatTile
              label="3PT"
              sublabel="✗"
              variant="danger"
              onClick={() => handleShot(3, false)}
            />
          </div>
        </section>

        {/* Other Stats - 4 columns */}
        <section>
          <h3 className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1.5">
            Stats
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            <StatTile
              label="REB"
              onClick={() => handleStat('rebound')}
            />
            <StatTile
              label="AST"
              onClick={() => handleStat('assist')}
            />
            <StatTile
              label="STL"
              onClick={() => handleStat('steal')}
            />
            <StatTile
              label="BLK"
              onClick={() => handleStat('block')}
            />
          </div>
        </section>

        {/* Free Throws, Turnovers, Fouls - 3 columns */}
        <section>
          <h3 className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1.5">
            Other
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            <StatTile
              label="FT"
              onClick={() => { onFreeThrowClick(); }}
            />
            <StatTile
              label="T/O"
              variant="warning"
              onClick={() => { onTurnoverClick(); }}
            />
            <StatTile
              label="FOUL"
              variant="warning"
              onClick={() => { onFoulClick(); }}
            />
          </div>
        </section>

        {/* Substitution */}
        {isOnCourt && (
          <section>
            <div className="grid grid-cols-1 gap-1.5">
              <StatTile
                label="SUB OUT"
                sublabel="↔"
                onClick={() => { onSubstitutionClick(); }}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================
// Stat Tile Component
// ============================================

interface StatTileProps {
  label: string;
  sublabel?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  onClick: () => void;
}

function StatTile({
  label,
  sublabel,
  variant = 'default',
  onClick,
}: StatTileProps) {
  const variantClasses = {
    default: 'bg-surface hover:bg-bg-hover border-border',
    success: 'bg-[rgba(0,245,160,0.15)] hover:bg-[rgba(0,245,160,0.25)] border-primary/40',
    danger: 'bg-[rgba(255,107,53,0.15)] hover:bg-[rgba(255,107,53,0.25)] border-accent/40',
    warning: 'bg-[rgba(255,215,0,0.15)] hover:bg-[rgba(255,215,0,0.25)] border-gold/40',
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
      className={`
        min-h-[56px] py-2
        flex flex-col items-center justify-center
        border-2 rounded-lg
        transition-all duration-100
        active:scale-[0.96]
        ${variantClasses[variant]}
      `}
    >
      <span className={`font-heading font-bold text-sm ${textClasses[variant]}`}>
        {label}
      </span>
      {sublabel && (
        <span className={`text-xs ${textClasses[variant]} opacity-70`}>{sublabel}</span>
      )}
    </button>
  );
}
