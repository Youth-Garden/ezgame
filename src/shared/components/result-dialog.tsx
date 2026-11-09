"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { RouteEnum } from "@/shared/constants/routes";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole, GameWinner } from "@/shared/types/room";
import type { PortalProps } from "@/shared/types/portal.types";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";

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
  const router = useRouter();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={false} className="text-center">
        <DialogHeader className="items-center text-center">
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

          <DialogTitle className="text-xl font-bold uppercase tracking-tight mb-1 font-game">
            {isMeWinner ? "Victory!" : isDraw ? "Game Draw!" : "Defeat!"}
          </DialogTitle>

          <DialogDescription className="text-xs text-text-secondary mb-4 max-w-xs leading-relaxed font-medium">
            {isMeWinner
              ? `Congratulations! You (Piece ${myRole}) took the win.`
              : isDraw
              ? "Both sides played evenly to a draw."
              : `Piece ${winner} connected 5. Ready for the next round?`}
          </DialogDescription>
        </DialogHeader>

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
              <Icons name="rotateccw" size={16} />
              <span>Request Rematch</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="default"
            onClick={() => {
              onDismiss?.();
              router.push(RouteEnum.LOBBY);
            }}
            className="w-full gap-2 mt-1"
          >
            <Icons name="home" size={16} />
            <span>Back to Lobby</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
