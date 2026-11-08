"use client";

import { useMemo } from "react";
import { CaroCell } from "./caro-cell";
import { CaroPlayer, type BoardState, type WinningLine } from "../types";
import { PlayerRole } from "@/shared/types/room";
import { Card } from "@/shared/components/ui/card";

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


      {/* Board Outer Card using Shared Card Component */}
      <Card
        variant="solid"
        className="p-3 sm:p-5 rounded-2xl shadow-none border-none max-w-full overflow-x-auto select-none"
      >
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
      </Card>
    </div>
  );
}
