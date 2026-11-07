"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole } from "@/shared/types/room";
import { GameWinner } from "@/features/caro/types";
import type { PortalProps } from "@/shared/types/portal.types";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";

export interface ResultDialogData {
  winner: GameWinner | null;
  myRole: PlayerRole;
  isRematchRequestedByMe?: boolean;
  isRematchRequestedByOpponent?: boolean;
  onRequestRematch?: () => void;
  onAcceptRematch?: () => void;
}

export function ResultDialog({
  isOpen = false,
  onDismiss,
  data,
}: PortalProps<ResultDialogData>) {
  const winner = data?.winner ?? null;
  const myRole = data?.myRole ?? PlayerRole.X;
  const isRematchRequestedByMe = data?.isRematchRequestedByMe ?? false;
  const isRematchRequestedByOpponent = data?.isRematchRequestedByOpponent ?? false;

  const isMeWinner = (winner as unknown as PlayerRole) === myRole;
  const isDraw = winner === GameWinner.DRAW;

  useEffect(() => {
    if (!isOpen || !winner) return;

    if (isMeWinner) {
      sounds.playWinFanfare();
      try {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti silently handled
      }
    } else if (isDraw) {
      sounds.playDrawTone();
    } else {
      sounds.playLoseTone();
    }
  }, [isOpen, winner, isMeWinner, isDraw]);

  if (!winner) return null;

  return (
    <div
      className={`relative w-full max-w-sm mx-4 z-50 rounded-2xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-6 shadow-2xl text-center overflow-hidden ${
        isOpen ? "animate-modal-in" : "animate-modal-out pointer-events-none"
      }`}
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* 3D / Cartoon Game Result Illustration (Zero-border, Standalone) */}
        <div className="mb-3 transform hover:scale-105 transition-transform duration-200">
          {isMeWinner ? (
            <Icons name="victory-3d" size={80} />
          ) : isDraw ? (
            <Icons name="draw-3d" size={72} />
          ) : (
            <Icons name="defeat-3d" size={80} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight mb-1 text-neutral-900 dark:text-neutral-100 font-game">
          {isMeWinner
            ? "Victory!"
            : isDraw
            ? "Game Draw!"
            : "Defeat!"}
        </h2>

        {/* Description */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs leading-relaxed">
          {isMeWinner
            ? `Congratulations! You (Piece ${myRole}) took the win.`
            : isDraw
            ? "Both sides played evenly to a draw."
            : `Piece ${winner} connected 5. Ready for the next round?`}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {isRematchRequestedByOpponent ? (
            <Button
              variant="default"
              size="default"
              onClick={() => data?.onAcceptRematch?.()}
              className="w-full gap-2"
            >
              <Icons name="rotateccw" size={16} />
              <span>Accept Rematch</span>
            </Button>
          ) : isRematchRequestedByMe ? (
            <Button
              variant="subtle"
              size="default"
              disabled
              className="w-full gap-2 text-neutral-400"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Waiting for opponent...</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="default"
              onClick={() => data?.onRequestRematch?.()}
              className="w-full gap-2"
            >
              <Icons name="rotateccw" size={16} />
              <span>Request Rematch</span>
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="w-full text-xs"
            >
              Review Board
            </Button>

            <Link href="/" className="w-full">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs gap-1.5"
              >
                <Icons name="home" size={14} />
                <span>Lobby</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
