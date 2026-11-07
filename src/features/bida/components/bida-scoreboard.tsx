import { BidaBall, BidaBallType } from "../types";
import { PlayerRole } from "@/shared/types/room";

interface BidaScoreboardProps {
  currentTurn: PlayerRole.X | PlayerRole.O;
  myRole: PlayerRole;
  balls: BidaBall[];
  lastFoul?: string | null;
}

export function BidaScoreboard({
  currentTurn,
  myRole,
  balls,
  lastFoul,
}: BidaScoreboardProps) {
  const isMyTurn = currentTurn === myRole;

  const solidsRemaining = balls.filter(
    (b) => b.type === BidaBallType.SOLIDS && !b.isPocketed
  ).length;

  const stripesRemaining = balls.filter(
    (b) => b.type === BidaBallType.STRIPES && !b.isPocketed
  ).length;

  return (
    <div className="w-full max-w-[840px] flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-900/60 border border-white/5 backdrop-blur-sm">
      {/* Player X Info */}
      <div
        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all ${
          currentTurn === PlayerRole.X
            ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
            : "border-transparent"
        }`}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
        <div>
          <div className="text-xs font-semibold text-neutral-200">
            Cơ thủ X {myRole === PlayerRole.X && "(Bạn)"}
          </div>
          <div className="text-[11px] text-neutral-400">
            Bi Trơn (Solids): {solidsRemaining} còn lại
          </div>
        </div>
      </div>

      {/* Middle Turn Indicator & Foul Alert */}
      <div className="flex flex-col items-center">
        <span
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            isMyTurn
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          {isMyTurn ? "Lượt của bạn" : "Đang chờ đối thủ..."}
        </span>
        {lastFoul && (
          <span className="text-[10px] text-rose-400 mt-1 font-medium">
            {lastFoul}
          </span>
        )}
      </div>

      {/* Player O Info */}
      <div
        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all ${
          currentTurn === PlayerRole.O
            ? "border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/10"
            : "border-transparent"
        }`}
      >
        <div>
          <div className="text-xs font-semibold text-neutral-200 text-right">
            Cơ thủ O {myRole === PlayerRole.O && "(Bạn)"}
          </div>
          <div className="text-[11px] text-neutral-400 text-right">
            Bi Sọc (Stripes): {stripesRemaining} còn lại
          </div>
        </div>
        <div className="w-3.5 h-3.5 rounded-full bg-sky-500" />
      </div>
    </div>
  );
}
