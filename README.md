# EzGame - Realtime Web Battle Platform (No-Auth)

A realtime web game battle platform built with **Next.js 16 (App Router) + React 19 + TypeScript + Bun + Supabase Realtime + Tailwind CSS v4**.

Designed with **Feature-Sliced Design (FSD)** architecture and a **Zero Configuration / No-Auth** philosophy: no account registration, no password required — open the web and play instantly.

---

## ⚡ What Do You Need to Set Up?

### 👉 Case 1: Try It on Your Own Machine (No Setup Required)
* **Pass & Play Mode**: Two people sit side by side sharing one screen and mouse. Just toggle `"Local Mode: ON"`.
* **Two Tabs on the Same Machine**: Open 2 browser tabs (tab 1 creates a room, tab 2 opens the invite link). The game syncs automatically via the browser's `BroadcastChannel` API — **no Supabase account or database needed**.
* **How to Run**:
  ```bash
  cd d:\learn\ezgame
  bun install
  bun run dev
  ```
  Access: [http://localhost:3000](http://localhost:3000) and you're playing!

---

### 👉 Case 2: Two People in Different Locations (2 Machines / 2 Networks) Playing Together
* **You only need to do one thing**: Create a free Supabase project and fill in 2 keys in `.env.local`:
  1. Go to [supabase.com](https://supabase.com) and create a project (takes 1-2 minutes).
  2. Go to **Project Settings -> API**, copy:
     - **Project URL**
     - **anon / public key**
  3. Open `.env.local` and replace:
     ```env
     NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
     ```
  *(PostgreSQL/Prisma configuration is optional — the system includes an in-memory fallback that auto-generates and manages rooms.)*

* **Then, expose the web to the Internet so friends can access it**:
  * **Quickest way to test (no deploy needed)**:
    ```bash
    npx cloudflared tunnel --url http://localhost:3000
    ```
    The system will generate a public link (e.g. `https://xxx.trycloudflare.com`). Send this link to your friends.
  * **Professional long-term option**: Push the code to GitHub and import it into **Vercel** (free), then add the 2 environment variables above.

📖 **See the illustrated step-by-step guide at**: [docs/ONLINE_MULTIPLAYER_GUIDE.md](docs/ONLINE_MULTIPLAYER_GUIDE.md)

---

## 🎮 Caro Board (Gomoku 15x15) — Ready to Play?

**Caro is 100% complete and fully playable:**

* **Standard 15x15 board**: Row numbers (1 - 15) and column letters (A - O).
* **Ghost Hover Preview**: Preview the next move (X in cyan, O in rose).
* **O(1) Algorithm**: The `checkWin` function instantly checks 4 directions (horizontal, vertical, 2 diagonals) when a move is placed — no lag.
* **Winning Line Glow**: The 5 winning pieces automatically light up with a pulse animation.
* **Surrender & Rematch**:
  * "Surrender" button with a safety confirmation.
  * Result dialog (Portal Dialog) integrated with `canvas-confetti` confetti effects.
  * Two-way rematch request: when one side clicks "Request Rematch", the other receives a notification to accept or decline.
* **Web Audio Sound Effects**: Plays piece-placement chimes and victory fanfares — no external MP3 files required.

---

## 🚀 Bun Commands

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev

# Check TypeScript syntax and types (0 errors)
bunx tsc --noEmit

# Check code linting (0 warnings, 0 errors)
bun run lint

# Build the app for production
bun run build
```

---

## 🧩 Project Structure (Feature-Sliced Design)

```text
ezgame/
├── docs/
│   └── ONLINE_MULTIPLAYER_GUIDE.md # Step-by-step guide for 2 players connecting over the Internet
├── prisma/
│   └── schema.prisma               # Minimal Room schema (WAITING, PLAYING, FINISHED)
├── src/
│   ├── app/                        # App Router (Next.js 16)
│   │   ├── api/rooms/route.ts      # API to create/verify room codes (with in-memory fallback)
│   │   ├── play/[game]/[code]/     # Dynamic Route that loads the game by room code
│   │   ├── layout.tsx              # Root Layout containing PortalRenderer
│   │   └── page.tsx                # Home page (Lobby)
│   ├── features/                   # Independent business modules
│   │   ├── caro/                   # Caro Game
│   │   │   ├── components/         # CaroBoard, CaroCell
│   │   │   ├── pages/              # CaroPlayPage
│   │   │   ├── utils/              # checkWin O(1), createEmptyBoard
│   │   │   └── types.ts            # CaroPlayer, GameWinner, CaroGameState
│   │   └── lobby/                  # Main lobby UI, create & join rooms
│   └── shared/                     # Shared infrastructure
│       ├── components/             # RoomHeader, ResultDialog, CopyLinkButton
│       │   └── portal/             # Portal Stack System (usePortal, PortalRenderer)
│       ├── hooks/                  # useRoomRealtime (Supabase Broadcast + Local BroadcastChannel)
│       ├── lib/                    # Supabase client, Web Audio sound effects, utils
│       └── types/                  # Room, PlayerRole, RealtimeEventType
├── .env.example                    # Environment variable template
├── bun.lock                        # Bun lockfile
└── package.json
```

---

## 🛡️ Configuration Matrix

| Use Case | Supabase Needed? | PostgreSQL Needed? | Deploy / Tunnel Needed? |
| :--- | :---: | :---: | :---: |
| **2 players on the same machine** | ❌ No | ❌ No | ❌ No (just `bun run dev`) |
| **2 tabs on the same machine** | ❌ No | ❌ No | ❌ No (uses local `BroadcastChannel`) |
| **2 players in different locations (Internet)** | ✅ **Yes, keys required** | ❌ Optional | ✅ **Yes** (via Tunnel or Vercel) |