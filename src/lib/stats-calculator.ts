// Stats Calculator - FIBA Appendix C Calculations
// Based on FIBA Statisticians' Manual 2024

import type {
  Period,
  PlayerBoxScore,
  TeamBoxScore,
  GameFlowStats,
  GameSummary,
} from '@/types';
import type { PlayEventResponse, GameWithTeams, PlayerData, TeamData } from '@/services/game-api';

// ============================================
// Constants
// ============================================

const PERIOD_ORDER: Period[] = ['Q1', 'Q2', 'Q3', 'Q4', 'OT1', 'OT2', 'OT3'];
const PERIOD_DURATION_SECONDS = 10 * 60; // 10 minutes per quarter

// ============================================
// Helper Functions
// ============================================

/**
 * Parse game time string "MM:SS" to seconds remaining
 */
function parseGameTime(gameTime: string): number {
  const [minutes, seconds] = gameTime.split(':').map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}

/**
 * Format seconds to "MM:SS" string
 */
function formatMinutes(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate percentage safely (returns 0 if denominator is 0)
 */
function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // One decimal place
}

/**
 * Get points from a scoring event
 */
function getPointsFromEvent(event: PlayEventResponse): number {
  if (event.eventType === 'field_goal_made') {
    return event.eventData?.points || 2;
  }
  if (event.eventType === 'free_throw_made') {
    return 1;
  }
  return 0;
}

/**
 * Sort events chronologically (earliest first)
 */
function sortEventsChronologically(events: PlayEventResponse[]): PlayEventResponse[] {
  return [...events].sort((a, b) => {
    // Sort by period first
    const periodA = PERIOD_ORDER.indexOf(a.period as Period);
    const periodB = PERIOD_ORDER.indexOf(b.period as Period);
    if (periodA !== periodB) return periodA - periodB;
    
    // Then by game time (descending - higher time means earlier in period)
    const timeA = parseGameTime(a.gameTime);
    const timeB = parseGameTime(b.gameTime);
    return timeB - timeA;
  });
}

// ============================================
// Player Statistics Calculations
// ============================================

interface PlayerStatsAccumulator {
  points: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  personalFouls: number;
  foulsDrawn: number;
}

function createEmptyPlayerStats(): PlayerStatsAccumulator {
  return {
    points: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    offensiveRebounds: 0,
    defensiveRebounds: 0,
    assists: 0,
    turnovers: 0,
    steals: 0,
    blocks: 0,
    personalFouls: 0,
    foulsDrawn: 0,
  };
}

/**
 * Aggregate events into player stats
 */
function aggregatePlayerStats(
  playerId: string,
  events: PlayEventResponse[]
): PlayerStatsAccumulator {
  const stats = createEmptyPlayerStats();

  for (const event of events) {
    if (event.playerId !== playerId) continue;

    switch (event.eventType) {
      case 'field_goal_made': {
        const points = event.eventData?.points || 2;
        stats.points += points;
        stats.fieldGoalsMade++;
        stats.fieldGoalsAttempted++;
        if (points === 3) {
          stats.threePointersMade++;
          stats.threePointersAttempted++;
        }
        break;
      }
      case 'field_goal_missed': {
        stats.fieldGoalsAttempted++;
        const points = event.eventData?.points || 2;
        if (points === 3) {
          stats.threePointersAttempted++;
        }
        break;
      }
      case 'free_throw_made':
        stats.points++;
        stats.freeThrowsMade++;
        stats.freeThrowsAttempted++;
        break;
      case 'free_throw_missed':
        stats.freeThrowsAttempted++;
        break;
      case 'offensive_rebound':
        stats.offensiveRebounds++;
        break;
      case 'defensive_rebound':
        stats.defensiveRebounds++;
        break;
      case 'turnover':
        stats.turnovers++;
        break;
      case 'steal':
        stats.steals++;
        break;
      case 'block':
        stats.blocks++;
        break;
      case 'foul':
        stats.personalFouls++;
        break;
    }

    // Count assists (when this player assisted)
    if (event.eventType === 'field_goal_made' && event.eventData?.assistedBy === playerId) {
      // This is handled separately below
    }
  }

  // Count assists given by this player (assistedBy field on made shots)
  for (const event of events) {
    if (event.eventType === 'field_goal_made' && event.eventData?.assistedBy === playerId) {
      stats.assists++;
    }
    // Count fouls drawn (drawnBy field on fouls)
    if (event.eventType === 'foul' && event.eventData?.drawnBy === playerId) {
      stats.foulsDrawn++;
    }
  }

  return stats;
}

