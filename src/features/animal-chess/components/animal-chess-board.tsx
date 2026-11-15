"use client";

import { useMemo } from "react";
import { AnimalBoardState, AnimalColor, TerrainType, type Position } from "../types";
import { BOARD_COLS, BOARD_ROWS, getTerrainType, isTrap, isDen } from "../utils/animal-chess-rules";
import { AnimalPieceView } from "./animal-piece";

interface AnimalChessBoardProps {
  board: AnimalBoardState;
  myColor: AnimalColor;
  selectedPos: Position | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
}

export function AnimalChessBoard({
  board,
  myColor,
  selectedPos,
  validMoves,
  lastMove,
  onCellClick,
  disabled = false,
}: AnimalChessBoardProps) {
  // Flip board for Red so own pieces are at the bottom
  const isFlipped = myColor === AnimalColor.RED;

  const rowIndices = useMemo(() => {
    const list = Array.from({ length: BOARD_ROWS }, (_, i) => i);
    return isFlipped ? list.reverse() : list;
  }, [isFlipped]);

  const colIndices = useMemo(() => {
    const list = Array.from({ length: BOARD_COLS }, (_, i) => i);
    return isFlipped ? list.reverse() : list;
  }, [isFlipped]);

  const validTargetsSet = useMemo(() => {
    const set = new Set<string>();
    validMoves.forEach((pos) => set.add(`${pos.row}-${pos.col}`));
    return set;
  }, [validMoves]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Outer Card with jungle border styling */}
      <div className="p-2 sm:p-3.5 rounded-3xl bg-card border border-border/50 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_16px_36px_rgba(15,23,42,0.08)] max-w-full flex flex-col items-center">
        {/* 7x9 Grid Container */}
        <div className="relative w-[min(90vw,min(calc(100vh-210px),480px))] aspect-[7/9] grid grid-cols-7 grid-rows-9 rounded-2xl overflow-hidden border-2 border-emerald-800/40 shadow-inner bg-[#EAE2B7]">
          {rowIndices.map((actualRow) =>
            colIndices.map((actualCol) => {
              const piece = board[actualRow][actualCol];
              const terrain = getTerrainType(actualRow, actualCol);
              const trapInfo = isTrap(actualRow, actualCol);
              const denInfo = isDen(actualRow, actualCol);

              const isSelected =
                selectedPos?.row === actualRow && selectedPos?.col === actualCol;
              const isValidTarget = validTargetsSet.has(`${actualRow}-${actualCol}`);
              const isLastMoveCell =
                lastMove &&
                ((lastMove.from.row === actualRow && lastMove.from.col === actualCol) ||
                  (lastMove.to.row === actualRow && lastMove.to.col === actualCol));

              // Terrain styling
              let cellBg = "bg-[#EAE2B7] dark:bg-[#2D2A26]"; // Default Land
              let terrainBadge = null;

              if (terrain === TerrainType.RIVER) {
                cellBg = "bg-[#90E0EF] dark:bg-[#0077B6]/70";
                terrainBadge = (
                  <span className="text-[11px] opacity-40 select-none">🌊</span>
                );
              } else if (terrain === TerrainType.TRAP) {
                cellBg = trapInfo.owner === AnimalColor.BLUE
                  ? "bg-blue-200/80 dark:bg-blue-950/60"
                  : "bg-rose-200/80 dark:bg-rose-950/60";
                terrainBadge = (
                  <span className="text-[10px] font-black tracking-tight text-neutral-600 dark:text-neutral-400 select-none uppercase">
                    Bẫy
                  </span>
                );
              } else if (terrain === TerrainType.DEN) {
                cellBg = denInfo.owner === AnimalColor.BLUE
                  ? "bg-blue-300 dark:bg-blue-900"
                  : "bg-rose-300 dark:bg-rose-900";
                terrainBadge = (
                  <span className="text-sm select-none">
                    {denInfo.owner === AnimalColor.BLUE ? "🏰" : "🏯"}
                  </span>
                );
              }

              return (
                <div
                  key={`${actualRow}-${actualCol}`}
                  onClick={() => !disabled && onCellClick(actualRow, actualCol)}
                  className={`relative flex items-center justify-center cursor-pointer border border-black/10 dark:border-white/10 transition-colors ${cellBg} ${
                    isSelected ? "!bg-amber-300 dark:!bg-amber-600/80 ring-2 ring-amber-500 z-10" : ""
                  } ${isLastMoveCell && !isSelected ? "!bg-amber-200/60 dark:!bg-amber-700/40" : ""}`}
                >
                  {/* Terrain background icon */}
                  {terrainBadge && !piece && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {terrainBadge}
                    </div>
                  )}

                  {/* Animal Piece Component */}
                  {piece && (
                    <div className="w-[86%] h-[86%] relative z-10 flex items-center justify-center">
                      <AnimalPieceView type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Valid Move Target Highlight */}
                  {isValidTarget && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      {piece ? (
                        <div className="w-full h-full border-4 border-rose-500/80 rounded-full scale-90 animate-pulse" />
                      ) : (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500/60 rounded-full animate-ping" />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
