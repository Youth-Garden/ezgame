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
      <div className="mb-4 flex items-center justify-between w-full max-w-md px-4 py-2.5 rounded-xl bg-card border border-border shadow-2xs text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Turn:</span>
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              currentTurn === CaroPlayer.X ? "text-primary" : "text-destructive"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentTurn === CaroPlayer.X ? "bg-primary" : "bg-destructive"
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
            <span className="text-muted-foreground">Waiting for opponent...</span>
          )}
        </div>
      </div>

      {/* Board Outer Card */}
      <div className="p-3 sm:p-5 rounded-2xl bg-card border border-border shadow-xs max-w-full overflow-x-auto select-none">
        <div className="min-w-fit flex flex-col">
          {/* Top Column Labels (A - O) */}
          <div className="flex ml-6 sm:ml-7 mb-1.5">
            {COL_LABELS.map((label) => (
              <div
                key={label}
                className="w-7 sm:w-8 md:w-9 text-center text-[10px] sm:text-xs font-mono font-medium text-muted-foreground/70"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Board Rows with Left Row Numbers (1 - 15) */}
          <div className="flex flex-col border border-border/80 bg-background/50 rounded-lg overflow-hidden">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                {/* Left Row Number */}
                <div className="w-6 sm:w-7 text-right pr-2 text-[10px] sm:text-xs font-mono font-medium text-muted-foreground/70 select-none">
                  {rowIndex + 1}
                </div>

                {/* Row of Cells */}
                <div className="flex">
                  {row.map((cellValue, colIndex) => {
                    const isLast =
                      lastMove?.[0] === rowIndex && lastMove?.[1] === colIndex;
                    const isWin = winningSet.has(`${rowIndex}-${colIndex}`);

                    return (
                      <CaroCell
                        key={`${rowIndex}-${colIndex}`}
                        row={rowIndex}
                        col={colIndex}
                        value={cellValue}
                        isLastMove={isLast}
                        isWinningCell={isWin}
                        canClick={canClick}
                        myRole={myRole}
                        onClick={onCellClick}
                      />
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
