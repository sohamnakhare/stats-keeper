# Game Setup Feature Spec

## Overview
Before live scoring begins, users need to set up the game with teams, rosters, and starting lineups. This should be quick but thorough enough to enable accurate stat tracking.

## User Stories
- As a statistician, I want to quickly set up a new game with two teams
- As a statistician, I want to enter player rosters with jersey numbers
- As a statistician, I want to select starting five for each team
- As a statistician, I want to save team rosters for reuse

## Requirements

### Must Have
- [ ] Create new game with home/away teams
- [ ] Enter team name and abbreviation
- [ ] Add players with jersey number and name
- [ ] Select starting five for each team
- [ ] Designate team captain
- [ ] Save/load team templates

### Should Have
- [ ] Import roster from CSV
- [ ] Team color selection
- [ ] Player position assignment
- [ ] Recent teams quick-select

### Could Have
- [ ] Scan roster from image/document
- [ ] League/tournament organization
- [ ] Schedule management

---

## UI Components

### NewGameForm
Initial game creation form.

```typescript
interface NewGameFormProps {
  onSubmit: (game: Partial<Game>) => void
  recentTeams: Team[]
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  New Game                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Date: [February 7, 2026    📅]                        │
│  Venue: [City Arena                    ] (optional)     │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  HOME TEAM                    AWAY TEAM                 │
│  ┌─────────────────────┐     ┌─────────────────────┐   │
│  │ Team Name           │     │ Team Name           │   │
│  │ [Hawks           ]  │     │ [Bulls           ]  │   │
│  │                     │     │                     │   │
│  │ Short: [HWK]        │     │ Short: [BUL]        │   │
│  │ Color: [🔴 Red   ▼] │     │ Color: [🔵 Blue  ▼] │   │
│  └─────────────────────┘     └─────────────────────┘   │
│                                                         │
│  Or select from recent:                                 │
│  [Lakers] [Warriors] [Celtics] [Heat] ...              │
│                                                         │
│                              [Next: Add Rosters →]      │
└─────────────────────────────────────────────────────────┘
```

### RosterEditor
Add/edit players for a team.

```typescript
interface RosterEditorProps {
  team: Team
  onUpdate: (team: Team) => void
  onLoadTemplate: (templateId: string) => void
  onSaveTemplate: () => void
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Hawks Roster                    [Load Template ▼]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  #    Name                    Pos    Captain  Starting  │
│  ┌─────────────────────────────────────────────────────┐│
│  │[11] [Trae Young        ] [PG ▼]   ☆        ✓       ││
│  │[23] [Dejounte Murray   ] [SG ▼]   ○        ✓       ││
│  │[05] [Jalen Johnson     ] [SF ▼]   ○        ✓       ││
│  │[44] [De'Andre Hunter   ] [PF ▼]   ○        ✓       ││
│  │[ 7] [Onyeka Okongwu    ] [ C ▼]   ○        ✓       ││
│  │─────────────────────────────────────────────────────││
│  │[12] [Bogdan Bogdanovic ] [SG ▼]   ○        ○       ││
│  │[20] [John Collins      ] [PF ▼]   ○        ○       ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [+ Add Player]              [Save as Template]         │
│                                                         │
│           [← Back]                    [Start Game →]    │
└─────────────────────────────────────────────────────────┘
```

### PlayerRow
Individual player entry.

```typescript
interface PlayerRowProps {
  player: Player
  onUpdate: (player: Player) => void
  onDelete: () => void
  isStarter: boolean
  onStarterToggle: () => void
  isCaptain: boolean
  onCaptainToggle: () => void
}
```

### StartingFiveSelector
Visual selection of starting lineup.

```typescript
interface StartingFiveSelectorProps {
  players: Player[]
  starters: string[]      // Player IDs
  onStartersChange: (playerIds: string[]) => void
  maxStarters: 5
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Select Starting Five (5/5 selected)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   STARTERS:                                             │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│   │ #11 │ │ #23 │ │ #05 │ │ #44 │ │ #7  │             │
│   │Young│ │Murry│ │Johns│ │Huntr│ │Okong│             │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘             │
│                                                         │
│   BENCH:                                                │
│   ┌─────┐ ┌─────┐ ┌─────┐                              │
│   │ #12 │ │ #20 │ │ #33 │  (tap to swap with starter) │
│   │Bogdn│ │Colns│ │Gritn│                              │
│   └─────┘ └─────┘ └─────┘                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### TeamTemplateSelector
Quick-load saved team rosters.

```typescript
interface TeamTemplateSelectorProps {
  templates: TeamTemplate[]
  onSelect: (template: TeamTemplate) => void
  onDelete: (templateId: string) => void
}

interface TeamTemplate {
  id: string
  teamName: string
  players: Omit<Player, 'id' | 'teamId'>[]
  createdAt: Date
  lastUsed: Date
}
```

---

## Validation Rules

| Field | Rules |
|-------|-------|
| Team name | Required, 2-30 characters |
| Short name | Required, exactly 3 characters, uppercase |
| Player number | Required, 0-99, unique per team |
| Player name | Required, 2-50 characters |
| Starting five | Exactly 5 players required |
| Captain | Exactly 1 per team, must be starter |

---

## Interaction Flows

### Quick Game Setup (Using Templates)
1. Tap "New Game"
2. Select home team from recent/templates
3. Select away team from recent/templates
4. Verify starting fives
5. Start game

**Time: ~30 seconds**

### Full Game Setup (New Teams)
1. Tap "New Game"
2. Enter home team name, short name, color
3. Add 8-15 players with numbers
4. Select starting five and captain
5. Repeat for away team
6. Start game

**Time: ~5-10 minutes**

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| Duplicate jersey number | Inline error, prevent save |
| Less than 5 players | Warning, can't select starters |
| No captain selected | Auto-select first starter |
| Same color both teams | Warning with suggestion |

---

## Acceptance Criteria

1. ✅ Can create game with two teams in under 1 minute (with templates)
2. ✅ All players have unique jersey numbers per team
3. ✅ Starting five selection is intuitive (tap to toggle)
4. ✅ Team templates persist across sessions
5. ✅ Can edit roster after game setup (before starting)
6. ✅ Visual distinction between home/away teams
7. ✅ Validation errors are clear and actionable

---

## File Structure
```
src/
├── app/
│   └── game/
│       └── new/
│           ├── page.tsx          # Game setup wizard
│           └── roster/
│               └── page.tsx      # Roster editing
├── components/
│   └── game-setup/
│       ├── NewGameForm.tsx
│       ├── RosterEditor.tsx
│       ├── PlayerRow.tsx
│       ├── StartingFiveSelector.tsx
│       └── TeamTemplateSelector.tsx
└── services/
    └── team-templates.ts         # Template storage
```
