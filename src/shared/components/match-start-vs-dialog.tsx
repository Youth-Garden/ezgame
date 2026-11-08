"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { type PortalProps } from "@/shared/types/portal.types";
import { sounds } from "@/shared/lib/sound-effects";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";

export interface MatchStartVsDialogData {
  playerXName: string;
  playerXAvatar: string;
  playerOName: string;
  playerOAvatar: string;
  gameTitle?: string;
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={false} className="max-w-lg bg-card/95 border-none p-6 text-center select-none shadow-2xl">
        {/* Game Title Header */}
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-primary mb-6 animate-pulse block">
          {data.gameTitle || t("matchReady")} • {t("gameStarting")}
        </span>

        {/* 2 Players VS Grid */}
        <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-8">
          {/* Player X (Left) */}
          <div className="flex-1 flex flex-col items-center gap-3 animate-in slide-in-from-left duration-500">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-neutral-900 ring-4 ring-primary shadow-2xl flex items-center justify-center">
              {data.playerXAvatar ? (
                <Image
                  src={data.playerXAvatar}
                  alt={data.playerXName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-3xl font-black text-primary">X</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-base font-black text-foreground truncate max-w-[120px]">
                {data.playerXName}
              </span>
              <span className="text-[11px] font-bold text-primary uppercase">
                {t("player")} X
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

          {/* Player O (Right) */}
          <div className="flex-1 flex flex-col items-center gap-3 animate-in slide-in-from-right duration-500">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-neutral-900 ring-4 ring-destructive shadow-2xl flex items-center justify-center">
              {data.playerOAvatar ? (
                <Image
                  src={data.playerOAvatar}
                  alt={data.playerOName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-3xl font-black text-destructive">O</span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-base font-black text-foreground truncate max-w-[120px]">
                {data.playerOName}
              </span>
              <span className="text-[11px] font-bold text-destructive uppercase">
                {t("player")} O
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
