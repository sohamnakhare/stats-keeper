# Game Summary Feature Spec

## Overview
After a game ends (or during breaks), display comprehensive box scores and statistics following FIBA format. Also provides play-by-play review and stat export capabilities.

## User Stories
- As a statistician, I want to see the final box score for both teams
- As a coach, I want to review individual player statistics
- As a statistician, I want to export stats for reporting
- As a user, I want to review and edit any recorded play

## Requirements

### Must Have
- [ ] Team box score (all FIBA stats)
- [ ] Individual player box scores
- [ ] Full play-by-play log
- [ ] Edit/delete any recorded event
- [ ] Score by period breakdown
- [ ] Export to PDF/CSV

### Should Have
- [ ] Shot chart visualization
- [ ] Advanced stats (per FIBA Appendix C)
- [ ] Game highlights (biggest plays)
- [ ] Comparison view (team vs team)

### Could Have
- [ ] Share to social media
- [ ] Generate game report narrative
- [ ] Historical comparison

---

## UI Components

### BoxScoreTable
Standard basketball box score format.

```typescript
interface BoxScoreTableProps {
  team: Team
  players: PlayerBoxScore[]
  teamTotals: TeamBoxScore
  onPlayerClick?: (playerId: string) => void
}
```

**Layout:**
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  HAWKS                                                                          FINAL  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  #   Player          MIN   PTS  FG     3PT    FT     REB  AST  STL  BLK  TO   PF  +/- │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  11  T. Young        34:21  28  10-18  4-8   4-5     2-6   11   2    0    4   2  +12  │
│  23  D. Murray       32:45  18   7-14  2-5   2-2     3-7    5   3    1    2   3   +8  │
│  05  J. Johnson      28:30  12   5-9   1-2   1-2     2-8    2   1    2    1   4   +5  │
│  44  D. Hunter       30:15  15   6-11  2-4   1-2     1-4    3   0    0    0   2  +10  │
│   7  O. Okongwu      24:09   8   4-6   0-0   0-2     4-9    1   0    3    2   5   +7  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  12  B. Bogdanovic   18:22  11   4-8   3-5   0-0     0-2    2   1    0    1   1   -2  │
│  20  J. Collins      15:44   9   3-5   0-0   3-4     2-5    0   0    0    0   3   -1  │
│  33  A. Griffin      15:54   4   2-6   0-2   0-0     1-3    1   0    1    1   0   -4  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│      TOTALS          200   105  41-77  12-26  11-17  15-44  25   7    7   11  20       │
│      Percentages            53.2%  46.2%  64.7%                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### TeamComparisonCard
Side-by-side team stats.

