"use client";

import { useMemo } from "react";
import { CaroCell } from "./caro-cell";
import { CaroPlayer, type BoardState, type WinningLine } from "../types";
import { PlayerRole } from "@/shared/types/room";

interface CaroBoardProps {
  board: BoardState;
  lastMove: [number, number] | null;
  winningLine: WinningLine | null;
  canClick: boolean;
  myRole: PlayerRole;
  currentTurn: CaroPlayer;
  onCellClick: (row: number, col: number) => void;
}

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

export function CaroBoard({
  board,
  lastMove,
  winningLine,
  canClick,
  myRole,
  currentTurn,
  onCellClick,
}: CaroBoardProps) {
  const winningSet = useMemo(() => {
    const set = new Set<string>();
    if (winningLine) {
      winningLine.forEach(([row, col]) => set.add(`${row}-${col}`));
    }
    return set;
  }, [winningLine]);

  return (
    <div className="flex flex-col items-center">
      {/* Turn Banner */}
      <div className="mb-4 flex items-center justify-between w-full max-w-md px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 shadow-xs text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-400">Turn:</span>
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              currentTurn === CaroPlayer.X ? "text-sky-500" : "text-rose-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentTurn === CaroPlayer.X ? "bg-sky-500" : "bg-rose-500"
              }`}
            />
            Piece {currentTurn}
          </span>
        </div>

        <div className="text-xs">
          {canClick ? (
            <span className="text-emerald-500 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Your Turn
            </span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">Waiting for opponent...</span>
          )}
        </div>
      </div>

      {/* Board Outer Card */}
      <div className="p-3 sm:p-5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900 shadow-sm max-w-full overflow-x-auto select-none">
        <div className="min-w-fit flex flex-col">
          {/* Top Column Labels (A - O) */}
          <div className="flex ml-6 sm:ml-7 mb-1.5">
            {COL_LABELS.map((label) => (
              <div
                key={label}
                className="w-7 sm:w-8 md:w-9 text-center text-[10px] sm:text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Board Rows with Left Row Numbers (1 - 15) */}
          <div className="flex flex-col">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                {/* Left Row Number */}
                <div className="w-6 sm:w-7 text-right pr-2 text-[10px] sm:text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500 select-none">
                  {rowIndex + 1}
                </div>

                {/* Row of Cells */}
                <div className={`flex ${rowIndex === 0 ? "border-t border-neutral-200 dark:border-neutral-800" : ""}`}>
                  {row.map((cellValue, colIndex) => {
                    const isLast =
                      lastMove?.[0] === rowIndex && lastMove?.[1] === colIndex;
                    const isWin = winningSet.has(`${rowIndex}-${colIndex}`);

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={colIndex === 0 ? "border-l border-neutral-200 dark:border-neutral-800" : ""}
                      >
                        <CaroCell
                          row={rowIndex}
                          col={colIndex}
                          value={cellValue}
                          isLastMove={isLast}
                          isWinningCell={isWin}
                          canClick={canClick}
                          myRole={myRole}
                          onClick={onCellClick}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
