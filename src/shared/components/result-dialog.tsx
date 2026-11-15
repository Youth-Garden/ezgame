'use client';

import { Button } from '@/shared/components/ui/button';
import { SpreadPing } from '@/shared/components/spread-ping';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { RouteEnum } from '@/shared/constants/routes';
import { Icons } from '@/shared/icons';
import { sounds } from '@/shared/lib/sound-effects';
import type { PortalProps } from '@/shared/types/portal.types';
import { GameWinner, PlayerRole } from '@/shared/types/room';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export interface ResultDialogData {
  winner: GameWinner | null;
  myRole: PlayerRole;
  reason?: "normal" | "opponent_left";
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
  const tResult = useTranslations('result');
  const winner = data?.winner ?? null;
  const myRole = data?.myRole ?? PlayerRole.X;
  const reason = data?.reason ?? "normal";
  const isRematchRequestedByMe = data?.isRematchRequestedByMe ?? false;
  const isRematchRequestedByOpponent =
    data?.isRematchRequestedByOpponent ?? false;

  const isMeWinner = (winner as unknown as PlayerRole) === myRole;
  const isDraw = winner === GameWinner.DRAW;

  useEffect(() => {
    if (!isOpen || !winner) return;

    if (isMeWinner) {
      sounds.playWinFanfare();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.5 },
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
      <DialogContent
        showCloseButton={false}
        className="sm:w-[460px] sm:max-w-[460px] flex flex-col items-center text-center p-6 sm:p-9 relative overflow-visible bg-transparent backdrop-blur-none rounded-3xl border-none shadow-none"
      >
        <DialogHeader className="items-center text-center relative z-10 w-full">
          {/* Trophy / Icon container - Clean and focused with subtle radial ambient glow */}
          <div className="relative mb-4 flex items-center justify-center mx-auto">
            {/* Subtle soft gradient ambient glow behind the icon */}
            <div
              className={cn(
                "absolute w-36 h-36 rounded-full blur-2xl pointer-events-none transition-all duration-500",
                isMeWinner && "bg-gradient-to-tr from-amber-500/35 via-yellow-400/25 to-transparent",
                isDraw && "bg-gradient-to-tr from-slate-400/30 via-slate-300/20 to-transparent",
                !isMeWinner && !isDraw && "bg-gradient-to-tr from-rose-600/35 via-pink-500/25 to-transparent"
              )}
            />

            {/* Icon enlarged and perfectly centered in container */}
            <div className="transform hover:scale-105 transition-all duration-300 drop-shadow-md relative z-10 flex items-center justify-center">
              {isMeWinner ? (
                <Icons name="victory-3d" size={120} />
              ) : isDraw ? (
                <Icons name="draw-3d" size={100} />
              ) : (
                <Icons name="defeat-3d" size={120} />
              )}
            </div>
          </div>

          <DialogTitle
            className={cn(
              "text-3xl sm:text-4xl font-extrabold tracking-tight mb-8 font-game select-none",
              isMeWinner &&
                "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]",
              isDraw &&
                "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(148,163,184,0.4)]",
              !isMeWinner &&
                !isDraw &&
                "bg-gradient-to-b from-rose-300 via-rose-500 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(244,63,94,0.45)]"
            )}
          >
            {isMeWinner ? tResult("victory") : isDraw ? tResult("draw") : tResult("defeat")}
          </DialogTitle>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 relative z-10">
          {reason !== "opponent_left" && (
            <>
              {isRematchRequestedByOpponent ? (
                <Button
                  variant="default"
                  size="default"
                  onClick={() => data?.onAcceptRematch?.()}
                  className="w-full gap-2"
                >
                  <Icons name="rotateccw" size={16} />
                  <span>{tResult("rematchAccept")}</span>
                </Button>
              ) : isRematchRequestedByMe ? (
                <Button
                  variant="subtle"
                  size="default"
                  disabled
                  className="w-full gap-2 text-muted-foreground"
                >
                  <SpreadPing variant="primary" size="sm" />
                  <span>{tResult("rematchPending")}</span>
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="default"
                  onClick={() => data?.onRequestRematch?.()}
                  className="w-full gap-2"
                >
                  <Icons name="rotateccw" size={16} />
                  <span>{tResult("rematchRequest")}</span>
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="default"
            onClick={() => {
              onDismiss?.();
              router.push(RouteEnum.LOBBY);
            }}
            className="w-full gap-2"
          >
            <Icons name="home" size={16} />
            <span>{tResult("backToLobby")}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
