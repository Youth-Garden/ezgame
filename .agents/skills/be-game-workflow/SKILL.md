---
name: be-game-workflow
description: >-
  Rules, game engine logic, realtime synchronization, and unit test workflow for EzGame.
  Use when adding a new game, altering movement rules, win conditions, or realtime broadcast protocols.
---

# EzGame Game Engine, Realtime & Backend Workflow

Follow this procedure when creating or editing game logic, state hooks, and realtime events.

## 1. Feature Module Structure (`src/features/[game]/`)
Every new game must strictly implement this directory structure:
```
src/features/[game]/
├── components/          # Game board, custom scoreboard, reusable piece units
├── config/              # Turn timeout seconds, dimensions, default room codes
├── hooks/               # use[Game]Game.ts (game state, move validation, sounds)
├── pages/               # [game]-play-page.tsx
├── types/               # Enums (Player roles, Piece types, Game states)
├── utils/               # Pure calculation logic (move rules, check-win, simulation)
└── README.md            # Comprehensive game manual and test guide
```

## 2. Mandatory TypeScript Enum Definition
- Every state, role, event, or winner MUST be an `enum`:
  - `PlayerRole.X`, `PlayerRole.O`, `PlayerRole.SPECTATOR`
  - `GameWinner.X`, `GameWinner.O`, `GameWinner.DRAW`
  - `RealtimeEventType`
- Never use loose string unions (`"X" | "O"`) or raw strings in game logic.

## 3. Realtime Broadcast Convention
- Integrate via `useGameRoom({ gameTitle, gameType, onEventReceived, onSurrenderConfirmed })`.
- Broadcast state changes through `sendEvent({ type: RealtimeEventType.*, payload: { ... } })`.
- Realtime Event Handlers:
  - `GAME_START`: Transition lobby to active board.
  - `GAME_MOVE`: Send move coordinates and validate on receiver.
  - `GAME_RESET` / `REMATCH_ACCEPT`: Reset board state and dismiss dialog.
  - `PLAYER_SURRENDER`: Award instant win to remaining player.
  - `GAME_TIMEOUT_PASS_TURN`: Pass turn to opponent without losing.
  - `REQUEST_ROOM_SYNC`: Resync board when peer enters or presses F5.

## 4. Mandatory Unit Test Policy
- Every game rule, win check, and obstacle logic MUST have a dedicated `*.test.ts` file inside `src/features/[game]/utils/`:
  - Example: `src/features/[game]/utils/[game]-rules.test.ts`
- Must test:
  1. Standard moves / placement.
  2. Obstacle / blocking rules (cản chân mã, chặn mắt tượng, ngòi pháo, scratch bi cái).
  3. Win detection (5 in a row, legal 8-ball, checkmate).
  4. Draw / Stalemate detection (hết nước đi, đầy bàn cờ).
- Run verification command:
  ```bash
  bun test src/features/[game]/utils/[game]-rules.test.ts
  ```

## 5. Storage Keys Policy
- Absolutely NO custom prefixes (`ezgame_` or `ezgame-`):
  - LocalStorage: `player_profile`, `locale`
  - SessionStorage: `client_id`, `role_${roomCode}`
  - Cookies: `theme`, `NEXT_LOCALE`
