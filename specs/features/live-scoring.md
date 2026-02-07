# Live Scoring Feature Spec

## Overview
The core feature for capturing basketball statistics in real-time during a game. Optimized for speed - every stat should be recordable in under 2 seconds.

## User Stories
- As a statistician, I want to quickly record shots (made/missed, 2PT/3PT)
- As a statistician, I want to record rebounds, assists, steals, blocks with minimal taps
- As a statistician, I want to easily correct mistakes without disrupting the flow
- As a statistician, I want to see the current score and period at all times
- As a statistician, I want to track which players are on the court

## Requirements

### Must Have (MVP)
- [ ] Quick shot entry (2PT/3PT, made/missed)
- [ ] Quick stat entry (rebound, assist, steal, block, turnover, foul)
- [ ] Player selection via jersey number
- [ ] Score display always visible
- [ ] Period/quarter tracking
- [ ] Undo last action
- [ ] Substitution tracking
- [ ] Auto-saves to server after every action

### Should Have
- [ ] Court diagram for shot location
- [ ] Fast-break flag on shots
- [ ] Assist attribution after made shot
- [ ] Turnover type selection
- [ ] Foul type selection
- [ ] Play-by-play feed (scrollable)
- [ ] Timeout tracking

### Could Have
- [ ] Voice input for stats
- [ ] Auto-possession tracking
- [ ] Shot chart visualization
- [ ] Live stats sharing

---

## UI Components

### ScoreHeader
Always visible header showing game state.

```typescript
interface ScoreHeaderProps {
  homeTeam: {
    name: string
    shortName: string
    score: number
    color: string
    timeoutsRemaining: number
    inBonus: boolean
  }
  awayTeam: {
    name: string
    shortName: string
    score: number
    color: string
    timeoutsRemaining: number
    inBonus: boolean
  }
  period: Period
  gameTime: string        // Countdown timer display
  possession: 'home' | 'away' | null
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  HAWKS          Q2  5:32          BULLS               │
│    45            ●                  38                 │
│  ○○○○                              ○○○                │
└─────────────────────────────────────────────────────────┘
     ↑                                  ↑
  Team score                      Timeouts remaining
     ● = possession indicator
```

### TeamPanel
Shows players on court with quick-select buttons.

```typescript
interface TeamPanelProps {
  team: Team
  onPlayerSelect: (playerId: string) => void
  selectedPlayerId?: string
  isActiveTeam: boolean    // Highlighted when their possession
}
```

**Layout:**
```
┌─────────────────────────┐
│ HAWKS (Home)            │
├─────────────────────────┤
│ ON COURT:               │
│ [11] [23] [05] [44] [7] │  ← Large tap targets
├─────────────────────────┤
│ BENCH:                  │
│ [12] [20] [33] [15]     │  ← Smaller buttons
└─────────────────────────┘
```

### QuickStatPanel
Large buttons for recording common stats.

```typescript
interface QuickStatPanelProps {
  selectedPlayerId?: string
  selectedPlayerName?: string
  selectedPlayerNumber?: number
  onStatRecord: (stat: QuickStatInput) => void
  disabled: boolean       // Disabled if no player selected
}
```

