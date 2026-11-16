---
name: fe-workflow
description: Frontend architecture, UI standards, design tokens, and implementation rules for EzGame. Use when building or refactoring UI components, game boards, scoreboards, and pages.
---

# Frontend Engineering Workflow & Architectural Guidelines

This guide specifies the mandatory frontend engineering standards, design system rules, and checklist requirements for EzGame.

## Core Rules

1. Language: Written in English.
2. Icon Policy: Zero decorative emojis in code comments, commit messages, or plans.
3. Component Sizing: Components must not exceed 300 lines. Split into sub-components or extract state into custom hooks if approaching the limit.
4. Button Overrides: Strictly prohibited from overriding classes (bg, border, rounded, shadow, padding) on `<Button>`. Use standard `variant` and `size` props only.
5. Portal System: Overlays, modals, and dialogs must use `usePortal` or `usePortalWithoutBackdrop` via `@/shared/components/portal`. Do not mount local overlays deep in the component tree.
6. Layout Shifts: Never introduce vertical layout shift when action buttons appear or disappear. Wrap tools in fixed height containers (e.g. `h-8`).
7. Routes: Use `RouteEnum` and `formatUrl` for navigation. No hardcoded URL strings.

## Directory Layout in `src/features/[module]/`

- `components/`: UI components only. Group related items in contextual sub-folders if needed.
- `pages/`: Page component with `-page.tsx` suffix (e.g. `caro-play-page.tsx`, `ChessPlayPage`).
- `hooks/`: Custom hooks with `use-[feature].ts` naming format.
- `types/`: Domain-specific enums and interfaces.
- `utils/`: Pure calculation and utility functions without React dependencies.

## Standard Game Board Layout Pattern

Every game board page must follow this layout skeleton:

```tsx
<div className="min-h-screen bg-background text-foreground flex flex-col font-game">
  <RoomHeader
    roomCode={roomCode}
    gameTitle={title}
    gameType={gameType}
    myRole={myRole}
    myProfile={myProfile}
    opponentProfile={opponentProfile}
    onRandomizeAvatar={randomizeAvatar}
    isOpponentOnline={isOpponentOnline}
    isGameActive={isGameActive}
    onSurrender={promptSurrender}
  />
  <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
    <div className="w-full sm:w-fit flex flex-col items-center justify-center">
      <div className="hidden sm:flex w-full h-8 items-center justify-end gap-2 mb-2">
        {/* Optional Action Bar */}
      </div>
      <div className="mb-2.5 w-full">
        {/* GameScoreboard */}
      </div>
      <GameBoard gameType={gameType}>
        {/* Custom GameBoard */}
      </GameBoard>
    </div>
  </main>
</div>
```

## Checklist Before Finishing Any Frontend Work

- [ ] Unused imports removed and imports organized.
- [ ] Responsive design verified (scales well down to 320px width).
- [ ] No button class overrides.
- [ ] Route uses `RouteEnum`.
- [ ] Dark and light themes render with high contrast and legibility.
- [ ] No `any` types used.