/**
 * Calculate efficiency rating per FIBA Appendix C.K
 * EFF = PTS - (FGA-FGM) - (FTA-FTM) + REB + AST - TO + STL + BLK
 */
export function calculateEfficiency(stats: PlayerStatsAccumulator): number {
  const totalRebounds = stats.offensiveRebounds + stats.defensiveRebounds;
  return (
    stats.points -
    (stats.fieldGoalsAttempted - stats.fieldGoalsMade) -
    (stats.freeThrowsAttempted - stats.freeThrowsMade) +
    totalRebounds +
    stats.assists -
    stats.turnovers +
    stats.steals +
    stats.blocks
  );
}

/**
 * Calculate plus/minus for a player (per FIBA Appendix C.L)
 * Net points while player was on court
 */
export function calculatePlusMinus(
  playerId: string,
  playerTeamId: string,
  events: PlayEventResponse[],
  starterIds: string[]
): number {
  let plusMinus = 0;
  let isOnCourt = starterIds.includes(playerId);
  
  const sortedEvents = sortEventsChronologically(events);

  for (const event of sortedEvents) {
    // Handle substitutions
    if (event.eventType === 'substitution') {
      if (event.eventData?.playerIn === playerId) {
        isOnCourt = true;
      }
      if (event.eventData?.playerOut === playerId) {
        isOnCourt = false;
      }
    }

    // Count scoring while on court
    if (isOnCourt) {
      const points = getPointsFromEvent(event);
      if (points > 0) {
        if (event.teamId === playerTeamId) {
          plusMinus += points;
        } else {
          plusMinus -= points;
        }
      }
    }
  }

  return plusMinus;
}

/**
 * Calculate minutes played for a player (per FIBA Appendix C.A)
 * Track time between substitutions with FIBA rounding rules:
 * - < 30 sec rounds down
 * - >= 30 sec rounds up
 * - > 0 but < 1 min shows as 1 min
 * - 39 min always rounds down (to show didn't play full game)
 */
