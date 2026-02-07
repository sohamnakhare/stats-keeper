// Export Generator - CSV/JSON/PDF generation for game statistics
// Based on FIBA Statisticians' Manual 2024

import type { GameSummary, PlayerBoxScore, TeamBoxScore } from '@/types';

// ============================================
// CSV Generation
// ============================================

/**
 * Generate CSV content for player box scores
 */
function generatePlayerBoxScoreCSV(
  players: PlayerBoxScore[],
  teamName: string
): string {
  const headers = [
    'Team',
    'Number',
    'Name',
    'Starter',
    'MIN',
    'PTS',
    'FGM',
    'FGA',
    'FG%',
    '3PM',
    '3PA',
    '3P%',
    'FTM',
    'FTA',
    'FT%',
    'OREB',
    'DREB',
    'REB',
    'AST',
    'STL',
    'BLK',
    'TO',
    'PF',
    '+/-',
    'EFF',
  ].join(',');

  const rows = players.map((p) =>
    [
      teamName,
      p.playerNumber,
      `"${p.playerName}"`,
      p.isStarter ? 'Yes' : 'No',
      p.minutesPlayed,
      p.points,
      p.fieldGoalsMade,
      p.fieldGoalsAttempted,
      p.fieldGoalPercentage.toFixed(1),
      p.threePointersMade,
      p.threePointersAttempted,
      p.threePointPercentage.toFixed(1),
      p.freeThrowsMade,
      p.freeThrowsAttempted,
      p.freeThrowPercentage.toFixed(1),
      p.offensiveRebounds,
      p.defensiveRebounds,
      p.totalRebounds,
      p.assists,
      p.steals,
      p.blocks,
      p.turnovers,
      p.personalFouls,
      p.plusMinus,
      p.efficiencyRating,
    ].join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Generate CSV content for team box scores
 */
function generateTeamBoxScoreCSV(
  homeTeam: TeamBoxScore,
  awayTeam: TeamBoxScore
): string {
  const headers = [
    'Team',
    'PTS',
    'FGM',
    'FGA',
    'FG%',
    '3PM',
    '3PA',
    '3P%',
    'FTM',
    'FTA',
    'FT%',
    'OREB',
    'DREB',
    'REB',
    'AST',
    'STL',
    'BLK',
    'TO',
    'PF',
    'Paint Pts',
    'Fast Break',
    '2nd Chance',
    'Bench Pts',
  ].join(',');

  const formatTeamRow = (team: TeamBoxScore) =>
    [
      team.teamName,
      team.totalPoints,
      team.fieldGoalsMade,
      team.fieldGoalsAttempted,
      team.fieldGoalPercentage.toFixed(1),
      team.threePointersMade,
      team.threePointersAttempted,
      team.threePointPercentage.toFixed(1),
      team.freeThrowsMade,
      team.freeThrowsAttempted,
      team.freeThrowPercentage.toFixed(1),
      team.offensiveRebounds,
      team.defensiveRebounds,
      team.totalRebounds,
      team.assists,
      team.steals,
      team.blocks,
      team.turnovers,
      team.personalFouls,
      team.pointsInPaint,
      team.fastBreakPoints,
      team.secondChancePoints,
      team.benchPoints,
    ].join(',');

  return [headers, formatTeamRow(homeTeam), formatTeamRow(awayTeam)].join('\n');
}

/**
 * Generate complete CSV export for a game
 */
export function generateCSV(summary: GameSummary): string {
  const sections: string[] = [];

  // Game Header
  sections.push('GAME SUMMARY');
  sections.push(`Date,${summary.date.toISOString().split('T')[0]}`);
  sections.push(`Venue,${summary.venue || 'N/A'}`);
  sections.push(`Status,${summary.status}`);
  sections.push(
    `Final Score,${summary.homeTeam.teamName} ${summary.homeTeam.totalPoints} - ${summary.awayTeam.totalPoints} ${summary.awayTeam.teamName}`
  );
  sections.push('');

  // Score by Period
  sections.push('SCORE BY PERIOD');
  const periods = Object.keys(summary.homeTeam.pointsByPeriod).filter(
    (p) =>
      (summary.homeTeam.pointsByPeriod[p as keyof typeof summary.homeTeam.pointsByPeriod] || 0) > 0 ||
      (summary.awayTeam.pointsByPeriod[p as keyof typeof summary.awayTeam.pointsByPeriod] || 0) > 0
  );
  sections.push(['Team', ...periods, 'Total'].join(','));
  sections.push(
    [
      summary.homeTeam.teamName,
      ...periods.map(
        (p) => summary.homeTeam.pointsByPeriod[p as keyof typeof summary.homeTeam.pointsByPeriod] || 0
      ),
      summary.homeTeam.totalPoints,
    ].join(',')
  );
  sections.push(
    [
      summary.awayTeam.teamName,
      ...periods.map(
        (p) => summary.awayTeam.pointsByPeriod[p as keyof typeof summary.awayTeam.pointsByPeriod] || 0
      ),
      summary.awayTeam.totalPoints,
    ].join(',')
  );
  sections.push('');

  // Team Box Scores
  sections.push('TEAM STATISTICS');
  sections.push(generateTeamBoxScoreCSV(summary.homeTeam, summary.awayTeam));
  sections.push('');

  // Home Team Players
  sections.push(`${summary.homeTeam.teamName.toUpperCase()} BOX SCORE`);
  sections.push(generatePlayerBoxScoreCSV(summary.homePlayers, summary.homeTeam.teamName));
  sections.push('');

  // Away Team Players
  sections.push(`${summary.awayTeam.teamName.toUpperCase()} BOX SCORE`);
  sections.push(generatePlayerBoxScoreCSV(summary.awayPlayers, summary.awayTeam.teamName));
  sections.push('');

  // Game Flow Stats
  sections.push('GAME FLOW');
  sections.push(`Lead Changes,${summary.gameFlow.leadChanges}`);
  sections.push(`Times Tied,${summary.gameFlow.scoreTiedCount}`);
  sections.push(
    `${summary.homeTeam.teamName} Largest Lead,${summary.gameFlow.homeTeamLargestLead.points} (${summary.gameFlow.homeTeamLargestLead.period} ${summary.gameFlow.homeTeamLargestLead.time})`
  );
  sections.push(
    `${summary.awayTeam.teamName} Largest Lead,${summary.gameFlow.awayTeamLargestLead.points} (${summary.gameFlow.awayTeamLargestLead.period} ${summary.gameFlow.awayTeamLargestLead.time})`
  );
  if (summary.gameFlow.largestScoringRun) {
    sections.push(
      `Largest Scoring Run,${summary.gameFlow.largestScoringRun.teamName} ${summary.gameFlow.largestScoringRun.points}-0`
    );
  }

  return sections.join('\n');
}

// ============================================
// JSON Generation
// ============================================

/**
 * Generate JSON export for a game
 */
export function generateJSON(summary: GameSummary): string {
  return JSON.stringify(summary, null, 2);
}

// ============================================
// File Name Generation
// ============================================

/**
 * Generate a filename for export
 */
export function generateFileName(
  summary: GameSummary,
  format: 'csv' | 'json' | 'pdf'
): string {
  const date = summary.date.toISOString().split('T')[0];
  const homeShort = summary.homeTeam.teamShortName;
  const awayShort = summary.awayTeam.teamShortName;
  return `${date}_${homeShort}_vs_${awayShort}.${format}`;
}

// ============================================
// Export Type Definitions
// ============================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includePlayByPlay?: boolean;
  includeAdvancedStats?: boolean;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * Generate export based on options
 */
export function generateExport(
  summary: GameSummary,
  options: ExportOptions
): ExportResult {
  switch (options.format) {
    case 'csv':
      return {
        content: generateCSV(summary),
        filename: generateFileName(summary, 'csv'),
        mimeType: 'text/csv',
      };
    case 'json':
      return {
        content: generateJSON(summary),
        filename: generateFileName(summary, 'json'),
        mimeType: 'application/json',
      };
    case 'pdf':
      // PDF generation would require a library like @react-pdf/renderer
      // For now, return a placeholder
      throw new Error('PDF export not yet implemented');
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}
