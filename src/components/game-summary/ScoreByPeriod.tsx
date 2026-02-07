'use client';

import type { Period, TeamBoxScore } from '@/types';
import { Card } from '@/components/ui';

interface ScoreByPeriodProps {
  homeTeam: TeamBoxScore;
  awayTeam: TeamBoxScore;
}

const PERIODS: Period[] = ['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2', 'OT3'];

export function ScoreByPeriod({ homeTeam, awayTeam }: ScoreByPeriodProps) {
  // Determine which periods have any scores
  const activePeriods = PERIODS.filter(
    (period) =>
      (homeTeam.pointsByPeriod[period] || 0) > 0 ||
      (awayTeam.pointsByPeriod[period] || 0) > 0
  );

  // Always show at least Q1-Q4
  const periodsToShow =
    activePeriods.length > 0
      ? activePeriods
      : (['Q1', 'Q2', 'Q3', 'Q4'] as Period[]);

  return (
    <Card className="overflow-hidden">
      <div className="p-[var(--space-4)]">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-[var(--space-4)]">
          Score by Period
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-[var(--space-3)] pr-[var(--space-4)] text-text-muted font-medium">
                  Team
                </th>
                {periodsToShow.map((period) => (
                  <th
                    key={period}
                    className="text-center py-[var(--space-3)] px-[var(--space-3)] text-text-muted font-medium min-w-[50px]"
                  >
                    {period}
                  </th>
                ))}
                <th className="text-center py-[var(--space-3)] px-[var(--space-4)] text-text-primary font-bold min-w-[60px]">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Home Team Row */}
              <tr className="border-b border-border/50">
                <td className="py-[var(--space-3)] pr-[var(--space-4)]">
                  <div className="flex items-center gap-[var(--space-2)]">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: homeTeam.teamColor }}
                    />
                    <span className="font-heading font-semibold text-text-primary">
                      {homeTeam.teamShortName}
                    </span>
                  </div>
                </td>
                {periodsToShow.map((period) => (
                  <td
                    key={period}
                    className="text-center py-[var(--space-3)] px-[var(--space-3)] text-text-secondary font-mono"
                  >
                    {homeTeam.pointsByPeriod[period] || 0}
                  </td>
                ))}
                <td className="text-center py-[var(--space-3)] px-[var(--space-4)] font-heading font-bold text-text-primary text-lg">
                  {homeTeam.totalPoints}
                </td>
              </tr>

              {/* Away Team Row */}
              <tr>
                <td className="py-[var(--space-3)] pr-[var(--space-4)]">
                  <div className="flex items-center gap-[var(--space-2)]">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: awayTeam.teamColor }}
                    />
                    <span className="font-heading font-semibold text-text-primary">
                      {awayTeam.teamShortName}
                    </span>
                  </div>
                </td>
                {periodsToShow.map((period) => (
                  <td
                    key={period}
                    className="text-center py-[var(--space-3)] px-[var(--space-3)] text-text-secondary font-mono"
                  >
                    {awayTeam.pointsByPeriod[period] || 0}
                  </td>
                ))}
                <td className="text-center py-[var(--space-3)] px-[var(--space-4)] font-heading font-bold text-text-primary text-lg">
                  {awayTeam.totalPoints}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
