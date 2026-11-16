---
name: ba-workflow
description: Standard Business Analysis, feature specification, and planning workflow for EzGame. Use whenever planning new games, creating roadmap items, writing SRS, or defining resource requirements.
---

# Business Analysis (BA) Workflow & Planning Specification

This skill provides the mandatory guidelines, plan structure, and checklists required when planning features or games for EzGame.

## Core Rules

1. Language: Must be written strictly in English.
2. Icon Policy: Absolutely zero decorative emojis or icons (no rockets, trophies, animals, ticks, checkmarks, etc.). Use clean markdown headers, bullet points, and plain-text indicators.
3. Resource Prerequisite Identification: Every feature plan must explicitly list every required asset, library, route, message bundle, and database schema modification before implementation starts.

## Standard Feature Plan Template

When drafting a plan document for any new feature or game, adhere to the following structure:

```markdown
# Feature Specification: [Feature / Game Name]

## 1. Overview and Business Objectives
- Purpose: [What problem does this solve or what game does this provide]
- Target Audience: [2-player casual, multi-player party, etc.]
- Estimated Scope: [Small / Medium / Large]

## 2. Resource and Prerequisite Checklist
- External Libraries: [e.g. chess.js, matter.js, or none]
- Static Assets: [Cover images, sound effects, sprite sheets]
- Translation Keys: [vi.json, en.json, ja.json keys required]
- Data Models & Enums: [Prisma enum, TypeScript enum additions]
- Realtime Event Types: [WebSocket event names and payload signatures]
- Routes: [RouteEnum additions]

## 3. Game Rules and State Machine
- Game Setup & Initial State
- Turn Progression & Actions
- Validation Rules
- Victory, Loss, and Draw Conditions
- Timeout & Disconnection Behavior

## 4. Architectural Breakdown
- Feature Directory: src/features/[module]/
  - components/: [List UI components]
  - pages/: [Page component implementing Page suffix]
  - hooks/: [Custom state and engine hooks]
  - types/: [Strict TypeScript enums and interfaces]
  - utils/: [Pure logic and rule checkers]
- Next.js Page Route: src/app/play/[module]/[code]/page.tsx (Ultra minimal, only export Page component)
- Shared Component Integration: [RoomHeader, GameBoard, GameScoreboard, PlayerAvatar, ResultDialog, ConfirmDialog]

## 5. Step-by-Step Implementation Checklist
- [ ] Phase 1: Shared Enums, Types, and Routes
- [ ] Phase 2: Core Engine and Pure Rule Validation (with Unit Tests)
- [ ] Phase 3: UI Components and Board Rendering
- [ ] Phase 4: Realtime Integration & Rematch Synchronization
- [ ] Phase 5: Verification & Zero TypeScript Errors
```

## Review Checklist Before Handing Off to Development

- [ ] All enums defined without loose string unions.
- [ ] No button restyling (variants only: default, secondary, outline, ghost, subtle, destructive).
- [ ] Zero emojis in plan text.
- [ ] Unit tests planned for non-trivial game logic.
