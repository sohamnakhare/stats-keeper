# Basketball Stats - Data Models

Based on **FIBA Statisticians' Manual 2024**

---

## Core Entities

### Game
```typescript
interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: Date
  venue?: string
  status: GameStatus
  currentPeriod: Period
  currentPossession: 'home' | 'away' | null
  possessionArrow: 'home' | 'away'  // For jump ball situations
  periods: PeriodData[]
  createdAt: Date
  updatedAt: Date
}

type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
type Period = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT1' | 'OT2' | 'OT3'

interface PeriodData {
  period: Period
  homeScore: number
  awayScore: number
  startTime?: Date
  endTime?: Date
}
```

### Team
```typescript
interface Team {
  id: string
  name: string
  shortName: string       // 3-letter abbreviation
  color: string           // Primary color (hex)
  players: Player[]
  startingFive: string[]  // Player IDs
}
```

### Player
```typescript
interface Player {
  id: string
  teamId: string
  number: number          // Jersey number
  name: string
  position?: Position
  isCaptain: boolean
  isOnCourt: boolean
  foulsCommitted: number  // Track for foul-out
}

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C'
```

---

## Play-by-Play Events

### Base Event
```typescript
interface PlayEvent {
  id: string
  gameId: string
  period: Period
  gameTime: string        // "09:45" format (time remaining)
  timestamp: Date         // Real-world time
  teamId: string
  playerId?: string       // Some events are team-level
  eventType: EventType
}

type EventType = 
  | 'field_goal_made'
  | 'field_goal_missed'
  | 'free_throw_made'
  | 'free_throw_missed'
  | 'offensive_rebound'
  | 'defensive_rebound'
  | 'team_rebound'
  | 'assist'
  | 'turnover'
  | 'steal'
  | 'block'
  | 'foul'
  | 'substitution'
  | 'timeout'
  | 'period_start'
  | 'period_end'
```

### Field Goal Event (FIBA Chapter 2)
```typescript
interface FieldGoalEvent extends PlayEvent {
  eventType: 'field_goal_made' | 'field_goal_missed'
  shotType: ShotType
  shotZone: ShotZone
  points: 2 | 3
  assistedBy?: string     // Player ID if assisted
  blockedBy?: string      // Player ID if blocked
  isFastBreak: boolean
  isSecondChance: boolean // After offensive rebound
  isPaintPoints: boolean  // Shot from restricted area
}

type ShotType = 
  | 'layup'
  | 'dunk'
  | 'jump_shot'
  | 'hook_shot'
  | 'tip_in'
  | 'floater'
  | 'fadeaway'
  | 'stepback'
  | 'pullup'
  | 'alley_oop'
  | 'putback'

type ShotZone = 
  | 'paint'               // Restricted area
  | 'mid_range'           // Inside 3PT line, outside paint
  | 'three_point'         // Behind 3PT line
  | 'backcourt'           // Rare, but possible
```

### Free Throw Event (FIBA Chapter 3)
```typescript
interface FreeThrowEvent extends PlayEvent {
  eventType: 'free_throw_made' | 'free_throw_missed'
  freeThrowNumber: number   // 1, 2, or 3
  totalFreeThrows: number   // Total awarded (1, 2, or 3)
}
```

### Rebound Event (FIBA Chapter 4)
```typescript
interface ReboundEvent extends PlayEvent {
  eventType: 'offensive_rebound' | 'defensive_rebound' | 'team_rebound'
  isTeamRebound: boolean    // No specific player credited
  followingEventId: string  // Links to missed shot
}
```

### Turnover Event (FIBA Chapter 5)
```typescript
interface TurnoverEvent extends PlayEvent {
  eventType: 'turnover'
  turnoverType: TurnoverType
  stolenBy?: string         // Player ID if stolen
}

// Per FIBA Appendix B
type TurnoverType = 
  | 'bad_pass'
  | 'ball_handling'
  | 'out_of_bounds'
  | 'travelling'
  | 'three_seconds'
  | 'five_seconds'
  | 'eight_seconds'
  | 'shot_clock'
  | 'backcourt'
  | 'offensive_foul'
  | 'disqualifying_foul'
  | 'offensive_goaltending'
  | 'double_dribble'
  | 'carrying'
  | 'other'
```

### Assist Event (FIBA Chapter 6)
```typescript
interface AssistEvent extends PlayEvent {
  eventType: 'assist'
  scoringEventId: string    // Links to the FGM
  scoringPlayerId: string   // Who scored
}
```

