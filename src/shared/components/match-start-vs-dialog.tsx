"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { type PortalProps } from "@/shared/types/portal.types";
import { sounds } from "@/shared/lib/sound-effects";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import { Avatar } from "@/shared/components/ui/avatar";

export interface MatchStartVsDialogData {
  playerXName: string;
  playerXAvatar: string;
  playerOName: string;
  playerOAvatar: string;
  gameTitle?: string;
  gameType?: "caro" | "bida" | "tictactoe" | "xiangqi";
  onFinish?: () => void;
}

export function MatchStartVsDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<MatchStartVsDialogData>) {
  const t = useTranslations("game");

  useEffect(() => {
    if (!isOpen) return;

    sounds.playWinFanfare();

    // Auto dismiss after 2.2 seconds
    const timer = setTimeout(() => {
      onDismiss?.();
      data?.onFinish?.();
    }, 2200);

    return () => clearTimeout(timer);
  }, [isOpen, onDismiss, data]);

  if (!isOpen || !data) return null;

  const isXiangqi = data.gameType === "xiangqi";
  const isBida = data.gameType === "bida";

  const player1RoleLabel = isXiangqi
    ? `${t("red")} (先)`
    : isBida
    ? t("player") + " 1"
    : `${t("player")} X`;

  const player2RoleLabel = isXiangqi
    ? `${t("black")} (後)`
    : isBida
    ? t("player") + " 2"
    : `${t("player")} O`;

  const player1RingColor = isXiangqi
    ? "ring-rose-500 text-rose-500"
    : "ring-primary text-primary";

  const player2RingColor = isXiangqi
    ? "ring-slate-700 dark:ring-slate-400 text-slate-700 dark:text-slate-400"
    : "ring-destructive text-destructive";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg text-center">
        {/* Game Title Header */}
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary mb-6 animate-pulse block">
          {data.gameTitle || t("matchReady")} • {t("gameStarting")}
        </span>

        {/* 2 Players VS Grid */}
        <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-8">
          {/* Player 1 (Left) */}
          <div className="flex-1 flex flex-col items-center gap-3 animate-in slide-in-from-left duration-500">
            <Avatar
              size="lg"
              src={data.playerXAvatar}
              fallback={
                <span className={`text-3xl font-black ${isXiangqi ? "text-rose-500" : "text-primary"}`}>
                  {isXiangqi ? "R" : isBida ? "1" : "X"}
                </span>
              }
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ring-4 shadow-2xl bg-neutral-900 ${
                isXiangqi ? "ring-rose-500" : "ring-primary"
              }`}
            />
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-base font-black text-foreground truncate max-w-[120px]">
                {data.playerXName}
              </span>
              <span className={`text-[11px] font-bold uppercase ${player1RingColor}`}>
                {player1RoleLabel}
              </span>
            </div>
          </div>

          {/* Central Animated VS Badge */}
          <div className="flex flex-col items-center justify-center px-2">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-muted shadow-lg">
              <span className="text-lg font-black italic tracking-tighter text-foreground">
                VS
              </span>
            </div>
          </div>

          {/* Player 2 (Right) */}
          <div className="flex-1 flex flex-col items-center gap-3 animate-in slide-in-from-right duration-500">
            <Avatar
              size="lg"
              src={data.playerOAvatar}
              fallback={
                <span className={`text-3xl font-black ${isXiangqi ? "text-slate-400" : "text-destructive"}`}>
                  {isXiangqi ? "B" : isBida ? "2" : "O"}
                </span>
              }
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ring-4 shadow-2xl bg-neutral-900 ${
                isXiangqi ? "ring-slate-600 dark:ring-slate-400" : "ring-destructive"
              }`}
            />
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-base font-black text-foreground truncate max-w-[120px]">
                {data.playerOName}
              </span>
              <span className={`text-[11px] font-bold uppercase ${player2RingColor}`}>
                {player2RoleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-muted-foreground">
            {t("connectingMatch")}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
