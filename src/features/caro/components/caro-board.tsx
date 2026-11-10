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
    <div className="w-full flex flex-col items-center">
      {/* Board Outer Card using Shared Card Component */}
      <Card
        variant="solid"
        className="w-full sm:w-fit p-1.5 sm:p-5 max-w-full overflow-x-auto flex justify-center"
      >
        <div className="flex flex-col items-center">
          {/* Board Grid */}
          <div className="flex flex-col">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
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
