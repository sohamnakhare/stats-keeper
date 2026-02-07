'use client';

import type { GameFlowStats, TeamBoxScore } from '@/types';
import { Card } from '@/components/ui';

interface AdvancedStatsCardProps {
  gameFlow: GameFlowStats;
  homeTeam: TeamBoxScore;
  awayTeam: TeamBoxScore;
}

interface StatItemProps {
  label: string;
  value: string | number;
  subtext?: string;
}

function StatItem({ label, value, subtext }: StatItemProps) {
  return (
    <div className="flex justify-between items-center py-[var(--space-2)]">
      <span className="text-text-secondary text-sm">{label}</span>
      <div className="text-right">
        <span className="font-heading font-semibold text-text-primary">{value}</span>
        {subtext && (
          <span className="text-text-muted text-xs ml-[var(--space-2)]">({subtext})</span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-b border-border/50 my-[var(--space-2)]" />;
}

export function AdvancedStatsCard({
  gameFlow,
  homeTeam,
  awayTeam,
}: AdvancedStatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-[var(--space-4)]">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-[var(--space-4)]">
          Game Flow
        </h3>

        {/* Lead Changes & Ties */}
        <div className="grid grid-cols-2 gap-[var(--space-4)] mb-[var(--space-4)]">
          <div className="bg-bg-tertiary rounded-[var(--radius-md)] p-[var(--space-4)] text-center">
            <span className="font-display text-3xl text-primary">{gameFlow.leadChanges}</span>
            <p className="text-text-muted text-xs mt-[var(--space-1)]">Lead Changes</p>
          </div>
          <div className="bg-bg-tertiary rounded-[var(--radius-md)] p-[var(--space-4)] text-center">
            <span className="font-display text-3xl text-highlight">{gameFlow.scoreTiedCount}</span>
            <p className="text-text-muted text-xs mt-[var(--space-1)]">Times Tied</p>
          </div>
        </div>

        <Divider />

        {/* Largest Leads */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Largest Lead
        </h4>

        <div className="space-y-[var(--space-2)]">
          {/* Home Team */}
          <div className="flex items-center justify-between py-[var(--space-2)] px-[var(--space-3)] bg-bg-tertiary rounded-[var(--radius-md)]">
            <div className="flex items-center gap-[var(--space-2)]">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: homeTeam.teamColor }}
              />
              <span className="font-heading font-semibold text-text-primary">
                {homeTeam.teamShortName}
              </span>
            </div>
            <div className="text-right">
              {gameFlow.homeTeamLargestLead.points > 0 ? (
                <>
                  <span className="font-heading font-bold text-primary text-lg">
                    +{gameFlow.homeTeamLargestLead.points}
                  </span>
                  <span className="text-text-muted text-xs ml-[var(--space-2)]">
                    ({gameFlow.homeTeamLargestLead.period} {gameFlow.homeTeamLargestLead.time})
                  </span>
                </>
              ) : (
                <span className="text-text-muted text-sm">Never led</span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between py-[var(--space-2)] px-[var(--space-3)] bg-bg-tertiary rounded-[var(--radius-md)]">
            <div className="flex items-center gap-[var(--space-2)]">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: awayTeam.teamColor }}
              />
              <span className="font-heading font-semibold text-text-primary">
                {awayTeam.teamShortName}
              </span>
            </div>
            <div className="text-right">
              {gameFlow.awayTeamLargestLead.points > 0 ? (
                <>
                  <span className="font-heading font-bold text-accent text-lg">
                    +{gameFlow.awayTeamLargestLead.points}
                  </span>
                  <span className="text-text-muted text-xs ml-[var(--space-2)]">
                    ({gameFlow.awayTeamLargestLead.period} {gameFlow.awayTeamLargestLead.time})
                  </span>
                </>
              ) : (
                <span className="text-text-muted text-sm">Never led</span>
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* Largest Scoring Run */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Largest Scoring Run
        </h4>

        {gameFlow.largestScoringRun ? (
          <div className="bg-bg-tertiary rounded-[var(--radius-md)] p-[var(--space-4)]">
            <div className="flex items-center justify-between mb-[var(--space-2)]">
              <div className="flex items-center gap-[var(--space-2)]">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor:
                      gameFlow.largestScoringRun.team === 'home'
                        ? homeTeam.teamColor
                        : awayTeam.teamColor,
                  }}
                />
                <span className="font-heading font-semibold text-text-primary">
                  {gameFlow.largestScoringRun.teamName}
                </span>
              </div>
              <span className="font-display text-2xl text-primary">
                {gameFlow.largestScoringRun.points}-0
              </span>
            </div>
            <p className="text-text-muted text-xs">
              {gameFlow.largestScoringRun.period} {gameFlow.largestScoringRun.startTime} -{' '}
              {gameFlow.largestScoringRun.endTime}
            </p>
          </div>
        ) : (
          <p className="text-text-muted text-sm italic py-[var(--space-2)]">
            No significant scoring run recorded
          </p>
        )}

        <Divider />

        {/* Efficiency Comparison */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Efficiency
        </h4>

        <div className="space-y-[var(--space-1)]">
          <StatItem
            label="Assist-to-Turnover"
            value={`${homeTeam.turnovers > 0 ? (homeTeam.assists / homeTeam.turnovers).toFixed(2) : homeTeam.assists} - ${awayTeam.turnovers > 0 ? (awayTeam.assists / awayTeam.turnovers).toFixed(2) : awayTeam.assists}`}
          />
          <StatItem
            label="Points per Possession"
            value={`${((homeTeam.totalPoints / Math.max(1, homeTeam.fieldGoalsAttempted + homeTeam.turnovers)) * 100).toFixed(1)} - ${((awayTeam.totalPoints / Math.max(1, awayTeam.fieldGoalsAttempted + awayTeam.turnovers)) * 100).toFixed(1)}`}
            subtext="approx"
          />
        </div>
      </div>
    </Card>
  );
}
