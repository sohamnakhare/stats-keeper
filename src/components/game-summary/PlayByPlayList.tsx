'use client';

import { useState, useMemo } from 'react';
import type { PlayEventResponse, TeamData } from '@/services/game-api';
import type { EventType, Period, PlayByPlayFilters } from '@/types';
import { Card, Button } from '@/components/ui';

interface PlayByPlayListProps {
  events: PlayEventResponse[];
  homeTeam: TeamData;
  awayTeam: TeamData;
  onEventEdit?: (event: PlayEventResponse) => void;
  onEventDelete?: (eventId: string) => void;
}

const EVENT_LABELS: Record<EventType, string> = {
  field_goal_made: 'FG Made',
  field_goal_missed: 'FG Missed',
  free_throw_made: 'FT Made',
  free_throw_missed: 'FT Missed',
  offensive_rebound: 'OFF REB',
  defensive_rebound: 'DEF REB',
  team_rebound: 'Team REB',
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

const PERIOD_OPTIONS = [
  { value: '', label: 'All Periods' },
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
  { value: 'OT1', label: 'OT1' },
  { value: 'OT2', label: 'OT2' },
  { value: 'OT3', label: 'OT3' },
];

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'scoring', label: 'Scoring' },
  { value: 'field_goal_made', label: 'Field Goals Made' },
  { value: 'field_goal_missed', label: 'Field Goals Missed' },
  { value: 'free_throw', label: 'Free Throws' },
  { value: 'rebound', label: 'Rebounds' },
  { value: 'assist', label: 'Assists' },
  { value: 'turnover', label: 'Turnovers' },
  { value: 'steal', label: 'Steals' },
  { value: 'block', label: 'Blocks' },
  { value: 'foul', label: 'Fouls' },
  { value: 'substitution', label: 'Substitutions' },
];

function formatEventDescription(event: PlayEventResponse): string {
  const points = event.eventData?.points;

  switch (event.eventType) {
    case 'field_goal_made':
      return `${points}PT Made`;
    case 'field_goal_missed':
      return `${points}PT Miss`;
    case 'free_throw_made':
      return 'FT Made';
    case 'free_throw_missed':
      return 'FT Miss';
    case 'turnover':
      return event.eventData?.turnoverType
        ? `T/O (${event.eventData.turnoverType.replace(/_/g, ' ')})`
        : 'Turnover';
    case 'foul':
      return event.eventData?.foulType
        ? `${event.eventData.foulType.replace(/_/g, ' ')} Foul`
        : 'Foul';
    case 'substitution':
      return 'Substitution';
    default:
      return EVENT_LABELS[event.eventType] || event.eventType;
  }
}

