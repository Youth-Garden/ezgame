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
      aria-label={`Row ${row + 1}, Column ${col + 1}${value ? `, piece ${value}` : ""}`}
      className={cn(
        "relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors duration-100 select-none group",
        "border-r border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90",
        !value && canClick && "hover:bg-neutral-100 dark:hover:bg-neutral-800/80 cursor-pointer",
        !value && !canClick && "cursor-default",
        value && "cursor-default",
        isWinningCell &&
          "bg-amber-500/20 dark:bg-amber-500/25 z-10 animate-pulse",
        isLastMove && !isWinningCell && "bg-sky-500/15 dark:bg-sky-500/20"
      )}
    >
      {/* Tengen / Hoshi points on Go board (Traditional 15x15 markers) */}
      {((row === 3 && col === 3) ||
        (row === 3 && col === 11) ||
        (row === 7 && col === 7) ||
        (row === 11 && col === 3) ||
        (row === 11 && col === 11)) &&
        !value && (
          <div className="absolute w-1.5 h-1.5 rounded-full bg-neutral-400/80 dark:bg-neutral-600 pointer-events-none" />
        )}

      {/* Render Value: X */}
      {value === CaroPlayer.X && (
        <div className="relative flex items-center justify-center animate-in zoom-in-90 duration-100">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500"
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
        <div className="relative flex items-center justify-center animate-in zoom-in-90 duration-100">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
        </div>
      )}

      {/* Hover preview ghost piece for active player */}
      {!value && canClick && previewRole && (
        <div className="opacity-0 group-hover:opacity-40 transition-opacity flex items-center justify-center pointer-events-none">
          {previewRole === CaroPlayer.X ? (
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="8" />
            </svg>
          )}
        </div>
      )}

      {/* Small marker for last placed move */}
      {isLastMove && !isWinningCell && (
        <span className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-sky-500 animate-ping" />
      )}
    </button>
  );
});
