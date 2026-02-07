'use client';

import type { PlayEventResponse } from '@/services/game-api';
import type { EventType } from '@/types';

interface UndoButtonProps {
  lastEvent?: PlayEventResponse | null;
  onUndo: () => void;
  disabled: boolean;
}

const EVENT_LABELS: Record<EventType, string> = {
  field_goal_made: 'Shot Made',
  field_goal_missed: 'Shot Missed',
  free_throw_made: 'FT Made',
  free_throw_missed: 'FT Missed',
  offensive_rebound: 'Off Rebound',
  defensive_rebound: 'Def Rebound',
  team_rebound: 'Team Rebound',
  assist: 'Assist',
  turnover: 'Turnover',
  steal: 'Steal',
  block: 'Block',
  foul: 'Foul',
  substitution: 'Substitution',
  timeout: 'Timeout',
  period_start: 'Period Start',
  period_end: 'Period End',
};

export function UndoButton({ lastEvent, onUndo, disabled }: UndoButtonProps) {
  const eventLabel = lastEvent 
    ? EVENT_LABELS[lastEvent.eventType] || lastEvent.eventType
    : null;

  return (
    <button
      onClick={onUndo}
      disabled={disabled || !lastEvent}
      className="
        min-h-[var(--tap-target-md)]
        px-[var(--space-4)]
        flex items-center gap-[var(--space-2)]
        bg-bg-tertiary
        border border-border
        rounded-[var(--radius-md)]
        text-text-secondary
        font-heading font-semibold text-sm
        transition-all duration-[var(--duration-fast)]
        hover:bg-bg-hover hover:text-text-primary hover:border-accent/50
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        disabled:opacity-50 disabled:pointer-events-none
      "
      aria-label={lastEvent ? `Undo ${eventLabel}` : 'No action to undo'}
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
      <span>UNDO</span>
      {lastEvent && (
        <span className="text-text-muted text-xs ml-1">
          ({eventLabel})
        </span>
      )}
    </button>
  );
}