```typescript
interface TeamComparisonCardProps {
  homeTeam: TeamBoxScore
  awayTeam: TeamBoxScore
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│           HAWKS  105    vs    98  BULLS                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Field Goals      41-77  (53.2%)  38-82  (46.3%)       │
│  3-Pointers       12-26  (46.2%)  10-31  (32.3%)       │
│  Free Throws      11-17  (64.7%)  12-14  (85.7%)       │
│  ─────────────────────────────────────────────────────  │
│  Rebounds         44            39                      │
│    Offensive      15            11                      │
│    Defensive      29            28                      │
│  Assists          25            22                      │
│  Turnovers        11            14                      │
│  Steals            7             5                      │
│  Blocks            7             4                      │
│  ─────────────────────────────────────────────────────  │
│  Points in Paint  48            42                      │
│  Fast Break Pts   18            12                      │
│  2nd Chance Pts   14             8                      │
│  Bench Points     24            18                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ScoreByPeriod
Quarter/period breakdown.

```typescript
interface ScoreByPeriodProps {
  homeTeam: {
    name: string
    periods: Record<Period, number>
    total: number
  }
  awayTeam: {
    name: string
    periods: Record<Period, number>
    total: number
  }
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│           Q1    Q2    Q3    Q4    TOTAL                 │
│  HAWKS    28    25    24    28     105                  │
│  BULLS    22    26    28    22      98                  │
└─────────────────────────────────────────────────────────┘
```

### PlayByPlayList
Complete game log with filtering.

```typescript
interface PlayByPlayListProps {
  events: PlayEvent[]
  filters: {
    period?: Period
    team?: string
    player?: string
    eventType?: EventType[]
  }
  onFilterChange: (filters: PlayByPlayFilters) => void
  onEventEdit: (event: PlayEvent) => void
  onEventDelete: (eventId: string) => void
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Play-by-Play                                           │
│  Filter: [All Periods ▼] [All Teams ▼] [All Types ▼]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Q4                                                     │
│  ─────────────────────────────────────────────────────  │
│  0:45  HAWKS  #11 Young 3PT Made (Assist #23 Murray)   │ 
│  0:32  BULLS  #22 Brown 2PT Miss                       │
│  0:30  HAWKS  #44 Hunter DEF Rebound                   │
│  0:15  HAWKS  #11 Young FT Made (1/2)                  │
│  0:15  HAWKS  #11 Young FT Made (2/2)                  │
│  0:00  END OF GAME                                     │
│                                                         │
│  Q3                                                     │
│  ─────────────────────────────────────────────────────  │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### GameFlowChart
Visual representation of score over time.

```typescript
interface GameFlowChartProps {
  events: PlayEvent[]
  homeTeamColor: string
  awayTeamColor: string
}
```

### AdvancedStatsCard
FIBA Appendix C computed statistics.

```typescript
interface AdvancedStatsCardProps {
  summary: GameSummary
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Game Flow                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Lead Changes:     12                                   │
│  Times Tied:        8                                   │
│  ─────────────────────────────────────────────────────  │
│  HAWKS Largest Lead:  +15 (Q2 3:45)                    │
│  BULLS Largest Lead:   +8 (Q3 6:22)                    │
│  ─────────────────────────────────────────────────────  │
│  Largest Run:  HAWKS 12-0 (Q2 5:30 - Q2 2:15)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ExportOptions
Export game data in various formats.

```typescript
interface ExportOptionsProps {
  gameId: string
  onExport: (format: ExportFormat) => void
}

type ExportFormat = 'pdf' | 'csv' | 'json'
```

---

## Page Layout

### Summary Tab View
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Games    HAWKS vs BULLS    Feb 7, 2026                          │
│                                                                             │
│  HAWKS  105                                               BULLS  98        │
│         FINAL                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Box Score]  [Play-by-Play]  [Advanced]  [Export]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Score by Period                                                     │   │
│  │           Q1    Q2    Q3    Q4    TOTAL                             │   │
│  │  HAWKS    28    25    24    28     105                              │   │
│  │  BULLS    22    26    28    22      98                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  HAWKS BOX SCORE                                                     │   │
│  │  ... (full box score table) ...                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BULLS BOX SCORE                                                     │   │
│  │  ... (full box score table) ...                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TEAM COMPARISON                                                     │   │
│  │  ... (side-by-side stats) ...                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Calculations (per FIBA Manual)

### Efficiency Rating (Appendix C.K)
```typescript
function calculateEfficiency(stats: PlayerBoxScore): number {
  return stats.points 
    - (stats.fieldGoalsAttempted - stats.fieldGoalsMade)
    - (stats.freeThrowsAttempted - stats.freeThrowsMade)
    + stats.totalRebounds 
    + stats.assists 
    - stats.turnovers 
    + stats.steals 
    + stats.blocks
}
```

### Plus/Minus (Appendix C.L)
```typescript
function calculatePlusMinus(playerId: string, events: PlayEvent[]): number {
  // Net points while player was on court
  let plusMinus = 0
  let isOnCourt = false
  
  for (const event of events) {
    if (event.eventType === 'substitution') {
      if (event.playerIn === playerId) isOnCourt = true
      if (event.playerOut === playerId) isOnCourt = false
    }
    if (isOnCourt && isScoring(event)) {
      plusMinus += event.teamId === playerTeam ? event.points : -event.points
    }
  }
  return plusMinus
}
```

### Minutes Played (Appendix C.A)
```typescript
function calculateMinutes(playerId: string, events: PlayEvent[]): string {
  // Track time between substitutions
  // Round per FIBA rules:
  // - < 30 sec rounds down
  // - >= 30 sec rounds up
  // - > 0 but < 1 min shows as 1 min
  // - 39 min always rounds down (to show didn't play full game)
}
```

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| Edit conflicts | Show diff, ask user to resolve |
| Export failure | Retry button with error message |
| Missing data | Show available stats, note gaps |

---

## Acceptance Criteria

1. ✅ Box score shows all FIBA-required statistics
2. ✅ Player stats match sum of recorded events
3. ✅ Can filter play-by-play by period/team/type
4. ✅ Can edit any recorded event from summary
5. ✅ Export produces valid PDF/CSV
6. ✅ Efficiency and +/- calculated correctly per FIBA
7. ✅ Score by period matches final score
8. ✅ Team comparison shows all Appendix C stats

---

## File Structure
```
src/
├── app/
│   └── game/
│       └── [id]/
│           └── summary/
│               ├── page.tsx      # Summary page
│               └── export/
│                   └── route.ts  # Export API
├── components/
│   └── game-summary/
│       ├── BoxScoreTable.tsx
│       ├── TeamComparisonCard.tsx
│       ├── ScoreByPeriod.tsx
│       ├── PlayByPlayList.tsx
│       ├── GameFlowChart.tsx
│       ├── AdvancedStatsCard.tsx
│       └── ExportOptions.tsx
└── lib/
    ├── stats-calculator.ts       # FIBA calculations
    └── export-generator.ts       # PDF/CSV generation
```
