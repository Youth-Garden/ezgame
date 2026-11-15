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

export function CaroBoard({
  board,
  lastMove,
  winningLine,
  canClick,
  myRole,
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
    <div className="w-full flex flex-col items-center select-none">
      {/* Board Outer Wooden Frame (Phong cách bàn cờ vây / cờ ca rô gỗ ấm) */}
      <div className="p-2 sm:p-4 rounded-2xl bg-gradient-to-b from-[#ECD7B5] to-[#DFCA9F] dark:from-[#261E16] dark:to-[#1A140F] shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] border-[6px] border-[#78461E] dark:border-[#4A2C14] max-w-full overflow-x-auto flex justify-center">
        {/* Inner Border Trim */}
        <div className="p-1 sm:p-2 rounded-xl border-2 border-[#A26D3F]/40 dark:border-[#5C3B1E]/60 bg-[#F4E4C6]/40 dark:bg-[#1E1710]/40 flex flex-col items-center">
          {/* Board Grid */}
          <div className="flex flex-col border border-[#8B5A2B]/40 dark:border-[#78532F]/50 bg-[#F9F0DF]/90 dark:bg-[#1C1712]/90 shadow-inner rounded-sm overflow-hidden">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                <div className={`flex ${rowIndex === 0 ? "" : "border-t border-[#8B5A2B]/25 dark:border-[#78532F]/30"}`}>
                  {row.map((cellValue, colIndex) => {
                    const isLast =
                      lastMove?.[0] === rowIndex && lastMove?.[1] === colIndex;
                    const isWin = winningSet.has(`${rowIndex}-${colIndex}`);

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={colIndex === 0 ? "" : "border-l border-[#8B5A2B]/25 dark:border-[#78532F]/30"}
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
