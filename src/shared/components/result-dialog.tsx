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
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#818cf8", "#34d399", "#fbbf24"],
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
        className="max-w-sm text-center overflow-hidden border-white/15 bg-slate-900/95"
      >
        {/* Glow accent */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isMeWinner
              ? "bg-cyan-500"
              : isDraw
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
        />

        {/* Icon & Headline */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
              isMeWinner
                ? "bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-cyan-500/30"
                : isDraw
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/30"
                : "bg-gradient-to-tr from-rose-500 to-slate-700 text-white shadow-rose-500/30"
            }`}
          >
            {isMeWinner ? (
              <Trophy className="w-8 h-8 animate-bounce" />
            ) : isDraw ? (
              <MinusCircle className="w-8 h-8" />
            ) : (
              <Frown className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white mb-1">
            {isMeWinner
              ? "Chiến Thắng!"
              : isDraw
              ? "Bất Phân Thắng Bại!"
              : "Thất Bại!"}
          </h3>

          <p className="text-sm text-white/70 mb-6">
            {isMeWinner
              ? `Chúc mừng! Bạn (Quân ${myRole}) đã xuất sắc giành chiến thắng ván cờ này.`
              : isDraw
              ? "Hai bên đã thi đấu giằng co và kết thúc với tỷ số hòa."
              : `Quân ${winner} đã giành 5 ô liên tiếp. Hãy phục thù ở ván tiếp theo!`}
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            {isRematchRequestedByOpponent ? (
              <button
                onClick={() => data?.onAcceptRematch?.()}
                type="button"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                Đối thủ mời tái đấu! Chấp nhận
              </button>
            ) : isRematchRequestedByMe ? (
              <button
                disabled
                type="button"
                className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-white/10 text-white/50 border border-white/10 flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Đang đợi đối thủ xác nhận...
              </button>
            ) : (
              <button
                onClick={() => data?.onRequestRematch?.()}
                type="button"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                Yêu cầu tái đấu ván mới
              </button>
            )}

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={onDismiss}
                type="button"
                className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                Xem lại bàn cờ
              </button>

              <Link
                href="/"
                onClick={onDismiss}
                className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
