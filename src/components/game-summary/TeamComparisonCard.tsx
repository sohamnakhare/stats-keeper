'use client';

import type { TeamBoxScore } from '@/types';
import { Card } from '@/components/ui';

interface TeamComparisonCardProps {
  homeTeam: TeamBoxScore;
  awayTeam: TeamBoxScore;
}

interface StatRowProps {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
  homeSubtext?: string;
  awaySubtext?: string;
  indent?: boolean;
}

function StatRow({
  label,
  homeValue,
  awayValue,
  homeSubtext,
  awaySubtext,
  indent = false,
}: StatRowProps) {
  return (
    <div
      className={`
        flex items-center justify-between py-[var(--space-2)]
        ${indent ? 'pl-[var(--space-4)]' : ''}
      `}
    >
      {/* Home Value */}
      <div className="flex-1 text-left">
        <span className="font-heading font-semibold text-text-primary">
          {homeValue}
        </span>
        {homeSubtext && (
          <span className="text-text-muted text-sm ml-[var(--space-2)]">
            ({homeSubtext})
          </span>
        )}
      </div>

      {/* Label */}
      <div
        className={`
          flex-shrink-0 px-[var(--space-4)] text-center
          ${indent ? 'text-text-muted text-sm' : 'text-text-secondary'}
        `}
      >
        {label}
      </div>

      {/* Away Value */}
      <div className="flex-1 text-right">
        {awaySubtext && (
          <span className="text-text-muted text-sm mr-[var(--space-2)]">
            ({awaySubtext})
          </span>
        )}
        <span className="font-heading font-semibold text-text-primary">
          {awayValue}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-b border-border/50 my-[var(--space-2)]" />;
}

export function TeamComparisonCard({ homeTeam, awayTeam }: TeamComparisonCardProps) {
  // Format shooting stat with percentage
  const formatShooting = (made: number, attempted: number, pct: number) => {
    return `${made}-${attempted}`;
  };

  const formatPct = (pct: number) => {
    if (pct === 0) return '-';
    return `${pct.toFixed(1)}%`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-[var(--space-4)]">
        {/* Header with Final Score */}
        <div className="flex items-center justify-between mb-[var(--space-6)]">
          {/* Home Team */}
          <div className="flex items-center gap-[var(--space-3)]">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: homeTeam.teamColor }}
            />
            <span className="font-heading font-bold text-lg text-text-primary">
              {homeTeam.teamShortName}
            </span>
            <span className="font-display text-3xl text-text-primary">
              {homeTeam.totalPoints}
            </span>
          </div>

          {/* VS */}
          <span className="text-text-muted font-heading text-sm">vs</span>

          {/* Away Team */}
          <div className="flex items-center gap-[var(--space-3)]">
            <span className="font-display text-3xl text-text-primary">
              {awayTeam.totalPoints}
            </span>
            <span className="font-heading font-bold text-lg text-text-primary">
              {awayTeam.teamShortName}
            </span>
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: awayTeam.teamColor }}
            />
          </div>
        </div>

        {/* Shooting Stats */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Shooting
        </h4>

        <StatRow
          label="Field Goals"
          homeValue={formatShooting(
            homeTeam.fieldGoalsMade,
            homeTeam.fieldGoalsAttempted,
            homeTeam.fieldGoalPercentage
          )}
          homeSubtext={formatPct(homeTeam.fieldGoalPercentage)}
          awayValue={formatShooting(
            awayTeam.fieldGoalsMade,
            awayTeam.fieldGoalsAttempted,
            awayTeam.fieldGoalPercentage
          )}
          awaySubtext={formatPct(awayTeam.fieldGoalPercentage)}
        />

        <StatRow
          label="3-Pointers"
          homeValue={formatShooting(
            homeTeam.threePointersMade,
            homeTeam.threePointersAttempted,
            homeTeam.threePointPercentage
          )}
          homeSubtext={formatPct(homeTeam.threePointPercentage)}
          awayValue={formatShooting(
            awayTeam.threePointersMade,
            awayTeam.threePointersAttempted,
            awayTeam.threePointPercentage
          )}
          awaySubtext={formatPct(awayTeam.threePointPercentage)}
        />

        <StatRow
          label="Free Throws"
          homeValue={formatShooting(
            homeTeam.freeThrowsMade,
            homeTeam.freeThrowsAttempted,
            homeTeam.freeThrowPercentage
          )}
          homeSubtext={formatPct(homeTeam.freeThrowPercentage)}
          awayValue={formatShooting(
            awayTeam.freeThrowsMade,
            awayTeam.freeThrowsAttempted,
            awayTeam.freeThrowPercentage
          )}
          awaySubtext={formatPct(awayTeam.freeThrowPercentage)}
        />

        <Divider />

        {/* Rebounds */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Rebounds
        </h4>

        <StatRow
          label="Total Rebounds"
          homeValue={homeTeam.totalRebounds}
          awayValue={awayTeam.totalRebounds}
        />

        <StatRow
          label="Offensive"
          homeValue={homeTeam.offensiveRebounds}
          awayValue={awayTeam.offensiveRebounds}
        />

        <StatRow
          label="Defensive"
          homeValue={homeTeam.defensiveRebounds}
          awayValue={awayTeam.defensiveRebounds}
        />

        <Divider />

        {/* Other Stats */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Other Stats
        </h4>

        <StatRow label="Assists" homeValue={homeTeam.assists} awayValue={awayTeam.assists} />

        <StatRow
          label="Turnovers"
          homeValue={homeTeam.turnovers}
          awayValue={awayTeam.turnovers}
        />

        <StatRow label="Steals" homeValue={homeTeam.steals} awayValue={awayTeam.steals} />

        <StatRow label="Blocks" homeValue={homeTeam.blocks} awayValue={awayTeam.blocks} />

        <StatRow
          label="Personal Fouls"
          homeValue={homeTeam.personalFouls}
          awayValue={awayTeam.personalFouls}
        />

        <Divider />

        {/* FIBA Appendix C Stats */}
        <h4 className="text-xs text-text-muted uppercase tracking-wide mb-[var(--space-2)]">
          Additional Stats
        </h4>

        <StatRow
          label="Points in Paint"
          homeValue={homeTeam.pointsInPaint}
          awayValue={awayTeam.pointsInPaint}
        />

        <StatRow
          label="Fast Break Pts"
          homeValue={homeTeam.fastBreakPoints}
          awayValue={awayTeam.fastBreakPoints}
        />

        <StatRow
          label="2nd Chance Pts"
          homeValue={homeTeam.secondChancePoints}
          awayValue={awayTeam.secondChancePoints}
        />

        <StatRow
          label="Bench Points"
          homeValue={homeTeam.benchPoints}
          awayValue={awayTeam.benchPoints}
        />
      </div>
    </Card>
  );
}
