'use client';

import type { PlayerBoxScore, TeamBoxScore } from '@/types';
import { Card } from '@/components/ui';

interface BoxScoreTableProps {
  team: TeamBoxScore;
  players: PlayerBoxScore[];
  onPlayerClick?: (playerId: string) => void;
}

export function BoxScoreTable({ team, players, onPlayerClick }: BoxScoreTableProps) {
  // Separate starters and bench
  const starters = players.filter((p) => p.isStarter);
  const bench = players.filter((p) => !p.isStarter);

  // Format shooting stat (made-attempted)
  const formatShootingStat = (made: number, attempted: number) => {
    return `${made}-${attempted}`;
  };

  // Format percentage
  const formatPct = (pct: number) => {
    if (pct === 0) return '-';
    return `${pct.toFixed(1)}%`;
  };

  // Format rebounds (off-total)
  const formatRebounds = (off: number, total: number) => {
    return `${off}-${total}`;
  };

  // Format plus/minus with sign
  const formatPlusMinus = (pm: number) => {
    if (pm === 0) return '0';
    return pm > 0 ? `+${pm}` : `${pm}`;
  };

  // Calculate team totals
  const teamTotals = {
    fieldGoals: formatShootingStat(team.fieldGoalsMade, team.fieldGoalsAttempted),
    threePointers: formatShootingStat(team.threePointersMade, team.threePointersAttempted),
    freeThrows: formatShootingStat(team.freeThrowsMade, team.freeThrowsAttempted),
    rebounds: formatRebounds(team.offensiveRebounds, team.totalRebounds),
  };

  const renderPlayerRow = (player: PlayerBoxScore, showBorder = true) => (
    <tr
      key={player.playerId}
      className={`
        ${showBorder ? 'border-b border-border/30' : ''}
        hover:bg-bg-hover/50 cursor-pointer transition-colors duration-[var(--duration-fast)]
      `}
      onClick={() => onPlayerClick?.(player.playerId)}
    >
      {/* Number */}
      <td className="py-[var(--space-2)] pr-[var(--space-2)] text-text-muted text-right w-10">
        {player.playerNumber}
      </td>
      {/* Name */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-text-primary font-medium min-w-[120px]">
        <span className="truncate block max-w-[140px]">{player.playerName}</span>
      </td>
      {/* MIN */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
        {player.minutesPlayed}
      </td>
      {/* PTS */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-primary font-bold">
        {player.points}
      </td>
      {/* FG */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
        {formatShootingStat(player.fieldGoalsMade, player.fieldGoalsAttempted)}
      </td>
      {/* 3PT */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
        {formatShootingStat(player.threePointersMade, player.threePointersAttempted)}
      </td>
      {/* FT */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
        {formatShootingStat(player.freeThrowsMade, player.freeThrowsAttempted)}
      </td>
      {/* REB */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
        {formatRebounds(player.offensiveRebounds, player.totalRebounds)}
      </td>
      {/* AST */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary">
        {player.assists}
      </td>
      {/* STL */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary">
        {player.steals}
      </td>
      {/* BLK */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary">
        {player.blocks}
      </td>
      {/* TO */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary">
        {player.turnovers}
      </td>
      {/* PF */}
      <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-secondary">
        {player.personalFouls}
      </td>
      {/* +/- */}
      <td
        className={`
          py-[var(--space-2)] px-[var(--space-2)] text-center font-medium
          ${player.plusMinus > 0 ? 'text-primary' : player.plusMinus < 0 ? 'text-accent' : 'text-text-muted'}
        `}
      >
        {formatPlusMinus(player.plusMinus)}
      </td>
    </tr>
  );

  return (
    <Card className="overflow-hidden">
      <div className="p-[var(--space-4)]">
        {/* Team Header */}
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: team.teamColor }}
          />
          <h3 className="font-heading text-lg font-bold text-text-primary">
            {team.teamName}
          </h3>
          <span className="font-display text-2xl text-text-primary ml-auto">
            {team.totalPoints}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-[var(--space-4)]">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-bg-secondary/50">
                <th className="py-[var(--space-2)] pr-[var(--space-2)] text-right text-text-muted font-medium text-xs w-10">
                  #
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-left text-text-muted font-medium text-xs">
                  Player
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  MIN
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  PTS
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  FG
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  3PT
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  FT
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  REB
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  AST
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  STL
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  BLK
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  TO
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  PF
                </th>
                <th className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted font-medium text-xs">
                  +/-
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Starters */}
              {starters.map((player, idx) =>
                renderPlayerRow(player, idx < starters.length - 1 || bench.length > 0)
              )}

              {/* Bench Divider */}
              {bench.length > 0 && (
                <tr className="border-b border-border">
                  <td
                    colSpan={14}
                    className="py-[var(--space-1)] px-[var(--space-2)] bg-bg-tertiary/50"
                  >
                    <span className="text-xs text-text-muted uppercase tracking-wide">
                      Bench
                    </span>
                  </td>
                </tr>
              )}

              {/* Bench Players */}
              {bench.map((player, idx) =>
                renderPlayerRow(player, idx < bench.length - 1)
              )}

              {/* Team Totals Row */}
              <tr className="border-t-2 border-border bg-bg-secondary/30">
                <td className="py-[var(--space-3)] pr-[var(--space-2)]"></td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-text-primary font-bold">
                  TOTALS
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-muted">
                  -
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-primary font-bold">
                  {team.totalPoints}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
                  {teamTotals.fieldGoals}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
                  {teamTotals.threePointers}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
                  {teamTotals.freeThrows}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary font-mono text-xs">
                  {teamTotals.rebounds}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary">
                  {team.assists}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary">
                  {team.steals}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary">
                  {team.blocks}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary">
                  {team.turnovers}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)] text-center text-text-secondary">
                  {team.personalFouls}
                </td>
                <td className="py-[var(--space-3)] px-[var(--space-2)]"></td>
              </tr>

              {/* Percentages Row */}
              <tr className="bg-bg-secondary/30">
                <td className="py-[var(--space-2)] pr-[var(--space-2)]"></td>
                <td className="py-[var(--space-2)] px-[var(--space-2)] text-text-muted text-xs">
                  Percentages
                </td>
                <td className="py-[var(--space-2)] px-[var(--space-2)]"></td>
                <td className="py-[var(--space-2)] px-[var(--space-2)]"></td>
                <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted text-xs">
                  {formatPct(team.fieldGoalPercentage)}
                </td>
                <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted text-xs">
                  {formatPct(team.threePointPercentage)}
                </td>
                <td className="py-[var(--space-2)] px-[var(--space-2)] text-center text-text-muted text-xs">
                  {formatPct(team.freeThrowPercentage)}
                </td>
                <td colSpan={7} className="py-[var(--space-2)] px-[var(--space-2)]"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