export function PlayByPlayList({
  events,
  homeTeam,
  awayTeam,
  onEventEdit,
  onEventDelete,
}: PlayByPlayListProps) {
  const [filters, setFilters] = useState<PlayByPlayFilters>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Generate team options
  const teamOptions = [
    { value: '', label: 'All Teams' },
    { value: homeTeam.id, label: homeTeam.name },
    { value: awayTeam.id, label: awayTeam.name },
  ];

  // Helper to get team info
  const getTeamInfo = (teamId: string) => {
    if (teamId === homeTeam.id) {
      return { name: homeTeam.shortName, color: homeTeam.color };
    }
    return { name: awayTeam.shortName, color: awayTeam.color };
  };

  // Helper to get player info
  const getPlayerInfo = (playerId: string | null, teamId: string) => {
    if (!playerId) return null;
    const team = teamId === homeTeam.id ? homeTeam : awayTeam;
    return team.players.find((p) => p.id === playerId);
  };

  // Filter and group events
  const filteredAndGroupedEvents = useMemo(() => {
    // Apply filters
    let filtered = [...events];

    if (filters.period) {
      filtered = filtered.filter((e) => e.period === filters.period);
    }

    if (filters.teamId) {
      filtered = filtered.filter((e) => e.teamId === filters.teamId);
    }

    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filtered = filtered.filter((e) => {
        // Handle grouped event types
        if (filters.eventTypes?.includes('scoring' as EventType)) {
          if (e.eventType === 'field_goal_made' || e.eventType === 'free_throw_made') {
            return true;
          }
        }
        if (filters.eventTypes?.includes('free_throw' as EventType)) {
          if (e.eventType === 'free_throw_made' || e.eventType === 'free_throw_missed') {
            return true;
          }
        }
        if (filters.eventTypes?.includes('rebound' as EventType)) {
          if (
            e.eventType === 'offensive_rebound' ||
            e.eventType === 'defensive_rebound' ||
            e.eventType === 'team_rebound'
          ) {
            return true;
          }
        }
        return filters.eventTypes?.includes(e.eventType);
      });
    }

    // Sort chronologically (earliest first for play-by-play)
    filtered.sort((a, b) => {
      const periodOrder = ['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2', 'OT3'];
      const periodDiff =
        periodOrder.indexOf(a.period) - periodOrder.indexOf(b.period);
      if (periodDiff !== 0) return periodDiff;

      // Within same period, sort by game time (descending - higher time = earlier)
      const [aMin, aSec] = a.gameTime.split(':').map(Number);
      const [bMin, bSec] = b.gameTime.split(':').map(Number);
      const aTime = aMin * 60 + aSec;
      const bTime = bMin * 60 + bSec;
      return bTime - aTime;
    });

    // Group by period
    const grouped: Record<string, PlayEventResponse[]> = {};
    for (const event of filtered) {
      if (!grouped[event.period]) {
        grouped[event.period] = [];
      }
      grouped[event.period].push(event);
    }

    return grouped;
  }, [events, filters]);

  // Handle filter changes
  const handlePeriodChange = (value: string) => {
    setFilters((prev) => ({ ...prev, period: value as Period | undefined }));
  };

  const handleTeamChange = (value: string) => {
    setFilters((prev) => ({ ...prev, teamId: value || undefined }));
  };

  const handleTypeChange = (value: string) => {
    if (!value) {
      setFilters((prev) => ({ ...prev, eventTypes: undefined }));
    } else {
      setFilters((prev) => ({ ...prev, eventTypes: [value as EventType] }));
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (eventId: string) => {
    if (confirmDeleteId === eventId) {
      onEventDelete?.(eventId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(eventId);
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const periods = Object.keys(filteredAndGroupedEvents);

  return (
    <Card className="overflow-hidden">
      <div className="p-[var(--space-4)]">
        {/* Header with Filters */}
        <div className="flex flex-col gap-[var(--space-3)] mb-[var(--space-4)]">
          <h3 className="font-heading text-lg font-semibold text-text-primary">
            Play-by-Play
          </h3>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <select
              value={filters.period || ''}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="
                min-w-[120px] min-h-[var(--tap-target-min)] px-3 text-sm
                bg-bg-tertiary border border-border rounded-[var(--radius-md)]
                text-text-primary cursor-pointer
                focus:outline-none focus:border-border-focus
              "
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.teamId || ''}
              onChange={(e) => handleTeamChange(e.target.value)}
              className="
                min-w-[140px] min-h-[var(--tap-target-min)] px-3 text-sm
                bg-bg-tertiary border border-border rounded-[var(--radius-md)]
                text-text-primary cursor-pointer
                focus:outline-none focus:border-border-focus
              "
            >
              {teamOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.eventTypes?.[0] || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="
                min-w-[140px] min-h-[var(--tap-target-min)] px-3 text-sm
                bg-bg-tertiary border border-border rounded-[var(--radius-md)]
                text-text-primary cursor-pointer
                focus:outline-none focus:border-border-focus
              "
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.period || filters.teamId || filters.eventTypes) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
                className="text-text-muted hover:text-text-primary"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="max-h-[500px] overflow-y-auto space-y-[var(--space-4)]">
          {periods.length === 0 ? (
            <p className="text-text-muted text-sm italic text-center py-[var(--space-6)]">
              No plays match the current filters
            </p>
          ) : (
            periods.map((period) => (
              <div key={period}>
                {/* Period Header */}
                <div className="sticky top-0 bg-surface z-10 py-[var(--space-2)] border-b border-border mb-[var(--space-2)]">
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-wide">
                    {period}
                  </span>
                </div>

                {/* Events in Period */}
                <div className="space-y-[var(--space-1)]">
                  {filteredAndGroupedEvents[period].map((event) => {
                    const team = getTeamInfo(event.teamId);
                    const player = getPlayerInfo(event.playerId, event.teamId);
                    const isScoring =
                      event.eventType === 'field_goal_made' ||
                      event.eventType === 'free_throw_made';
                    const assister =
                      event.eventType === 'field_goal_made' &&
                      event.eventData?.assistedBy
                        ? getPlayerInfo(event.eventData.assistedBy, event.teamId)
                        : null;
                    const isDeleting = confirmDeleteId === event.id;

                    return (
                      <div
                        key={event.id}
                        className={`
                          flex items-center gap-[var(--space-2)] py-[var(--space-2)] px-[var(--space-3)]
                          bg-bg-tertiary rounded-[var(--radius-md)]
                          hover:bg-bg-hover transition-colors group
                        `}
                      >
                        {/* Time */}
                        <span className="text-text-muted text-xs font-mono w-12 shrink-0">
                          {event.gameTime}
                        </span>

                        {/* Team Indicator */}
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />

                        {/* Team Name */}
                        <span
                          className="text-xs font-semibold w-10 shrink-0"
                          style={{ color: team.color }}
                        >
                          {team.name}
                        </span>

                        {/* Player & Event Description */}
                        <div className="flex-1 min-w-0">
                          <span className="text-text-primary text-sm">
                            {player && `#${player.number} ${player.name.split(' ').pop()} `}
                          </span>
                          <span className="text-text-secondary text-sm">
                            {formatEventDescription(event)}
                          </span>
                          {assister && (
                            <span className="text-highlight text-sm ml-1">
                              (AST #{assister.number})
                            </span>
                          )}

                          {/* Shot detail badges */}
                          {event.eventData?.isFastBreak && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-highlight/20 text-highlight rounded font-medium">
                              FB
                            </span>
                          )}
                          {event.eventData?.isSecondChance && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-gold/20 text-gold rounded font-medium">
                              2ND
                            </span>
                          )}
                        </div>

                        {/* Points Badge */}
                        {isScoring && (
                          <span className="text-primary font-bold text-xs px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                            +
                            {event.eventType === 'free_throw_made'
                              ? 1
                              : event.eventData?.points || 2}
                          </span>
                        )}

                        {/* Action Buttons (shown on hover) */}
                        <div className="flex items-center gap-[var(--space-1)] opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEventEdit && (
                            <button
                              onClick={() => onEventEdit(event)}
                              className="p-1 text-text-muted hover:text-highlight transition-colors"
                              title="Edit event"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                          {onEventDelete && (
                            <button
                              onClick={() => handleDeleteClick(event.id)}
                              className={`
                                p-1 transition-colors
                                ${isDeleting ? 'text-accent' : 'text-text-muted hover:text-accent'}
                              `}
                              title={isDeleting ? 'Click again to confirm' : 'Delete event'}
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                {isDeleting && (
                                  <>
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                  </>
                                )}
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="mt-[var(--space-4)] pt-[var(--space-3)] border-t border-border">
          <span className="text-text-muted text-xs">
            {events.length} total plays
            {filters.period || filters.teamId || filters.eventTypes
              ? ` (${Object.values(filteredAndGroupedEvents).flat().length} shown)`
              : ''}
          </span>
        </div>
      </div>
    </Card>
  );
}
