"use client";

import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import { CaroPlayer, type CellValue } from "../types";
import { PlayerRole } from "@/shared/types/room";

interface CaroCellProps {
  row: number;
  col: number;
  value: CellValue;
  isLastMove: boolean;
  isWinningCell: boolean;
  canClick: boolean;
  myRole: PlayerRole;
  onClick: (row: number, col: number) => void;
}

export const CaroCell = memo(function CaroCell({
  row,
  col,
  value,
  isLastMove,
  isWinningCell,
  canClick,
  myRole,
  onClick,
}: CaroCellProps) {
  const handleClick = () => {
    if (!value && canClick) {
      onClick(row, col);
    }
  };

  const previewRole: CaroPlayer | null =
    canClick && !value && (myRole === PlayerRole.X || myRole === PlayerRole.O)
      ? (myRole as unknown as CaroPlayer)
      : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={Boolean(value) || !canClick}
      aria-label={`Ô hàng ${row + 1}, cột ${col + 1}${value ? `, quân ${value}` : ""}`}
      className={cn(
        "relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors duration-150 border-[0.5px] border-slate-700/60 select-none group",
        // Background states
        !value && canClick && "hover:bg-cyan-500/10 cursor-pointer",
        !value && !canClick && "cursor-default",
        value && "cursor-default",
        isWinningCell &&
          "bg-amber-400/25 z-10 shadow-[inset_0_0_12px_rgba(251,191,36,0.5)] border-amber-400/80 animate-pulse",
        isLastMove && !isWinningCell && "bg-white/5"
      )}
    >
      {/* Grid intersections */}
      {((row === 3 && col === 3) ||
        (row === 3 && col === 11) ||
        (row === 7 && col === 7) ||
        (row === 11 && col === 3) ||
        (row === 11 && col === 11)) &&
        !value && (
          <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-600/80 pointer-events-none" />
        )}

      {/* Render Value: X */}
      {value === CaroPlayer.X && (
        <div className="relative flex items-center justify-center animate-in zoom-in-75 duration-150">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      )}

      {/* Render Value: O */}
      {value === CaroPlayer.O && (
        <div className="relative flex items-center justify-center animate-in zoom-in-75 duration-150">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.7)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="7" />
          </svg>
        </div>
      )}

      {/* Hover Ghost Preview */}
      {previewRole && (
        <div className="absolute opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity">
          {previewRole === CaroPlayer.X ? (
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="7" />
            </svg>
          )}
        </div>
      )}

      {/* Last move indicator dot */}
      {isLastMove && (
        <div
          className={cn(
            "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 pointer-events-none shadow-sm",
            value === CaroPlayer.X ? "bg-cyan-300" : "bg-rose-300"
          )}
        />
      )}
    </button>
  );
});
