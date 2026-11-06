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
        "relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors duration-100 border-[0.5px] border-border/60 select-none group bg-card",
        !value && canClick && "hover:bg-accent/40 cursor-pointer",
        !value && !canClick && "cursor-default",
        value && "cursor-default",
        isWinningCell &&
          "bg-amber-500/20 z-10 border-amber-500/70 animate-pulse",
        isLastMove && !isWinningCell && "bg-accent/30"
      )}
    >
      {/* Tengen / Hoshi points on Go board */}
      {((row === 3 && col === 3) ||
        (row === 3 && col === 11) ||
        (row === 7 && col === 7) ||
        (row === 11 && col === 3) ||
        (row === 11 && col === 11)) &&
        !value && (
          <div className="absolute w-1 h-1 rounded-full bg-border pointer-events-none" />
        )}

      {/* Render Value: X */}
      {value === CaroPlayer.X && (
        <div className="relative flex items-center justify-center animate-in zoom-in-90 duration-100">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
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
            className="w-4 h-4 sm:w-5 sm:h-5 text-destructive"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
        </div>
      )}

      {/* Hover preview ghost for current player */}
      {!value && previewRole && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
          {previewRole === CaroPlayer.X ? (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
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
              className="w-4 h-4 sm:w-5 sm:h-5 text-destructive"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="8" />
            </svg>
          )}
        </div>
      )}

      {/* Last move indicator dot */}
      {isLastMove && !isWinningCell && (
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
});
