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
  // Set of winning coordinates for O(1) cell lookup
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
      <div className="mb-3 sm:mb-4 flex items-center justify-between w-full max-w-md px-4 py-2 rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-md shadow-md text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/60">Lượt đánh:</span>
          <span
            className={`font-bold flex items-center gap-1.5 ${
              currentTurn === CaroPlayer.X ? "text-cyan-400" : "text-rose-400"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentTurn === CaroPlayer.X
                  ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
              }`}
            />
            Quân {currentTurn}
          </span>
        </div>

        <div className="text-xs">
          {canClick ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Đến lượt bạn!
            </span>
          ) : (
            <span className="text-white/40">Đang chờ đối phương...</span>
          )}
        </div>
      </div>

      {/* Board Outer Card with Grid & Coordinates */}
      <div className="p-2 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-cyan-950/20 max-w-full overflow-x-auto select-none">
        <div className="min-w-fit flex flex-col">
          {/* Top Column Labels (A - O) */}
          <div className="flex ml-6 sm:ml-7 mb-1">
            {COL_LABELS.map((label) => (
              <div
                key={label}
                className="w-7 sm:w-8 md:w-9 text-center text-[10px] sm:text-xs font-mono font-medium text-slate-500"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Rows */}
          {board.map((rowCells, row) => (
            <div key={row} className="flex items-center">
              {/* Row Number Label (1 - 15) */}
              <div className="w-6 sm:w-7 pr-1 text-right text-[10px] sm:text-xs font-mono font-medium text-slate-500">
                {row + 1}
              </div>

              {/* Grid Cells */}
              <div className="flex bg-slate-950/60 rounded-sm overflow-hidden border border-slate-700">
                {rowCells.map((value, col) => (
                  <CaroCell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    value={value}
                    isLastMove={
                      lastMove !== null &&
                      lastMove[0] === row &&
                      lastMove[1] === col
                    }
                    isWinningCell={winningSet.has(`${row}-${col}`)}
                    canClick={canClick}
                    myRole={myRole}
                    onClick={onCellClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
