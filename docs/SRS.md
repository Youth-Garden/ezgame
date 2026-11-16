# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for EzGame, defining functional capabilities, system constraints, user interaction models, and non-functional guarantees.

### 1.2 Scope
EzGame provides real-time, peer-to-peer browser gaming without user registration or app installation requirements.

---

## 2. Functional Requirements

### 2.1 Room Management
- FR-ROOM-001: The system shall generate unique room codes (6-character uppercase alphanumeric strings).
- FR-ROOM-002: The system shall allow users to join rooms via direct URL (`/play/[game]/[code]`) or room code input in the Lobby dialog.
- FR-ROOM-003: The system shall dynamically assign roles (Player X / White / Red / Blue vs Player O / Black) on arrival. If a player reloads, their role shall be preserved via session storage.

### 2.2 Gameplay Progression
- FR-GAME-001: All games must validate move legality deterministically on the client before broadcasting.
- FR-GAME-002: The system shall maintain synchronized countdown turn timers across all connected clients.
- FR-GAME-003: When a turn timer reaches zero, the system shall execute an automatic turn pass (`GAME_TIMEOUT_PASS_TURN`).
- FR-GAME-004: If a player leaves the match or clicks Surrender, the opponent shall immediately receive victory status.

### 2.3 Rematch Lifecycle
- FR-REMATCH-001: Upon match completion, either player may request a rematch via `REMATCH_REQUEST`.
- FR-REMATCH-002: The requesting player shall see a pending state ("Waiting for confirmation...").
- FR-REMATCH-003: The opposing player shall see an acceptance prompt ("Opponent requested rematch").
- FR-REMATCH-004: Upon acceptance (`REMATCH_ACCEPT`), both clients shall reset game boards simultaneously without changing the room code.

---

## 3. Supported Game Rules & Engines

### 3.1 Caro (Gomoku)
- 15x15 or 19x19 board.
- Standard five-in-a-row win condition (unbroken vertical, horizontal, or diagonal lines).

### 3.2 Billiards (8-Ball)
- Matter.js 2D rigid body simulation.
- Solid and stripe ball group allocation on first pocketed ball after break.
- 8-ball legal win and early scratch loss conditions.

### 3.3 Xiangqi (Chinese Chess)
- 9x10 grid with River and Palace boundaries.
- Standard piece movement: General, Advisor, Elephant, Horse, Chariot, Cannon, Soldier.
- Check and checkmate evaluation.

### 3.4 Chess (International 8x8)
- FIDE standard chess rules via chess.js.
- Castling, en passant, pawn promotion dialog, check, checkmate, stalemate, and draw conditions.

### 3.5 Animal Chess (Dou Shou Qi 7x9)
- 7x9 board with Rivers, Traps, and Dens.
- 8 animal ranks: Rat (1) to Elephant (8).
- Rat water navigation, Lion/Tiger river jumping, Trap rank reduction, and Den capture win conditions.

---

## 4. Non-Functional Requirements

- NFR-PERF-001: Board interaction response latency must remain under 50ms locally.
- NFR-PERF-002: Realtime message broadcast delivery must complete within 200ms under standard broadband conditions.
- NFR-REL-001: Automatic state recovery must occur within 1500ms after page refresh (F5).
- NFR-USAB-001: The user interface must adapt cleanly across viewport widths from 320px to 2560px with zero vertical layout shifting.