export function calculateMinutes(
  playerId: string,
  events: PlayEventResponse[],
  starterIds: string[],
  currentPeriod: Period
): string {
  let totalSeconds = 0;
  let isOnCourt = starterIds.includes(playerId);
  let lastEntryTime = isOnCourt ? PERIOD_DURATION_SECONDS : 0;
  let lastEntryPeriod: Period = 'Q1';
  
  const sortedEvents = sortEventsChronologically(events);

  for (const event of sortedEvents) {
    if (event.eventType === 'substitution') {
      if (event.eventData?.playerOut === playerId && isOnCourt) {
        // Player is leaving court
        const exitTime = parseGameTime(event.gameTime);
        const exitPeriod = event.period as Period;
        
        // Calculate time in this stint
        if (exitPeriod === lastEntryPeriod) {
          totalSeconds += lastEntryTime - exitTime;
        } else {
          // Handle period change
          totalSeconds += lastEntryTime; // Time remaining in entry period
          
          // Add full periods between
          const entryIdx = PERIOD_ORDER.indexOf(lastEntryPeriod);
          const exitIdx = PERIOD_ORDER.indexOf(exitPeriod);
          for (let i = entryIdx + 1; i < exitIdx; i++) {
            totalSeconds += PERIOD_DURATION_SECONDS;
          }
          
          // Add time in exit period (from start to exit)
          totalSeconds += PERIOD_DURATION_SECONDS - exitTime;
        }
        
        isOnCourt = false;
      }
      
      if (event.eventData?.playerIn === playerId && !isOnCourt) {
        // Player is entering court
        isOnCourt = true;
        lastEntryTime = parseGameTime(event.gameTime);
        lastEntryPeriod = event.period as Period;
      }
    }
    
    // Handle period ends
    if (event.eventType === 'period_end' && isOnCourt) {
      const endPeriod = event.period as Period;
      if (endPeriod === lastEntryPeriod) {
        totalSeconds += lastEntryTime;
      }
      // Reset for next period if player stays on court
      lastEntryTime = PERIOD_DURATION_SECONDS;
      const periodEndIdx: number = PERIOD_ORDER.indexOf(endPeriod);
      const nextPeriodIdx: number = periodEndIdx + 1;
      if (nextPeriodIdx < PERIOD_ORDER.length) {
        lastEntryPeriod = PERIOD_ORDER[nextPeriodIdx];
      }
    }
  }

  // If player is still on court at current time, add remaining time
  // For completed games, we assume they played to the end
  if (isOnCourt) {
    // For simplicity, assume current time is 0:00 of current period
    const currentPeriodIdx = PERIOD_ORDER.indexOf(currentPeriod);
    const lastPeriodIdx = PERIOD_ORDER.indexOf(lastEntryPeriod);
    
    if (currentPeriodIdx === lastPeriodIdx) {
      totalSeconds += lastEntryTime;
    } else {
      totalSeconds += lastEntryTime;
      for (let i = lastPeriodIdx + 1; i <= currentPeriodIdx; i++) {
        totalSeconds += PERIOD_DURATION_SECONDS;
      }
    }
  }

  // Apply FIBA rounding rules
  let minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Round based on seconds
  if (seconds >= 30) {
    minutes++;
  }
  
  // Never show 40 minutes (show 39 to indicate didn't play full game)
  if (minutes >= 40) {
    minutes = 39;
  }
  
  // If played at all but less than 1 minute, show 1
  if (totalSeconds > 0 && minutes === 0) {
    minutes = 1;
  }

  // Format as MM:SS (using rounded minutes, 00 seconds)
  return `${minutes}:00`;
}

/**
 * Calculate complete box score for a player
 */
export function calculatePlayerBoxScore(
  player: PlayerData,
  events: PlayEventResponse[],
  starterIds: string[],
  currentPeriod: Period
): PlayerBoxScore {
  const stats = aggregatePlayerStats(player.id, events);
  const totalRebounds = stats.offensiveRebounds + stats.defensiveRebounds;

  return {
    playerId: player.id,
    playerName: player.name,
    playerNumber: player.number,
    isStarter: starterIds.includes(player.id),

    minutesPlayed: calculateMinutes(player.id, events, starterIds, currentPeriod),

    points: stats.points,
    fieldGoalsMade: stats.fieldGoalsMade,
    fieldGoalsAttempted: stats.fieldGoalsAttempted,
    fieldGoalPercentage: calculatePercentage(stats.fieldGoalsMade, stats.fieldGoalsAttempted),
    threePointersMade: stats.threePointersMade,
    threePointersAttempted: stats.threePointersAttempted,
    threePointPercentage: calculatePercentage(stats.threePointersMade, stats.threePointersAttempted),
    freeThrowsMade: stats.freeThrowsMade,
    freeThrowsAttempted: stats.freeThrowsAttempted,
    freeThrowPercentage: calculatePercentage(stats.freeThrowsMade, stats.freeThrowsAttempted),

    offensiveRebounds: stats.offensiveRebounds,
    defensiveRebounds: stats.defensiveRebounds,
    totalRebounds,

    assists: stats.assists,
    turnovers: stats.turnovers,

    steals: stats.steals,
    blocks: stats.blocks,

    personalFouls: stats.personalFouls,
    foulsDrawn: stats.foulsDrawn,

    plusMinus: calculatePlusMinus(player.id, player.teamId, events, starterIds),
    efficiencyRating: calculateEfficiency(stats),
  };
}

// ============================================
// Team Statistics Calculations
// ============================================

