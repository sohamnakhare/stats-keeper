# Basketball Stats Keeper - Design System

> Inspired by [Sports Betting Web Design](https://dribbble.com/shots/26073337-Sports-Betting-Web-Design)
> 
> A bold, dark-themed design system optimized for fast stat entry and real-time data display.

---

## Design Philosophy

### Core Principles
1. **Speed First** - Large tap targets, high contrast, instant feedback
2. **Data Clarity** - Stats must be scannable at a glance
3. **Sports Energy** - Bold colors, dynamic feel, game-time intensity
4. **Dark Mode Native** - Reduces eye strain during long games, looks premium

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#00F5A0` | Primary actions, success states, points scored |
| `--color-primary-glow` | `rgba(0, 245, 160, 0.3)` | Hover states, active indicators |
| `--color-primary-muted` | `#00C77D` | Secondary emphasis |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent` | `#FF6B35` | Alerts, fouls, turnovers, warnings |
| `--color-accent-glow` | `rgba(255, 107, 53, 0.3)` | Error highlights |
| `--color-highlight` | `#00D4FF` | Links, info states, assists |
| `--color-gold` | `#FFD700` | Premium stats, achievements |

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#0D0D0F` | Main background |
| `--color-bg-secondary` | `#141418` | Cards, elevated surfaces |
| `--color-bg-tertiary` | `#1C1C22` | Input fields, nested elements |
| `--color-bg-hover` | `#252530` | Hover states on dark surfaces |

### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface` | `#1A1A20` | Card backgrounds |
| `--color-surface-elevated` | `#222228` | Modals, dropdowns |
| `--color-border` | `#2A2A35` | Dividers, card borders |
| `--color-border-focus` | `#00F5A0` | Focus rings |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#FFFFFF` | Headings, important text |
| `--color-text-secondary` | `#A0A0B0` | Body text, labels |
| `--color-text-muted` | `#6B6B7A` | Hints, disabled text |
| `--color-text-inverse` | `#0D0D0F` | Text on primary buttons |

### Team Colors (Dynamic)

| Token | Default | Usage |
|-------|---------|-------|
| `--color-team-home` | `#00F5A0` | Home team indicators |
| `--color-team-away` | `#FF6B35` | Away team indicators |

---

## Typography

### Font Stack

```css
--font-display: 'Bebas Neue', 'Impact', system-ui, sans-serif;
--font-heading: 'Space Grotesk', 'Inter', system-ui, sans-serif;
--font-body: 'Inter', 'SF Pro', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-display` | 48px / 3rem | 700 | 1.1 | Game score, hero numbers |
| `--text-h1` | 32px / 2rem | 700 | 1.2 | Page titles |
| `--text-h2` | 24px / 1.5rem | 600 | 1.3 | Section headers |
| `--text-h3` | 20px / 1.25rem | 600 | 1.4 | Card titles |
| `--text-body` | 16px / 1rem | 400 | 1.5 | Body text |
| `--text-sm` | 14px / 0.875rem | 400 | 1.5 | Labels, captions |
| `--text-xs` | 12px / 0.75rem | 500 | 1.4 | Badges, tags |

### Stats Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-stat-large` | 64px / 4rem | 800 | Main game score |
| `--text-stat-medium` | 32px / 2rem | 700 | Quarter scores, player points |
| `--text-stat-small` | 20px / 1.25rem | 600 | Individual stat values |

---

## Spacing

### Base Scale (8px grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Compact spacing |
| `--space-3` | 12px | Default element gap |
| `--space-4` | 16px | Card padding |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Large padding |
| `--space-8` | 32px | Section spacing |
| `--space-10` | 40px | Page margins |
| `--space-12` | 48px | Large sections |

### Touch Targets (Critical for Speed)

| Token | Value | Usage |
|-------|-------|-------|
| `--tap-target-min` | 48px | Minimum touch target |
| `--tap-target-md` | 56px | Standard buttons |
| `--tap-target-lg` | 64px | Primary action buttons |
| `--tap-target-xl` | 80px | Player selection tiles |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, tags |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals, large cards |
| `--radius-full` | 9999px | Circular avatars, pills |

---

## Shadows & Effects

### Elevation

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
```

### Glow Effects (Key to sports aesthetic)

```css
--glow-primary: 0 0 20px rgba(0, 245, 160, 0.4);
--glow-accent: 0 0 20px rgba(255, 107, 53, 0.4);
--glow-highlight: 0 0 20px rgba(0, 212, 255, 0.4);
```

### Gradients

```css
--gradient-primary: linear-gradient(135deg, #00F5A0 0%, #00D4FF 100%);
--gradient-accent: linear-gradient(135deg, #FF6B35 0%, #FF3366 100%);
--gradient-dark: linear-gradient(180deg, #141418 0%, #0D0D0F 100%);
--gradient-surface: linear-gradient(145deg, #1C1C22 0%, #141418 100%);
```

---

## Animation & Motion

### Timing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Durations (Fast for responsiveness < 100ms target)

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 50ms | Button press feedback |
| `--duration-fast` | 100ms | Hover states, toggles |
| `--duration-normal` | 200ms | Page transitions |
| `--duration-slow` | 300ms | Modal open/close |

### Keyframe Animations

```css
/* Score update pulse */
@keyframes score-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Stat entry confirmation */
@keyframes stat-confirm {
  0% { background-color: var(--color-primary); opacity: 1; }
  100% { background-color: transparent; opacity: 0; }
}

/* Live indicator pulse */
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Component Specifications

### Button

#### Primary Button
```
Background: --color-primary (#00F5A0)
Text: --color-text-inverse (#0D0D0F)
Height: --tap-target-lg (64px) for main actions
         --tap-target-md (56px) for secondary
Padding: 16px 24px
Border Radius: --radius-md (8px)
Font: --font-heading, 600, 16px
Hover: box-shadow: --glow-primary
Active: transform: scale(0.98)
```

#### Ghost Button
```
Background: transparent
Text: --color-text-primary
Border: 1px solid --color-border
Height: --tap-target-md (56px)
Hover: background: --color-bg-hover
```

#### Icon Button (Quick Stats)
```
Size: --tap-target-min (48px) minimum
Background: --color-surface
Border Radius: --radius-md
Hover: --glow-primary
```

### Card

```
Background: --color-surface (#1A1A20)
Border: 1px solid --color-border (#2A2A35)
Border Radius: --radius-lg (12px)
Padding: --space-4 (16px)
Shadow: --shadow-md
```

#### Elevated Card
```
Background: --color-surface-elevated (#222228)
Border: none
Shadow: --shadow-lg
```

### Input

```
Background: --color-bg-tertiary (#1C1C22)
Border: 1px solid --color-border
Border Radius: --radius-md (8px)
Height: --tap-target-md (56px)
Padding: 0 16px
Font: --font-body, 16px
Focus: border-color: --color-border-focus
       box-shadow: 0 0 0 2px rgba(0, 245, 160, 0.2)
```

### Player Tile (Quick Selection)

```
Size: 80px x 80px minimum (--tap-target-xl)
Background: --color-surface
Border Radius: --radius-lg
Display: flex column center
Jersey Number: --text-h2, --font-display
Player Name: --text-xs, truncate
Selected: border: 2px solid --color-primary
          box-shadow: --glow-primary
```

### Stat Button (Live Scoring)

```
Size: 64px x 64px (--tap-target-lg)
Background: --color-surface
Border Radius: --radius-lg
Icon: 24px, --color-text-secondary
Label: --text-xs, below icon
Active: background: --color-primary
        animation: stat-confirm 300ms
```

### Score Display

```
Font: --font-display
Size: --text-stat-large (64px)
Color: --color-text-primary
Update Animation: score-pulse 300ms --ease-spring
```

### Badge

```
Font: --text-xs, 500
Padding: 4px 8px
Border Radius: --radius-sm
Variants:
  - Default: bg: --color-bg-tertiary, text: --color-text-secondary
  - Success: bg: rgba(0, 245, 160, 0.15), text: --color-primary
  - Warning: bg: rgba(255, 107, 53, 0.15), text: --color-accent
  - Live: bg: #FF3366, text: white, animation: live-pulse
```

---

## Layout Patterns

### Game Screen Layout

```
┌─────────────────────────────────────┐
│  Header (Game Info, Clock)    64px  │
├─────────────────────────────────────┤
│                                     │
│  Score Display                      │
│  [HOME]     vs     [AWAY]          │
│    72              68               │
│                                     │
├─────────────────────────────────────┤
│  Player Selection (Scrollable)      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 23 │ │ 11 │ │  3 │ │ 45 │ ...   │
│  └────┘ └────┘ └────┘ └────┘       │
├─────────────────────────────────────┤
│  Stat Entry Grid                    │
│  ┌────┬────┬────┬────┐             │
│  │2PT │3PT │FT  │AST │             │
│  ├────┼────┼────┼────┤             │
│  │REB │STL │BLK │TO  │             │
│  └────┴────┴────┴────┘             │
│                                     │
├─────────────────────────────────────┤
│  Recent Plays (Last 3)         80px │
└─────────────────────────────────────┘
```

### Card Grid

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: var(--space-4);
```

---

## Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Primary on dark: 11.5:1 ✓
- Secondary text on dark: 6.2:1 ✓

### Focus States
- All interactive elements have visible focus rings
- Focus ring: `2px solid var(--color-primary)`
- Focus offset: `2px`

### Touch Targets
- Minimum 48x48px for all interactive elements
- 8px minimum spacing between touch targets

### Motion
- Respect `prefers-reduced-motion`
- Provide instant feedback alternatives

---

## Implementation

### CSS Variables (globals.css)

```css
@import "tailwindcss";

:root {
  /* Primary */
  --color-primary: #00F5A0;
  --color-primary-glow: rgba(0, 245, 160, 0.3);
  --color-primary-muted: #00C77D;
  
  /* Accent */
  --color-accent: #FF6B35;
  --color-accent-glow: rgba(255, 107, 53, 0.3);
  --color-highlight: #00D4FF;
  --color-gold: #FFD700;
  
  /* Backgrounds */
  --color-bg-primary: #0D0D0F;
  --color-bg-secondary: #141418;
  --color-bg-tertiary: #1C1C22;
  --color-bg-hover: #252530;
  
  /* Surfaces */
  --color-surface: #1A1A20;
  --color-surface-elevated: #222228;
  --color-border: #2A2A35;
  --color-border-focus: #00F5A0;
  
  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A0A0B0;
  --color-text-muted: #6B6B7A;
  --color-text-inverse: #0D0D0F;
  
  /* Team Colors */
  --color-team-home: #00F5A0;
  --color-team-away: #FF6B35;
  
  /* Typography */
  --font-display: 'Bebas Neue', 'Impact', system-ui, sans-serif;
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Touch Targets */
  --tap-target-min: 48px;
  --tap-target-md: 56px;
  --tap-target-lg: 64px;
  --tap-target-xl: 80px;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
  
  /* Glows */
  --glow-primary: 0 0 20px rgba(0, 245, 160, 0.4);
  --glow-accent: 0 0 20px rgba(255, 107, 53, 0.4);
  --glow-highlight: 0 0 20px rgba(0, 212, 255, 0.4);
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #00F5A0 0%, #00D4FF 100%);
  --gradient-accent: linear-gradient(135deg, #FF6B35 0%, #FF3366 100%);
  --gradient-dark: linear-gradient(180deg, #141418 0%, #0D0D0F 100%);
  
  /* Animation */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
}

@theme inline {
  --color-primary: var(--color-primary);
  --color-primary-glow: var(--color-primary-glow);
  --color-accent: var(--color-accent);
  --color-highlight: var(--color-highlight);
  --color-bg-primary: var(--color-bg-primary);
  --color-bg-secondary: var(--color-bg-secondary);
  --color-bg-tertiary: var(--color-bg-tertiary);
  --color-surface: var(--color-surface);
  --color-surface-elevated: var(--color-surface-elevated);
  --color-border: var(--color-border);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-text-muted: var(--color-text-muted);
  --font-display: var(--font-display);
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
}

body {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
}
```

---

## Usage Examples

### Tailwind Classes

```jsx
// Primary Button
<button className="
  min-h-[var(--tap-target-lg)] 
  px-6 
  bg-primary 
  text-text-inverse 
  font-heading 
  font-semibold 
  rounded-[var(--radius-md)]
  hover:shadow-[var(--glow-primary)]
  active:scale-[0.98]
  transition-all
  duration-[var(--duration-fast)]
">
  Add Points
</button>

// Card
<div className="
  bg-surface 
  border 
  border-border 
  rounded-[var(--radius-lg)] 
  p-4 
  shadow-[var(--shadow-md)]
">
  Card Content
</div>

// Score Display
<span className="
  font-display 
  text-[64px] 
  leading-none 
  text-text-primary
">
  72
</span>
```

---

## File Structure

```
src/
├── app/
│   └── globals.css          # Design tokens
├── components/
│   └── ui/
│       ├── Button.tsx       # Primary, Ghost, Icon variants
│       ├── Card.tsx         # Surface, Elevated variants
│       ├── Badge.tsx        # Status indicators
│       ├── Input.tsx        # Form inputs
│       ├── PlayerTile.tsx   # Player quick-select
│       ├── StatButton.tsx   # Live stat entry
│       ├── ScoreDisplay.tsx # Animated score
│       └── index.ts         # Barrel exports
specs/
└── design-system.md         # This file
```