### Steal Event (FIBA Chapter 7)
```typescript
interface StealEvent extends PlayEvent {
  eventType: 'steal'
  turnoverEventId: string   // Links to opponent's turnover
  stolenFrom: string        // Player ID who lost ball
}
```

### Block Event (FIBA Chapter 8)
```typescript
interface BlockEvent extends PlayEvent {
  eventType: 'block'
  shotEventId: string       // Links to blocked shot
  blockedPlayer: string     // Player ID whose shot was blocked
}
```

### Foul Event (FIBA Chapter 9)
```typescript
interface FoulEvent extends PlayEvent {
  eventType: 'foul'
  foulType: FoulType
  drawnBy?: string          // Player ID who drew the foul
  freeThrowsAwarded: 0 | 1 | 2 | 3
  isTeamFoul: boolean       // Counts toward bonus
  isFlagrant: boolean
}

type FoulType = 
  | 'personal'
  | 'shooting'
  | 'offensive'
  | 'technical'
  | 'unsportsmanlike'
  | 'disqualifying'
```

### Substitution Event
```typescript
interface SubstitutionEvent extends PlayEvent {
  eventType: 'substitution'
  playerIn: string          // Player ID entering
  playerOut: string         // Player ID leaving
}
```

---

## Computed Statistics

### Player Box Score
```typescript
interface PlayerBoxScore {
  playerId: string
  playerName: string
  playerNumber: number
  
  // Time
  minutesPlayed: string     // "32:45" format
  
  // Scoring
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPercentage: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPercentage: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPercentage: number
  
  // Rebounds
  offensiveRebounds: number
  defensiveRebounds: number
  totalRebounds: number
  
  // Playmaking
  assists: number
  turnovers: number
  
  // Defense
  steals: number
  blocks: number
  
  // Fouls
  personalFouls: number
  foulsDrawn: number
  
  // Advanced
  plusMinus: number
  efficiencyRating: number  // PTS - (FGA-FGM) - (FTA-FTM) + REB + AST - TO + ST + BS
}
```

### Team Box Score
```typescript
interface TeamBoxScore {
  teamId: string
  teamName: string
  
  // Score
  totalPoints: number
  pointsByPeriod: Record<Period, number>
  
  // Shooting
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPercentage: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPercentage: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPercentage: number
  
  // Rebounds
  offensiveRebounds: number
  defensiveRebounds: number
  totalRebounds: number
  
  // Other
  assists: number
  turnovers: number
  steals: number
  blocks: number
  personalFouls: number
  
  // FIBA Appendix C - Additional Data
  pointsInPaint: number
  fastBreakPoints: number
  secondChancePoints: number
  pointsOffTurnovers: number
  benchPoints: number
  
  // Game Flow
  largestLead: number
  largestLeadTime: string   // When it occurred
  timeLeading: string       // Total time with lead
}
```

### Game Summary (FIBA Appendix C)
```typescript
interface GameSummary {
  gameId: string
  homeTeam: TeamBoxScore
  awayTeam: TeamBoxScore
  homePlayers: PlayerBoxScore[]
  awayPlayers: PlayerBoxScore[]
  
  // Game Flow
  scoreTiedCount: number    // Times score was tied (excl. 0-0)
  leadChanges: number       // Times lead changed teams
  largestScoringRun: {
    team: 'home' | 'away'
    points: number
    startTime: string
    endTime: string
  }
  
  // Play-by-play
  totalPlays: number
  playsByPeriod: Record<Period, number>
}
```

---

## Quick Entry Types

For fast game-speed entry, simplified input types:

### Quick Shot Entry
```typescript
interface QuickShotInput {
  playerId: string
  made: boolean
  points: 2 | 3
  assisted?: boolean        // Optional, can add later
  fastBreak?: boolean       // Optional flag
}
```

### Quick Stat Entry
```typescript
interface QuickStatInput {
  playerId: string
  statType: 'rebound' | 'assist' | 'steal' | 'block' | 'turnover' | 'foul'
  subType?: string          // e.g., turnover type
}
```

### Undo Action
```typescript
interface UndoAction {
  eventId: string
  reason?: string
}
```

---

## Storage Types

### Live Game State
```typescript
interface LiveGameState {
  game: Game
  events: PlayEvent[]
  lastSavedAt: Date
}
```
