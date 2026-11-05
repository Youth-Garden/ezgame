# EzGame — Project Description

EzGame is a realtime web battle platform for casual games, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Bun**, **Supabase Realtime**, and **Tailwind CSS v4**.

## Philosophy

The platform follows a **Zero Configuration / No-Auth** design: players do not register accounts or set passwords. Opening the site is enough to start playing immediately. Architecture uses **Feature-Sliced Design (FSD)**, keeping independent business modules separated.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Runtime / Package Manager | Bun |
| Styling | Tailwind CSS v4 |
| Realtime Backend | Supabase Realtime (Broadcast + Presence) |
| Database / ORM | Prisma + PostgreSQL |
| Icons | Lucide React |
| Confetti | canvas-confetti |

## Project Structure

```
ezgame/
├── prisma/
│   └── schema.prisma          # Room schema (WAITING, PLAYING, FINISHED)
├── src/
│   ├── app/                   # App Router (Next.js 16)
│   │   ├── api/rooms/         # Room API (create / verify codes)
│   │   ├── play/[game]/[code]/# Dynamic route loading games by room code
│   │   ├── layout.tsx         # Root layout with PortalRenderer
│   │   └── page.tsx           # Home page (Lobby)
│   ├── features/              # Independent business modules (FSD)
│   │   ├── caro/              # Caro (Gomoku 15x15) module
│   │   │   ├── components/    # CaroBoard, CaroCell
│   │   │   ├── pages/         # CaroPlayPage
│   │   │   ├── utils/         # checkWin (O(1)), createEmptyBoard
│   │   │   └── types.ts       # CaroPlayer, GameWinner, CaroGameState
│   │   └── lobby/             # Lobby: game selection, create/join rooms
│   └── shared/                # Shared infrastructure
│       ├── components/        # RoomHeader, ResultDialog, CopyLinkButton
│       │   └── portal/        # Portal Stack (usePortal, PortalRenderer)
│       ├── hooks/             # useRoomRealtime (Supabase + BroadcastChannel)
│       ├── lib/               # Supabase client, Web Audio, utils
│       └── types/             # Room, PlayerRole, RealtimeEventType
├── .env.example               # Environment variable template
├── bun.lock                   # Bun lockfile
└── package.json
```

## Core Features

### No-Auth Model
- No registration, no login, no passwords.
- Rooms are identified by short codes (e.g. `CR-7821`).
- Minimal data persisted: only room codes and basic metadata.

### Realtime Gameplay
- Two network modes:
  1. **Local Dev Mode**: Browser `BroadcastChannel` — works between tabs on the same machine without any backend.
  2. **Supabase Realtime**: WebSocket Broadcast & Presence for cross-machine, cross-network play.
- Opponent online/offline presence indicators.

### Game: Caro (Gomoku 15x15)
- Standard 15x15 board with row/column coordinates.
- O(1) win detection across 4 directions (horizontal, vertical, 2 diagonals).
- Ghost hover preview of the next move.
- Winning line highlight with pulse animation.
- Pass & Play mode for two players on one device.
- Surrender with confirmation safety dialog.
- Result dialog with confetti effects and two-way rematch requests.
- Web Audio sound effects (piece placement, victory fanfare) — no external audio files.

### Portal UI System
- Modals/Dialogs rendered through a Portal Stack at the root layout.
- Dialogs use `PortalProps<T>` interface (`isOpen`, `onDismiss`, `data`).
- No local `useState(isOpen)` management inside pages.

## Deployment Options

- **Local development**: `bun install` then `bun run dev` at `http://localhost:3000`.
- **Cloudflare Tunnel**: Quick public URL for testing without deployment.
- **Vercel**: Production deployment with environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).