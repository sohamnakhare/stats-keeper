'use client';

import { useState, useRef, useEffect } from 'react';
import type { Period } from '@/types';
import { PeriodSelector } from './PeriodSelector';

/**
 * Parse MM:SS string to milliseconds
 */
function parseClockTime(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  if (seconds >= 60) return null;
  return (minutes * 60 + seconds) * 1000;
}

interface TeamInfo {
  name: string;
  shortName: string;
  score: number;
  color: string;
}

interface ClockInfo {
  displayTime: string; // "MM:SS" format
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetTime?: (milliseconds: number) => Promise<void>;
}

interface ScoreHeaderProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  period: Period;
  possession: 'home' | 'away' | null;
  onPossessionChange?: (team: 'home' | 'away') => void;
  onPeriodChange?: (period: Period) => void;
  clock?: ClockInfo;
}

const PERIOD_LABELS: Record<Period, string> = {
  Q1: 'Q1',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4',
  OT1: 'OT1',
  OT2: 'OT2',
  OT3: 'OT3',
};

export function ScoreHeader({
  homeTeam,
  awayTeam,
  period,
  possession,
  onPossessionChange,
  onPeriodChange,
  clock,
}: ScoreHeaderProps) {
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [isEditingClock, setIsEditingClock] = useState(false);
  const [isUpdatingClock, setIsUpdatingClock] = useState(false);
  const [clockEditValue, setClockEditValue] = useState('');
  const [pendingClockValue, setPendingClockValue] = useState<string | null>(null);
  const clockInputRef = useRef<HTMLInputElement>(null);

  const handlePeriodSelect = (newPeriod: Period) => {
    onPeriodChange?.(newPeriod);
    setShowPeriodSelector(false);
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingClock && clockInputRef.current) {
      clockInputRef.current.focus();
      clockInputRef.current.select();
    }
  }, [isEditingClock]);

  const handleClockClick = () => {
    if (!clock?.onSetTime) return;
    // Pause clock if running before editing
    if (clock.isRunning) {
      clock.onPause();
    }
    setClockEditValue(clock.displayTime);
    setIsEditingClock(true);
  };

  const handleClockEditSubmit = async () => {
    const milliseconds = parseClockTime(clockEditValue);
    if (milliseconds !== null && clock?.onSetTime) {
      setIsEditingClock(false);
      setIsUpdatingClock(true);
      setPendingClockValue(clockEditValue);
      try {
        await clock.onSetTime(milliseconds);
      } finally {
        setIsUpdatingClock(false);
        setPendingClockValue(null);
      }
    } else {
      setIsEditingClock(false);
    }
  };

  const handleClockEditCancel = () => {
    setIsEditingClock(false);
  };

  const handleClockKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleClockEditSubmit();
    } else if (e.key === 'Escape') {
      handleClockEditCancel();
    }
  };

  return (
    <header className="
      w-full
      bg-surface
      border-b border-border
      px-[var(--space-2)] sm:px-[var(--space-4)]
      py-[var(--space-2)] sm:py-[var(--space-3)]
    ">
      <div className="max-w-7xl mx-auto flex flex-col gap-[var(--space-2)] sm:gap-[var(--space-3)]">
        {/* Row 1: Timer & Controls */}
        {clock && (
          <div className="flex items-center justify-center gap-[var(--space-4)] sm:gap-[var(--space-6)]">
            {/* Clock Controls - Play/Pause */}
            {clock.isRunning ? (
              <button
                onClick={clock.onPause}
                disabled={isUpdatingClock}
                className="
                  flex items-center justify-center
                  w-12 h-12 sm:w-14 sm:h-14
                  rounded-full
                  bg-accent/20
                  hover:bg-accent/30
                  active:scale-95
                  transition-all duration-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label="Pause clock"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-accent"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={clock.onStart}
                disabled={isUpdatingClock}
                className="
                  flex items-center justify-center
                  w-12 h-12 sm:w-14 sm:h-14
                  rounded-full
                  bg-primary/20
                  hover:bg-primary/30
                  active:scale-95
                  transition-all duration-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label="Start clock"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}

            {/* Clock Display */}
            <div className="flex flex-col items-center">
              {isEditingClock ? (
                <input
                  ref={clockInputRef}
                  type="text"
                  value={clockEditValue}
                  onChange={(e) => setClockEditValue(e.target.value)}
                  onBlur={handleClockEditSubmit}
                  onKeyDown={handleClockKeyDown}
                  className="
                    font-display text-[36px] sm:text-[48px] leading-none tracking-tight
                    text-text-primary text-center
                    bg-transparent border-b-2 border-primary
                    outline-none
                    w-[5ch]
                  "
                  placeholder="MM:SS"
                  aria-label="Edit clock time"
                />
              ) : isUpdatingClock ? (
                <div className="flex items-center gap-[var(--space-2)]">
                  <span
                    className="
                      font-display text-[36px] sm:text-[48px] leading-none tracking-tight
                      text-text-muted
                    "
                  >
                    {pendingClockValue}
                  </span>
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-spin"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={handleClockClick}
                  disabled={!clock.onSetTime}
                  className={`
                    font-display text-[36px] sm:text-[48px] leading-none tracking-tight
                    transition-colors duration-[var(--duration-fast)]
                    ${clock.isRunning ? 'text-primary' : 'text-text-primary'}
                    ${clock.onSetTime ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}
                  `}
                  aria-label="Click to edit clock time"
                >
                  {clock.displayTime}
                </button>
              )}
              {/* Live indicator */}
              <div className="flex items-center gap-1 mt-1">
                <span className={`
                  w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
                  ${clock.isRunning ? 'bg-[#FF3366] animate-live-pulse' : 'bg-text-muted'}
                `} />
                <span className={`
                  text-[10px] sm:text-xs font-semibold uppercase
                  ${clock.isRunning ? 'text-[#FF3366]' : 'text-text-muted'}
                `}>
                  {clock.isRunning ? 'Live' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Clock Controls - Reset */}
            <button
              onClick={clock.onReset}
              disabled={isUpdatingClock}
              className="
                flex items-center justify-center
                w-12 h-12 sm:w-14 sm:h-14
                rounded-full
                bg-text-muted/10
                hover:bg-text-muted/20
                active:scale-95
                transition-all duration-100
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Reset clock"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        )}

        {/* Row 2: Scores */}
      <div className="
        flex items-center justify-between
        gap-[var(--space-2)] sm:gap-[var(--space-4)]
      ">
        {/* Home Team */}
        <div 
          className="flex-1 flex items-center gap-[var(--space-1)] sm:gap-[var(--space-3)] cursor-pointer group"
          onClick={() => onPossessionChange?.('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onPossessionChange?.('home')}
        >
          <div 
            className="
              w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0
              transition-all duration-[var(--duration-fast)]
            "
            style={{ 
              backgroundColor: possession === 'home' ? homeTeam.color : 'transparent',
              border: `2px solid ${homeTeam.color}`,
            }}
            aria-label={possession === 'home' ? 'Home team has possession' : ''}
          />
          <div className="flex flex-col min-w-0">
            <span className="
              text-text-muted text-[10px] sm:text-xs font-medium uppercase tracking-wide hidden sm:block
            ">
              Home
            </span>
            <span className="
              text-text-primary font-heading font-semibold text-sm sm:text-lg truncate
              group-hover:text-primary transition-colors
            ">
              {homeTeam.shortName}
            </span>
          </div>
          <span 
            className="
              font-display text-[32px] sm:text-[48px] leading-none ml-auto
              transition-transform duration-[var(--duration-fast)]
            "
            style={{ color: homeTeam.color }}
          >
            {homeTeam.score}
          </span>
        </div>

          {/* Period Display */}
        <div className="
          flex flex-col items-center
          px-[var(--space-2)] sm:px-[var(--space-6)]
            min-w-[60px] sm:min-w-[100px]
          relative
        ">
          {/* Period Label - Tappable */}
          <button
            onClick={() => setShowPeriodSelector(!showPeriodSelector)}
            className="
                text-text-muted text-xs sm:text-sm font-medium uppercase tracking-wide
              px-[var(--space-2)] py-[var(--space-1)]
              rounded-[var(--radius-sm)]
              hover:bg-bg-hover hover:text-text-primary
              transition-all duration-[var(--duration-fast)]
              flex items-center gap-[var(--space-1)]
            "
            aria-label={`Current period: ${PERIOD_LABELS[period]}. Click to change.`}
            aria-expanded={showPeriodSelector}
            aria-haspopup="listbox"
          >
            {PERIOD_LABELS[period]}
            <svg
              className={`
                w-3 h-3 transition-transform duration-[var(--duration-fast)]
                ${showPeriodSelector ? 'rotate-180' : ''}
              `}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Period Selector Popup */}
          <PeriodSelector
            currentPeriod={period}
            isOpen={showPeriodSelector}
            onSelect={handlePeriodSelect}
            onClose={() => setShowPeriodSelector(false)}
          />

            {/* Live indicator when no clock */}
            {!clock && (
              <div className="flex items-center gap-1 mt-1">
                <span className="
                  w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF3366]
                  animate-live-pulse
                " />
                <span className="
                  text-[#FF3366] text-[10px] sm:text-xs font-semibold uppercase
                ">
                  Live
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div 
          className="flex-1 flex items-center gap-[var(--space-1)] sm:gap-[var(--space-3)] flex-row-reverse cursor-pointer group"
          onClick={() => onPossessionChange?.('away')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onPossessionChange?.('away')}
        >
          <div 
            className="
              w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0
              transition-all duration-[var(--duration-fast)]
            "
            style={{ 
              backgroundColor: possession === 'away' ? awayTeam.color : 'transparent',
              border: `2px solid ${awayTeam.color}`,
            }}
            aria-label={possession === 'away' ? 'Away team has possession' : ''}
          />
          <div className="flex flex-col items-end min-w-0">
            <span className="
              text-text-muted text-[10px] sm:text-xs font-medium uppercase tracking-wide hidden sm:block
            ">
              Away
            </span>
            <span className="
              text-text-primary font-heading font-semibold text-sm sm:text-lg truncate
              group-hover:text-primary transition-colors
            ">
              {awayTeam.shortName}
            </span>
          </div>
          <span 
            className="
              font-display text-[32px] sm:text-[48px] leading-none mr-auto
              transition-transform duration-[var(--duration-fast)]
            "
            style={{ color: awayTeam.color }}
          >
            {awayTeam.score}
          </span>
          </div>
        </div>
      </div>
    </header>
  );
}