/**
 * Calculate team box score by summing player stats
 */
export function calculateTeamBoxScore(
  team: TeamData,
  playerBoxScores: PlayerBoxScore[],
  events: PlayEventResponse[],
  opponentTeamId: string
): TeamBoxScore {
  // Sum basic stats from player box scores
  const totals = playerBoxScores.reduce(
    (acc, player) => ({
      points: acc.points + player.points,
      fieldGoalsMade: acc.fieldGoalsMade + player.fieldGoalsMade,
      fieldGoalsAttempted: acc.fieldGoalsAttempted + player.fieldGoalsAttempted,
      threePointersMade: acc.threePointersMade + player.threePointersMade,
      threePointersAttempted: acc.threePointersAttempted + player.threePointersAttempted,
      freeThrowsMade: acc.freeThrowsMade + player.freeThrowsMade,
      freeThrowsAttempted: acc.freeThrowsAttempted + player.freeThrowsAttempted,
      offensiveRebounds: acc.offensiveRebounds + player.offensiveRebounds,
      defensiveRebounds: acc.defensiveRebounds + player.defensiveRebounds,
      assists: acc.assists + player.assists,
      turnovers: acc.turnovers + player.turnovers,
      steals: acc.steals + player.steals,
      blocks: acc.blocks + player.blocks,
      personalFouls: acc.personalFouls + player.personalFouls,
    }),
    {
      points: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      assists: 0,
      turnovers: 0,
      steals: 0,
      blocks: 0,
      personalFouls: 0,
    }
  );

  // Calculate points by period
  const pointsByPeriod: Record<Period, number> = {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
    OT1: 0,
    OT2: 0,
    OT3: 0,
  };

  // Calculate special points categories
  let pointsInPaint = 0;
  let fastBreakPoints = 0;
  let secondChancePoints = 0;
  let benchPoints = 0;

  const starters = playerBoxScores.filter((p) => p.isStarter).map((p) => p.playerId);

  for (const event of events) {
    if (event.teamId !== team.id) continue;

    const points = getPointsFromEvent(event);
    if (points > 0) {
      // Add to period total
      pointsByPeriod[event.period as Period] += points;

      // Check special categories from eventData
      if (event.eventData?.isPaintPoints || event.eventData?.shotZone === 'paint') {
        pointsInPaint += points;
      }
      if (event.eventData?.isFastBreak) {
        fastBreakPoints += points;
      }
      if (event.eventData?.isSecondChance) {
        secondChancePoints += points;
      }

      // Check if bench player
      if (event.playerId && !starters.includes(event.playerId)) {
        benchPoints += points;
      }
    }
  }

  // Calculate points off turnovers (opponent turnovers that led to our points)
  // This is a simplification - ideally track possession chains
  const opponentTurnovers = events.filter(
    (e) => e.eventType === 'turnover' && e.teamId === opponentTeamId
  ).length;
  // Estimate: we'll use a simple heuristic for now
  const pointsOffTurnovers = Math.min(totals.points, opponentTurnovers * 2);

  // Calculate game flow stats for this team
  const { largestLead, largestLeadTime } = calculateTeamLeadStats(team.id, events);

  return {
    teamId: team.id,
    teamName: team.name,
    teamShortName: team.shortName,
    teamColor: team.color,

    totalPoints: totals.points,
    pointsByPeriod,

    fieldGoalsMade: totals.fieldGoalsMade,
    fieldGoalsAttempted: totals.fieldGoalsAttempted,
    fieldGoalPercentage: calculatePercentage(totals.fieldGoalsMade, totals.fieldGoalsAttempted),
    threePointersMade: totals.threePointersMade,
    threePointersAttempted: totals.threePointersAttempted,
    threePointPercentage: calculatePercentage(
      totals.threePointersMade,
      totals.threePointersAttempted
    ),
    freeThrowsMade: totals.freeThrowsMade,
    freeThrowsAttempted: totals.freeThrowsAttempted,
    freeThrowPercentage: calculatePercentage(totals.freeThrowsMade, totals.freeThrowsAttempted),

    offensiveRebounds: totals.offensiveRebounds,
    defensiveRebounds: totals.defensiveRebounds,
    totalRebounds: totals.offensiveRebounds + totals.defensiveRebounds,

    assists: totals.assists,
    turnovers: totals.turnovers,
    steals: totals.steals,
    blocks: totals.blocks,
    personalFouls: totals.personalFouls,

    pointsInPaint,
    fastBreakPoints,
    secondChancePoints,
    pointsOffTurnovers,
    benchPoints,

    largestLead,
    largestLeadTime,
    timeLeading: '0:00', // Complex to calculate, simplified for now
  };
}

