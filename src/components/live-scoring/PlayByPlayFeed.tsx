'use client';

import { useState } from 'react';
import type { PlayEventResponse, TeamData } from '@/services/game-api';
import type { EventType } from '@/types';

interface PlayByPlayFeedProps {
  events: PlayEventResponse[];
  homeTeam: TeamData;
  awayTeam: TeamData;
  maxVisible?: number;
  onEventTap?: (event: PlayEventResponse) => void;
}

const EVENT_LABELS: Record<EventType, string> = {
  field_goal_made: 'Made',
  field_goal_missed: 'Missed',
  free_throw_made: 'FT Made',
  free_throw_missed: 'FT Miss',
  offensive_rebound: 'OFF REB',
  defensive_rebound: 'DEF REB',
  team_rebound: 'Team REB',
  assist: 'Assist',
  turnover: 'Turnover',
  steal: 'Steal',
  block: 'Block',
  foul: 'Foul',
  substitution: 'Sub',
  timeout: 'Timeout',
  period_start: 'Period Start',
  period_end: 'Period End',
};

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
        ? `T/O (${event.eventData.turnoverType.replace('_', ' ')})`
        : 'Turnover';
    default:
      return EVENT_LABELS[event.eventType] || event.eventType;
  }
}

export function PlayByPlayFeed({
  events,
  homeTeam,
  awayTeam,
  maxVisible = 5,
  onEventTap,
}: PlayByPlayFeedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort events by timestamp (newest first) and limit
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const visibleEvents = isExpanded ? sortedEvents : sortedEvents.slice(0, maxVisible);

  // Helper to get team info
  const getTeamInfo = (teamId: string) => {
    if (teamId === homeTeam.id) {
      return { name: homeTeam.shortName, color: homeTeam.color, side: 'HOME' };
    }
    return { name: awayTeam.shortName, color: awayTeam.color, side: 'AWAY' };
  };

  // Helper to get player info
  const getPlayerInfo = (playerId: string | null, teamId: string) => {
    if (!playerId) return null;
    
    const team = teamId === homeTeam.id ? homeTeam : awayTeam;
    return team.players.find((p) => p.id === playerId);
  };

  if (events.length === 0) {
    return (
      <div className="
        bg-surface
        border border-border
        rounded-[var(--radius-lg)]
        p-[var(--space-4)]
      ">
        <div className="flex items-center justify-between mb-[var(--space-2)]">
          <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide">
            Play-by-Play
          </h3>
        </div>
        <p className="text-text-muted text-sm italic text-center py-[var(--space-4)]">
          No plays recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="
      bg-surface
      border border-border
      rounded-[var(--radius-lg)]
      p-[var(--space-4)]
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-[var(--space-3)]">
        <h3 className="text-text-muted text-xs font-medium uppercase tracking-wide">
          Play-by-Play
        </h3>
        {events.length > maxVisible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              text-text-muted text-xs font-medium
              hover:text-primary
              transition-colors
            "
          >
            {isExpanded ? 'Show Less' : `Show All (${events.length})`}
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-[var(--space-2)] max-h-[300px] overflow-y-auto">
        {visibleEvents.map((event, index) => {
          const team = getTeamInfo(event.teamId);
          const player = getPlayerInfo(event.playerId, event.teamId);
          const isShotEvent = event.eventType === 'field_goal_made' || event.eventType === 'field_goal_missed';
          const isMadeShot = event.eventType === 'field_goal_made';
          const isClickable = isShotEvent && onEventTap;
          
          // Show shot details badges if present
          const shotDetails = event.eventData;
          const hasShotDetails = isShotEvent && (shotDetails?.shotType || shotDetails?.isFastBreak || shotDetails?.isSecondChance);
          
          // Get assister info for made shots
          const assister = isMadeShot && shotDetails?.assistedBy 
            ? getPlayerInfo(shotDetails.assistedBy, event.teamId) 
            : null;

          return (
            <div
              key={event.id}
              onClick={isClickable ? () => onEventTap(event) : undefined}
              className={`
                flex items-center gap-[var(--space-3)]
                py-[var(--space-2)] px-[var(--space-3)]
                bg-bg-tertiary
                rounded-[var(--radius-md)]
                ${index === 0 ? 'animate-slide-up' : ''}
                ${isClickable ? 'cursor-pointer hover:bg-bg-hover transition-colors' : ''}
              `}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEventTap(event);
                }
              } : undefined}
            >
              {/* Period & Time */}
              <div className="text-text-muted text-xs w-16 shrink-0">
                <span>{event.period}</span>
                <span className="mx-1">•</span>
                <span>{event.gameTime}</span>
              </div>

              {/* Team Indicator */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: team.color }}
              />

              {/* Team Name */}
              <span 
                className="text-xs font-semibold w-12 shrink-0"
                style={{ color: team.color }}
              >
                {team.name}
              </span>

              {/* Player & Event */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[var(--space-2)] flex-wrap">
                  {player && (
                    <span className="text-text-primary text-sm">
                      #{player.number} {player.name.split(' ').pop()}
                    </span>
                  )}
                  <span className="text-text-secondary text-sm">
                    {formatEventDescription(event)}
                  </span>
                  
                  {/* Assist attribution for made shots */}
                  {assister && (
                    <span className="text-highlight text-sm">
                      (AST #{assister.number})
                    </span>
                  )}
                  
                  {/* Shot detail badges */}
                  {(hasShotDetails || assister) && (
                    <div className="flex items-center gap-1">
                      {shotDetails?.isFastBreak && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-highlight/20 text-highlight rounded font-medium">
                          FB
                        </span>
                      )}
                      {shotDetails?.isSecondChance && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gold/20 text-gold rounded font-medium">
                          2ND
                        </span>
                      )}
                      {shotDetails?.shotType && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium capitalize">
                          {shotDetails.shotType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Points indicator for scoring plays */}
              {(event.eventType === 'field_goal_made' || 
                event.eventType === 'free_throw_made') && (
                <span className="
                  text-primary font-bold text-sm
                  px-2 py-0.5
                  bg-primary/10
                  rounded-full
                ">
                  +{event.eventType === 'free_throw_made' ? 1 : event.eventData?.points || 2}
                </span>
              )}

              {/* Edit indicator for shot events */}
              {isClickable && (
                <svg
                  className="w-4 h-4 text-text-muted shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
