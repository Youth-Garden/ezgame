"use client";

import { usePortal } from "@/shared/components/portal";
import { GameType } from "@/shared/types/room";
import { GameCard } from "../components/game-card";
import { RoomSelectionModal } from "../components/room-selection-modal";
import type { GameMetadata, GameRoomModalData } from "../types";
import { Gamepad2, Zap } from "lucide-react";

const AVAILABLE_GAMES: GameMetadata[] = [
  {
    id: GameType.CARO,
    title: "Caro (Gomoku)",
    badge: "15x15 Classic",
    description: "5-in-a-row Gomoku on a 15x15 board. Instant real-time moves with live presence sync.",
    players: "2 Players",
    isAvailable: true,
    tag: "Tactical Board",
  },
  {
    id: GameType.TICTACTOE,
    title: "Tic-Tac-Toe (3x3)",
    badge: "Coming Soon",
    description: "Fast-paced 3x3 blitz match. Quick tactical duel in under 30 seconds.",
    players: "2 Players",
    isAvailable: false,
    tag: "Casual Blitz",
  },
];

export function LobbyPage() {
  const [presentRoomModal] = usePortal<GameRoomModalData>(RoomSelectionModal);

  const handleGameSelect = (game: GameMetadata) => {
    if (!game.isAvailable) return;
    presentRoomModal({
      gameType: game.id,
      gameTitle: game.title,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">
                EzGame
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Instant Multiplayer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
        {/* Quick Pitch */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1.5">
            Choose a game to duel
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No registration or setup needed. Create or join with a room code in seconds.
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {AVAILABLE_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={handleGameSelect}
            />
          ))}
        </div>

        {/* Clean Micro Stats / Info */}
        <div className="mt-auto pt-6 border-t border-border/60 grid grid-cols-3 gap-3 text-center">
          <div className="py-2 px-3 rounded-lg bg-card border border-border/50">
            <div className="text-xs font-semibold text-foreground flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" /> Realtime
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">WebSocket sync</div>
          </div>
          <div className="py-2 px-3 rounded-lg bg-card border border-border/50">
            <div className="text-xs font-semibold text-foreground">0 Login</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Instant guest access</div>
          </div>
          <div className="py-2 px-3 rounded-lg bg-card border border-border/50">
            <div className="text-xs font-semibold text-foreground">1-Click Share</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Invite via link</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-[11px] text-muted-foreground">
        EzGame • Fast & lightweight multiplayer
      </footer>
    </div>
  );
}
