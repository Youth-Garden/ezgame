"use client";

import { useMemo } from "react";
import { type Square, type PieceSymbol, type Color } from "chess.js";
import { ChessPieceColor, ChessPieceType } from "../types";
import { ChessPieceView } from "./chess-piece";

interface ChessBoardProps {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  myColor: ChessPieceColor;
  selectedSquare: Square | null;
  validTargetSquares: Square[];
  lastMove: { from: Square; to: Square } | null;
  isCheckSquare: Square | null;
  onSquareClick: (square: Square) => void;
  disabled?: boolean;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

export function ChessBoard({
  board,
  myColor,
  selectedSquare,
  validTargetSquares,
  lastMove,
  isCheckSquare,
  onSquareClick,
  disabled = false,
}: ChessBoardProps) {
  const isWhite = myColor === ChessPieceColor.WHITE;

  // Coordinate display arrays depending on orientation
  const filesList = useMemo(() => (isWhite ? FILES : [...FILES].reverse()), [isWhite]);
  const ranksList = useMemo(() => (isWhite ? RANKS : [...RANKS].reverse()), [isWhite]);

  // Transform 8x8 board rows for White or Black perspective
  const displayedBoard = useMemo(() => {
    // board is 8 rows, row 0 is rank 8, row 7 is rank 1
    if (isWhite) {
      return board;
    }
    // For Black: reverse rows and reverse each row's squares
    return [...board].reverse().map((row) => [...row].reverse());
  }, [board, isWhite]);

  const validTargetsSet = useMemo(() => new Set(validTargetSquares), [validTargetSquares]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Board Outer Card - Minimalist Clean Style matching Caro and Xiangqi */}
      <div className="p-2 sm:p-3.5 rounded-3xl bg-card border border-border/50 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_16px_36px_rgba(15,23,42,0.08)] max-w-full flex flex-col items-center">
        {/* 8x8 Grid Container - Responsive sizing that scales up on desktop and fullscreen */}
        <div className="relative w-[min(90vw,min(calc(100vh-210px),580px))] aspect-square grid grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden border border-slate-300 dark:border-neutral-800 shadow-md">
          {displayedBoard.map((rowSquares, rowIndex) => {
            return rowSquares.map((cell, colIndex) => {
              const file = filesList[colIndex];
              const rank = ranksList[rowIndex];
              const squareName = `${file}${rank}` as Square;

              const actualFileIdx = FILES.indexOf(file);
              const actualRankIdx = 8 - parseInt(rank, 10);
              const isLight = (actualFileIdx + actualRankIdx) % 2 === 0;

              const isSelected = selectedSquare === squareName;
              const isValidTarget = validTargetsSet.has(squareName);
              const isLastMoveSquare =
                lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              const isChecked = isCheckSquare === squareName;

              const showFileCoord = rowIndex === 7;
              const showRankCoord = colIndex === 0;

              return (
                <div
                  key={squareName}
                  onClick={() => !disabled && onSquareClick(squareName)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isLight
                      ? "bg-[#EEEED2] dark:bg-[#E2D6B5]"
                      : "bg-[#769656] dark:bg-[#738A53]"
                  } ${isSelected ? "!bg-[#BACA44]" : ""} ${
                    isLastMoveSquare && !isSelected ? "!bg-[#F5F682]/70" : ""
                  } ${isChecked ? "!bg-rose-500/80" : ""}`}
                >
                  {/* Rank number coordinate (top left of cell) */}
                  {showRankCoord && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-bold font-mono pointer-events-none ${
                        isLight
                          ? "text-[#769656] dark:text-[#738A53]"
                          : "text-[#EEEED2] dark:text-[#E2D6B5]"
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* File letter coordinate (bottom right of cell) */}
                  {showFileCoord && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-bold font-mono pointer-events-none ${
                        isLight
                          ? "text-[#769656] dark:text-[#738A53]"
                          : "text-[#EEEED2] dark:text-[#E2D6B5]"
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Chess Piece */}
                  {cell && (
                    <div className="w-[84%] h-[84%] relative z-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 drop-shadow-sm">
                      <ChessPieceView
                        type={cell.type as ChessPieceType}
                        color={cell.color as ChessPieceColor}
                      />
                    </div>
                  )}

                  {/* Valid Target Move Hint */}
                  {isValidTarget && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      {cell ? (
                        <div className="w-full h-full border-4 sm:border-[5px] border-black/25 rounded-full scale-90 animate-pulse" />
                      ) : (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black/20 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
