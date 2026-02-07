# Basketball Stats Keeper - Project Overview

## Vision
A lightweight, fast-paced basketball statistics tracking application designed to capture game stats in real-time. Built following the **FIBA Statisticians' Manual 2024** guidelines.

## Core Problem
Recording basketball statistics during a live game requires speed and accuracy. Traditional methods are either too slow (paper) or too complex (enterprise software). We need an app that lets statisticians capture plays as they happen without missing the next play.

## Goals
1. **Speed** - Capture any stat in under 2 seconds
2. **Accuracy** - Follow FIBA official guidelines
3. **Simplicity** - Minimal taps to record common plays
4. **Reliability** - Data persists server-side with instant saves
5. **Review** - Easy correction of mistakes

## Target Users
- Game statisticians at amateur/semi-pro levels
- Coaches tracking their team's performance
- Basketball enthusiasts recording pickup games
- Youth league scorekeepers

## Key Statistics (per FIBA Manual)

### Primary Stats (Chapters 1-9)
| Stat | Description |
|------|-------------|
| **Field Goals** | 2PT/3PT attempts and makes |
| **Free Throws** | FT attempts and makes |
| **Rebounds** | Offensive and Defensive |
| **Assists** | Passes leading to FGM |
| **Turnovers** | Ball losses (various types) |
| **Steals** | Taking ball from opponent |
| **Blocked Shots** | Deflecting opponent's shot |
| **Fouls** | Personal, Technical, etc. |

### Computed Stats (Appendix C)
- Points in the Paint
- Fast-break Points
- Second Chance Points
- Points off Turnovers
- Bench Points
- +/- Rating
- Efficiency Rating

## Design Principles

### 1. Game-Speed Entry
- Large tap targets for quick input
- Most common actions require 1-2 taps
- Undo always available for mistakes
- No confirmation dialogs during play

### 2. Visual Clarity
- Clear team color differentiation
- Player numbers prominent
- Current score always visible
- Quarter/time display

### 3. FIBA Compliance
- All stats follow FIBA definitions
- Proper handling of edge cases (goaltending, own basket, etc.)
- Support for all turnover types
- Correct possession tracking

## Tech Stack
- **Frontend**: Next.js 14+ with App Router
- **State**: Client-side for live scoring (React state/context)
- **Database**: SQLite with Drizzle ORM (server-side)
- **API**: Next.js API routes for data persistence

## Success Metrics
- Average stat entry time < 2 seconds
- Zero data loss during games
- Mobile/tablet optimized (primary use case)

## Reference Documents
- FIBA Statisticians' Manual 2024
- specs/data-models.md - TypeScript interfaces
- specs/features/*.md - Feature specifications