**Layout (Main Stats):**
```
┌─────────────────────────────────────────────────────────┐
│  #23 JORDAN                                    [UNDO]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  2PT ✓  │  │  2PT ✗  │  │  3PT ✓  │  │  3PT ✗  │    │
│  │  MADE   │  │  MISS   │  │  MADE   │  │  MISS   │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │   REB   │  │   AST   │  │   STL   │  │   BLK   │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │   T/O   │  │  FOUL   │  │   FT    │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### FreeThrowModal
Quick free throw entry.

```typescript
interface FreeThrowModalProps {
  player: Player
  freeThrows: 1 | 2 | 3
  onComplete: (made: boolean[]) => void
  onCancel: () => void
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  Free Throws - #23 Jordan          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  2 Free Throws                          │
│                                         │
│  FT 1:  [ ✓ MADE ]  [ ✗ MISS ]         │
│                                         │
│  FT 2:  [ ✓ MADE ]  [ ✗ MISS ]         │
│                                         │
│                          [Done]         │
└─────────────────────────────────────────┘
```

### TurnoverTypeModal
Select turnover type (per FIBA Appendix B).

```typescript
interface TurnoverTypeModalProps {
  player: Player
  onSelect: (type: TurnoverType) => void
  onCancel: () => void
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  Turnover Type - #23 Jordan        ✕   │
├─────────────────────────────────────────┤
│                                         │
│  [Bad Pass]     [Ball Handling]         │
│  [Out of Bounds] [Travelling]           │
│  [3 Seconds]    [5 Seconds]             │
│  [8 Seconds]    [Shot Clock]            │
│  [Backcourt]    [Off. Foul]             │
│  [Double Dribble] [Carrying]            │
│  [Other]                                │
│                                         │
└─────────────────────────────────────────┘
```

### PlayByPlayFeed
Scrollable list of recent plays.

```typescript
interface PlayByPlayFeedProps {
  events: PlayEvent[]
  onEventTap: (event: PlayEvent) => void  // For editing/deleting
  maxVisible?: number     // Default: 5 recent
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  PLAY-BY-PLAY                              [Expand ↓]   │
├─────────────────────────────────────────────────────────┤
│  Q2 5:45  HAWKS  #23 Jordan 2PT Made (Assist #11)      │
│  Q2 5:32  BULLS  #45 Smith 3PT Miss                    │
│  Q2 5:30  HAWKS  #44 Lee DEF Rebound                   │
│  Q2 5:15  HAWKS  #05 Davis Turnover (Bad Pass)         │
│  Q2 5:12  BULLS  #22 Brown Steal                       │
└─────────────────────────────────────────────────────────┘
```

### SubstitutionPanel
Quick player substitution.

```typescript
interface SubstitutionPanelProps {
  team: Team
  onSubstitution: (playerIn: string, playerOut: string) => void
}
```

### UndoButton
Always accessible undo action.

```typescript
interface UndoButtonProps {
  lastEvent?: PlayEvent
  onUndo: () => void
  disabled: boolean
}
```

---

## Page Layout

### Main Scoring View (Landscape Tablet - Primary)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCORE HEADER                                       │
│  HAWKS 45        Q2 5:32 ●        BULLS 38                                   │
├───────────────────┬─────────────────────────────────┬───────────────────────┤
│                   │                                 │                       │
│  HAWKS            │     QUICK STAT PANEL            │           BULLS       │
│  ┌────────────┐   │                                 │   ┌────────────┐     │
│  │ ON COURT   │   │   Selected: #23 JORDAN          │   │ ON COURT   │     │
│  │[11][23][05]│   │                                 │   │[10][22][33]│     │
│  │[44][ 7]    │   │  [2PT✓][2PT✗][3PT✓][3PT✗]      │   │[45][12]    │     │
│  ├────────────┤   │                                 │   ├────────────┤     │
│  │ BENCH      │   │  [REB] [AST] [STL] [BLK]       │   │ BENCH      │     │
│  │[12][20][33]│   │                                 │   │[15][24][00]│     │
│  │[15]        │   │  [T/O] [FOUL] [FT]             │   │[31]        │     │
│  └────────────┘   │                                 │   └────────────┘     │
│                   │              [UNDO LAST]        │                       │
├───────────────────┴─────────────────────────────────┴───────────────────────┤
│  PLAY-BY-PLAY: Q2 5:45 #23 2PT Made | Q2 5:32 #45 3PT Miss | ...           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Portrait Phone Layout
```
┌─────────────────────────────────┐
│ HAWKS 45   Q2 5:32   BULLS 38  │
├─────────────────────────────────┤
│ [11][23][05][44][7]  ← HAWKS   │
│ [10][22][33][45][12] ← BULLS   │
├─────────────────────────────────┤
│  Selected: #23 JORDAN  [UNDO]  │
├─────────────────────────────────┤
│  [2PT ✓]  [2PT ✗]              │
│  [3PT ✓]  [3PT ✗]              │
├─────────────────────────────────┤
│ [REB][AST][STL][BLK][T/O][FOUL]│
├─────────────────────────────────┤
│ Q2 5:45 #23 2PT Made           │
│ Q2 5:32 #45 3PT Miss           │
└─────────────────────────────────┘
```

---

## Interaction Flows

### Recording a Made Shot
1. Tap player number (e.g., `[23]`) → Player selected, highlighted
2. Tap `[2PT ✓]` or `[3PT ✓]` → Shot recorded, score updates
3. (Optional) If assisted, quick prompt: "Assisted by?" → Tap another player or dismiss
4. Player deselected, ready for next play

**Total taps: 2-3**

### Recording a Missed Shot + Rebound
1. Tap player number → Player selected
2. Tap `[2PT ✗]` or `[3PT ✗]` → Missed shot recorded
3. Tap player who got rebound (same or other team)
4. Tap `[REB]` → Rebound recorded (auto-detects offensive/defensive)

**Total taps: 4**

### Recording a Turnover + Steal
1. Tap player who turned it over
2. Tap `[T/O]` → Turnover modal opens
3. Tap turnover type (e.g., `[Bad Pass]`)
4. System prompts: "Stolen by?" → Tap opponent player (optional)

**Total taps: 3-4**

### Undo Last Action
1. Tap `[UNDO]` → Confirmation with last action shown
2. Swipe or tap confirm → Action reversed

**Total taps: 2**

### Substitution
1. Long-press bench player → Sub mode activated
2. Tap on-court player to replace → Substitution recorded
3. Players swap positions

**Total taps: 2**

---

## State Management

### Game State (Client-side)
```typescript
interface LiveGameState {
  game: Game
  events: PlayEvent[]
  selectedPlayerId: string | null
  selectedTeam: 'home' | 'away' | null
  pendingAssist: string | null    // After made shot, waiting for assist
  pendingSteal: string | null     // After turnover, waiting for steal
  isUndoAvailable: boolean
  lastEvent: PlayEvent | null
}
```

### Auto-calculated Values
- Current score (sum of FGM + FTM)
- Possession (based on last event)
- Team fouls per period (for bonus tracking)
- Player fouls (for foul-out warning)

---

## Data Persistence

### Storage Strategy
- SQLite database for server-side storage
- Auto-save after every event via API
- Game state reconstructed from events on load

### API Operations
```typescript
// Auto-save on every event
async function saveEvent(event: PlayEvent) {
  await fetch('/api/events', {
    method: 'POST',
    body: JSON.stringify(event)
  })
}

// Load game on page mount
async function loadGame(gameId: string) {
  const res = await fetch(`/api/games/${gameId}`)
  return res.json()
}
```

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| No player selected | Stat buttons disabled with tooltip |
| Double-tap prevention | 300ms debounce on all actions |
| Invalid stat combo | Toast message explaining issue |
| Storage full | Warning banner, suggest export |
| App crash mid-game | Auto-recover from last saved state |

---

## Acceptance Criteria

### Speed
1. ✅ Any common stat recordable in ≤ 2 taps
2. ✅ UI response time < 100ms for all actions
3. ✅ No loading spinners during game flow

### Accuracy
4. ✅ Score automatically calculated from events
5. ✅ Possession tracked correctly per FIBA rules
6. ✅ All stat types from FIBA manual supported

### Reliability
7. ✅ Auto-saves every action to server
8. ✅ No data loss on app crash or close
9. ✅ Undo available for any action

### Usability
10. ✅ Large tap targets (min 48x48px)
11. ✅ Clear visual feedback on all actions
12. ✅ Works on tablet (landscape) and phone (portrait)
13. ✅ Current score always visible

---

## File Structure
```
src/
├── app/
│   └── game/
│       └── [id]/
│           ├── page.tsx          # Live scoring page
│           ├── loading.tsx       # Loading state
│           └── error.tsx         # Error boundary
├── components/
│   └── live-scoring/
│       ├── ScoreHeader.tsx
│       ├── TeamPanel.tsx
│       ├── QuickStatPanel.tsx
│       ├── FreeThrowModal.tsx
│       ├── TurnoverTypeModal.tsx
│       ├── PlayByPlayFeed.tsx
│       ├── SubstitutionPanel.tsx
│       └── UndoButton.tsx
├── hooks/
│   ├── useLiveGame.ts            # Game state management
│   └── useGameClock.ts           # Timer logic
└── services/
    └── game-api.ts               # API client for persistence
```
