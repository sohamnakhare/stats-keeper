'use client';

import type { Period } from '@/types';

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
}

interface ScoreHeaderProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  period: Period;
  possession: 'home' | 'away' | null;
  onPossessionChange?: (team: 'home' | 'away') => void;
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
  clock,
}: ScoreHeaderProps) {
  return (
    <header className="
      w-full
      bg-surface
      border-b border-border
      px-[var(--space-4)]
      py-[var(--space-3)]
    ">
      <div className="
        max-w-7xl mx-auto
        flex items-center justify-between
        gap-[var(--space-4)]
      ">
        {/* Home Team */}
        <div 
          className="flex-1 flex items-center gap-[var(--space-3)] cursor-pointer group"
          onClick={() => onPossessionChange?.('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onPossessionChange?.('home')}
        >
          <div 
            className="
              w-3 h-3 rounded-full
              transition-all duration-[var(--duration-fast)]
            "
            style={{ 
              backgroundColor: possession === 'home' ? homeTeam.color : 'transparent',
              border: `2px solid ${homeTeam.color}`,
            }}
            aria-label={possession === 'home' ? 'Home team has possession' : ''}
          />
          <div className="flex flex-col">
            <span className="
              text-text-muted text-xs font-medium uppercase tracking-wide
            ">
              Home
            </span>
            <span className="
              text-text-primary font-heading font-semibold text-lg
              group-hover:text-primary transition-colors
            ">
              {homeTeam.shortName}
            </span>
          </div>
          <span 
            className="
              font-display text-[48px] leading-none ml-auto
              transition-transform duration-[var(--duration-fast)]
            "
            style={{ color: homeTeam.color }}
          >
            {homeTeam.score}
          </span>
        </div>

        {/* Period & Clock Display */}
        <div className="
          flex flex-col items-center
          px-[var(--space-6)]
          min-w-[140px]
        ">
          {/* Period Label */}
          <span className="
            text-text-muted text-xs font-medium uppercase tracking-wide
          ">
            {PERIOD_LABELS[period]}
          </span>

          {/* Clock Display */}
          {clock ? (
            <div className="flex flex-col items-center">
              <span 
                className={`
                  font-display text-[40px] leading-none tracking-tight
                  transition-colors duration-[var(--duration-fast)]
                  ${clock.isRunning ? 'text-primary' : 'text-text-primary'}
                `}
              >
                {clock.displayTime}
              </span>

              {/* Clock Controls */}
              <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-2)]">
                {clock.isRunning ? (
                  <button
                    onClick={clock.onPause}
                    className="
                      flex items-center justify-center
                      w-8 h-8
                      rounded-full
                      bg-accent/20
                      hover:bg-accent/30
                      transition-colors
                    "
                    aria-label="Pause clock"
                  >
                    <svg
                      className="w-4 h-4 text-accent"
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
                    className="
                      flex items-center justify-center
                      w-8 h-8
                      rounded-full
                      bg-primary/20
                      hover:bg-primary/30
                      transition-colors
                    "
                    aria-label="Start clock"
                  >
                    <svg
                      className="w-4 h-4 text-primary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={clock.onReset}
                  className="
                    flex items-center justify-center
                    w-8 h-8
                    rounded-full
                    bg-text-muted/10
                    hover:bg-text-muted/20
                    transition-colors
                  "
                  aria-label="Reset clock"
                >
                  <svg
                    className="w-4 h-4 text-text-muted"
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
            </div>
          ) : (
            <>
              <span className="
                text-text-primary font-heading font-bold text-2xl
              ">
                {PERIOD_LABELS[period]}
              </span>
              <div className="
                flex items-center gap-1 mt-1
              ">
                <span className="
                  w-2 h-2 rounded-full bg-[#FF3366]
                  animate-live-pulse
                " />
                <span className="
                  text-[#FF3366] text-xs font-semibold uppercase
                ">
                  Live
                </span>
              </div>
            </>
          )}

          {/* Live indicator when clock is present */}
          {clock && (
            <div className="
              flex items-center gap-1 mt-1
            ">
              <span className={`
                w-2 h-2 rounded-full
                ${clock.isRunning ? 'bg-[#FF3366] animate-live-pulse' : 'bg-text-muted'}
              `} />
              <span className={`
                text-xs font-semibold uppercase
                ${clock.isRunning ? 'text-[#FF3366]' : 'text-text-muted'}
              `}>
                {clock.isRunning ? 'Live' : 'Paused'}
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div 
          className="flex-1 flex items-center gap-[var(--space-3)] flex-row-reverse cursor-pointer group"
          onClick={() => onPossessionChange?.('away')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onPossessionChange?.('away')}
        >
          <div 
            className="
              w-3 h-3 rounded-full
              transition-all duration-[var(--duration-fast)]
            "
            style={{ 
              backgroundColor: possession === 'away' ? awayTeam.color : 'transparent',
              border: `2px solid ${awayTeam.color}`,
            }}
            aria-label={possession === 'away' ? 'Away team has possession' : ''}
          />
          <div className="flex flex-col items-end">
            <span className="
              text-text-muted text-xs font-medium uppercase tracking-wide
            ">
              Away
            </span>
            <span className="
              text-text-primary font-heading font-semibold text-lg
              group-hover:text-primary transition-colors
            ">
              {awayTeam.shortName}
            </span>
          </div>
          <span 
            className="
              font-display text-[48px] leading-none mr-auto
              transition-transform duration-[var(--duration-fast)]
            "
            style={{ color: awayTeam.color }}
          >
            {awayTeam.score}
          </span>
        </div>
      </div>
    </header>
  );
}
