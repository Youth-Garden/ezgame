# EzGame CodeGraph Architecture & Module Map

This document serves as the high-speed architectural index ("CodeGraph") for the EzGame codebase.
Whenever editing, creating features, or debugging, consult this map to locate the exact module, hook, component, or rule without reading unnecessary files.

```
                           +------------------------+
                           |   Root Layout & App    |
                           |  (src/app/layout.tsx)  |
                           +-----------+------------+
                                       |
          +----------------------------+----------------------------+
          |                                                         |
+---------v----------+                                   +----------v----------+
|  Global Providers  |                                   |     App Routing     |
| (Updater, Portal,  |                                   |  (src/app/play/...) |
|  NextIntlClient)   |                                   |  * Minimal 4-lines  |
+---------+----------+                                   +----------+----------+
          |                                                         |
          +----------------------------+----------------------------+
                                       |
+--------------------------------------v--------------------------------------+
|                     Feature-Sliced Architecture (`src/features/`)           |
|                                                                             |
|  [caro/]            [xiangqi/]            [bida/]            [lobby/]       |
|  - components/      - components/         - components/      - components/  |
|  - hooks/           - hooks/              - hooks/           - hooks/       |
|  - utils/           - utils/              - utils/           - pages/       |
|  - pages/           - pages/              - pages/           - types/       |
|  - *.test.ts        - *.test.ts           - *.test.ts                       |
+--------------------------------------+--------------------------------------+
                                       |
+--------------------------------------v--------------------------------------+
|                  Shared Core & Cross-Cutting Layer (`src/shared/`)          |
|                                                                             |
|  - components/      : Portal Dialogs, GameScoreboard, PlayerAvatar,         |
|                       GameActionBar, GameRulesDialog, RoomHeader, UI Primitives |
|  - hooks/           : useGameRoom, useRoomRealtime, useTurnTimer, usePlayerProfile |
|  - store/           : usePlayerStore (player_profile in localStorage)       |
|  - lib/             : sound-effects, supabase, avatar                       |
|  - constants/       : RouteEnum, routes config                              |
|  - types/           : Room, PlayerRole, RealtimeEventType, PortalTypes     |
+-----------------------------------------------------------------------------+
```

---

## 1. Module Quick Lookup & Dependency Matrix

| Module | Core Logic & Rules (`utils/`) | State Hook (`hooks/`) | Play Page (`pages/`) | Key Reusable Units (`components/`) | Unit Tests |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Caro (15x15)** | `check-win.ts` | `use-caro-game.ts` | `caro-play-page.tsx` | `CaroBoard`, `CaroCell`, `CaroPieceMark`, `CaroScoreboard` | `check-win.test.ts` (7 tests) |
| **Xiangqi (Chinese Chess)** | `xiangqi-rules.ts`, `xiangqi-display.ts` | `use-xiangqi-game.ts` | `xiangqi-play-page.tsx` | `XiangqiBoard`, `XiangqiPieceComponent`, `XiangqiScoreboard` | `xiangqi-rules.test.ts` (9 tests) |
| **Bida (8-Ball)** | `bida-rules.ts`, `bida-physics.ts`, `bida-simulation.ts` | `use-bida-game.ts` | `bida-play-page.tsx` | `BidaTable`, `BidaBallItem`, `BidaScoreboard`, `BidaSpinDialog` | `bida-rules.test.ts` (4 tests) |
| **Lobby** | `lobby-config.ts` | - | `lobby-page.tsx` | `GameCard`, `RoomSelectionDialog`, `UserProfileMenu`, `ProfileDialog` | - |

---

## 2. Shared Core Components Map (`src/shared/components/`)

- **`game-scoreboard.tsx`**: Compound pattern (`GameScoreboard.Root`, `.Left`, `.Center`, `.Right`). Fixed min-height `min-h-[58px] sm:min-h-[66px]`, contains turn badge, start button, timer.
- **`game-action-bar.tsx`**: Unified top control bar (`h-8` fixed height) holding Surrender button and game tools (e.g. table orientation toggle).
- **`spread-ping.tsx`**: Shared radar/ping animation component (`SpreadPing`) with `variant` (`primary`, `emerald`, `amber`, `rose`, `sky`) and `size` (`xs`, `sm`, `md`, `lg`) presets for pending rematch, match connection, and host waiting states.
- **`game-rules-dialog.tsx`**: Portal dialog displaying visual rules with game units (no generic icons, surface cards without borders).
- **`player-avatar.tsx`**: Responsive player pod with circular SVG countdown ring around avatar, name truncation, role badge, and captured piece tray (`h-5` row).
- **`room-header.tsx`**: Sticky top navigation bar with room code copy, invite link, fullscreen toggle, sound toggle, rules dialog trigger.
- **`result-dialog.tsx`**: End-game celebration / defeat dialog with confetti, rematch requests, and return to lobby.
- **`portal/`**: Global overlay stack (`usePortal`, `<PortalRenderer />`) for Modals, Sheets, Dialogs.

---

## 3. Realtime & Network Protocol (`src/shared/`)

- **Hook**: `useGameRoom({ gameTitle, gameType, onEventReceived, onSurrenderConfirmed })`
  - Encapsulates `myRole` (PlayerRole.X, O, SPECTATOR).
  - Synchronizes session state (`role_${roomCode}`, `client_id`).
  - Triggers rematch, surrender, auto-win on opponent disconnect.
- **Broadcaster**: `useRoomRealtime` via Supabase Realtime Broadcast.
- **Event Enum**: `RealtimeEventType`
  - `GAME_START`: Host launches the game.
  - `GAME_MOVE`: Board movement coords.
  - `GAME_RESET`: Resets board.
  - `REMATCH_REQUEST` & `REMATCH_ACCEPT`.
  - `PLAYER_SURRENDER`.
  - `GAME_TIMEOUT_PASS_TURN`.
  - `REQUEST_ROOM_SYNC`.

---

## 4. Internationalization & Storage Convention

- **i18n Translation Files**:
  - `src/messages/vi.json` (Vietnamese - Default)
  - `src/messages/en.json` (English)
  - `src/messages/ja.json` (Japanese)
  - Namespaces: `app`, `nav`, `lobby`, `games`, `game`, `dialog`, `result`, `error`, `common`, `profile`.
- **Storage Keys (Strict No-Prefix Policy)**:
  - LocalStorage: `player_profile`, `locale`
  - SessionStorage: `client_id`, `role_${roomCode}`
  - Cookies: `theme`, `NEXT_LOCALE`

---

## 5. Architectural Verification & Testing Commands

- **Run all unit tests**: `bun test`
- **Run specific game test**: `bun test src/features/<game>/utils/<game>-rules.test.ts`
- **Visualize Architecture Graph**: `bun run graph` (opens interactive web UI via `skott`)
- **Typecheck & Build**: `bun run build`