/**
 * Calculate largest lead for a team
 */
function calculateTeamLeadStats(
  teamId: string,
  events: PlayEventResponse[]
): { largestLead: number; largestLeadTime: string } {
  let homeScore = 0;
  let awayScore = 0;
  let largestLead = 0;
  let largestLeadTime = '';
  let largestLeadPeriod: Period = 'Q1';

  // Need to know which team is home/away
  // For this calculation, we'll track from team's perspective
  let teamScore = 0;
  let opponentScore = 0;

  const sortedEvents = sortEventsChronologically(events);

  for (const event of sortedEvents) {
    const points = getPointsFromEvent(event);
    if (points > 0) {
      if (event.teamId === teamId) {
        teamScore += points;
      } else {
        opponentScore += points;
      }

      const currentLead = teamScore - opponentScore;
      if (currentLead > largestLead) {
        largestLead = currentLead;
        largestLeadTime = event.gameTime;
        largestLeadPeriod = event.period as Period;
      }
    }
  }

  return {
    largestLead,
    largestLeadTime: largestLead > 0 ? `${largestLeadPeriod} ${largestLeadTime}` : '',
  };
}

// ============================================
// Game Flow Calculations
// ============================================

/**
 * Calculate game flow statistics (lead changes, ties, runs)
 */
export function calculateGameFlow(
  events: PlayEventResponse[],
  homeTeamId: string,
  awayTeamId: string,
  homeTeamName: string,
  awayTeamName: string
): GameFlowStats {
  let homeScore = 0;
  let awayScore = 0;
  let leadChanges = 0;
  let scoreTiedCount = 0;
  let currentLeader: 'home' | 'away' | 'tied' | null = null;

  // Track largest lead for each team
  let homeTeamLargestLead = { points: 0, time: '', period: 'Q1' as Period };
  let awayTeamLargestLead = { points: 0, time: '', period: 'Q1' as Period };

  // Track scoring runs
  let currentRunTeam: 'home' | 'away' | null = null;
  let currentRunPoints = 0;
  let currentRunStart = { time: '', period: 'Q1' as Period };
  let largestRun: GameFlowStats['largestScoringRun'] = null;

  const sortedEvents = sortEventsChronologically(events);

  for (const event of sortedEvents) {
    const points = getPointsFromEvent(event);
    if (points === 0) continue;

    const scoringTeam: 'home' | 'away' = event.teamId === homeTeamId ? 'home' : 'away';

    // Update score
    if (scoringTeam === 'home') {
      homeScore += points;
    } else {
      awayScore += points;
    }

    // Track scoring run
    if (currentRunTeam === scoringTeam) {
      currentRunPoints += points;
    } else {
      // Check if previous run was largest
      if (currentRunTeam && currentRunPoints > (largestRun?.points || 0)) {
        largestRun = {
          team: currentRunTeam,
          teamName: currentRunTeam === 'home' ? homeTeamName : awayTeamName,
          points: currentRunPoints,
          startTime: currentRunStart.time,
          endTime: event.gameTime,
          period: currentRunStart.period,
        };
      }
      // Start new run
      currentRunTeam = scoringTeam;
      currentRunPoints = points;
      currentRunStart = { time: event.gameTime, period: event.period as Period };
    }

    // Determine new leader
    let newLeader: 'home' | 'away' | 'tied';
    if (homeScore > awayScore) {
      newLeader = 'home';
    } else if (awayScore > homeScore) {
      newLeader = 'away';
    } else {
      newLeader = 'tied';
    }

    // Count lead changes and ties
    if (newLeader === 'tied' && currentLeader !== 'tied' && homeScore > 0) {
      scoreTiedCount++;
    }
    if (
      newLeader !== 'tied' &&
      currentLeader !== null &&
      currentLeader !== 'tied' &&
      newLeader !== currentLeader
    ) {
      leadChanges++;
    }
    currentLeader = newLeader;

    // Track largest leads
    const homeLead = homeScore - awayScore;
    const awayLead = awayScore - homeScore;

    if (homeLead > homeTeamLargestLead.points) {
      homeTeamLargestLead = {
        points: homeLead,
        time: event.gameTime,
        period: event.period as Period,
      };
    }
    if (awayLead > awayTeamLargestLead.points) {
      awayTeamLargestLead = {
        points: awayLead,
        time: event.gameTime,
        period: event.period as Period,
      };
    }
  }

  // Check final run
  if (currentRunTeam && currentRunPoints > (largestRun?.points || 0)) {
    largestRun = {
      team: currentRunTeam,
      teamName: currentRunTeam === 'home' ? homeTeamName : awayTeamName,
      points: currentRunPoints,
      startTime: currentRunStart.time,
      endTime: 'End',
      period: currentRunStart.period,
    };
  }

  return {
    scoreTiedCount,
    leadChanges,
    largestScoringRun: largestRun,
    homeTeamLargestLead,
    awayTeamLargestLead,
  };
}

