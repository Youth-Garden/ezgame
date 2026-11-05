"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Frown, MinusCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole } from "@/shared/types/room";
import { GameWinner } from "@/features/caro/types";
import type { PortalProps } from "@/shared/types/portal.types";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

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
    }
  }, [isOpen, winner, isMeWinner]);

  if (!isOpen || !winner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm text-center overflow-hidden border border-border bg-card p-6"
      >
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
              isMeWinner
                ? "bg-primary/10 text-primary border border-primary/20"
                : isDraw
                ? "bg-secondary text-secondary-foreground border border-border"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {isMeWinner ? (
              <Trophy className="w-7 h-7" />
            ) : isDraw ? (
              <MinusCircle className="w-7 h-7" />
            ) : (
              <Frown className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-card-foreground mb-1">
            {isMeWinner
              ? "Victory!"
              : isDraw
              ? "Draw Game"
              : "Defeat"}
          </h3>

          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
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
                <RotateCcw className="w-4 h-4" />
                <span>Accept Rematch</span>
              </Button>
            ) : isRematchRequestedByMe ? (
              <Button
                variant="subtle"
                size="default"
                disabled
                className="w-full gap-2 text-muted-foreground"
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
                <RotateCcw className="w-4 h-4" />
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

              <Link href="/" onClick={onDismiss} className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Lobby</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