// ============================================
// Main Game Summary Calculator
// ============================================

/**
 * Calculate complete game summary with all statistics
 */
export function calculateGameSummary(
  game: GameWithTeams,
  events: PlayEventResponse[]
): GameSummary {
  // Get starter IDs (players initially on court)
  const homeStarters = game.homeTeam.players.filter((p) => p.isOnCourt).map((p) => p.id);
  const awayStarters = game.awayTeam.players.filter((p) => p.isOnCourt).map((p) => p.id);

  // Calculate player box scores
  const homePlayers = game.homeTeam.players.map((player) =>
    calculatePlayerBoxScore(player, events, homeStarters, game.currentPeriod)
  );
  const awayPlayers = game.awayTeam.players.map((player) =>
    calculatePlayerBoxScore(player, events, awayStarters, game.currentPeriod)
  );

  // Sort players: starters first (by points desc), then bench (by points desc)
  const sortPlayers = (players: PlayerBoxScore[]) => {
    const starters = players.filter((p) => p.isStarter).sort((a, b) => b.points - a.points);
    const bench = players.filter((p) => !p.isStarter).sort((a, b) => b.points - a.points);
    return [...starters, ...bench];
  };

  const sortedHomePlayers = sortPlayers(homePlayers);
  const sortedAwayPlayers = sortPlayers(awayPlayers);

  // Calculate team box scores
  const homeTeamBoxScore = calculateTeamBoxScore(
    game.homeTeam,
    homePlayers,
    events,
    game.awayTeam.id
  );
  const awayTeamBoxScore = calculateTeamBoxScore(
    game.awayTeam,
    awayPlayers,
    events,
    game.homeTeam.id
  );

  // Calculate game flow
  const gameFlow = calculateGameFlow(
    events,
    game.homeTeam.id,
    game.awayTeam.id,
    game.homeTeam.name,
    game.awayTeam.name
  );

  // Count plays by period
  const playsByPeriod: Partial<Record<Period, number>> = {};
  for (const event of events) {
    const period = event.period as Period;
    playsByPeriod[period] = (playsByPeriod[period] || 0) + 1;
  }

  return {
    gameId: game.id,
    date: new Date(game.date),
    venue: game.venue || undefined,
    status: game.status,

    homeTeam: homeTeamBoxScore,
    awayTeam: awayTeamBoxScore,
    homePlayers: sortedHomePlayers,
    awayPlayers: sortedAwayPlayers,

    gameFlow,

    totalPlays: events.length,
    playsByPeriod,
  };
}
