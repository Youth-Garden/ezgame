"use client";

import { useMemo } from "react";
import {
  XiangqiBoardState,
  XiangqiColor,
  XiangqiMove,
  XiangqiPieceType,
  XiangqiPosition,
} from "../types";
import { BOARD_COLS, BOARD_ROWS } from "../utils/xiangqi-rules";
import { XiangqiPieceComponent } from "./xiangqi-piece";

interface XiangqiBoardProps {
  board: XiangqiBoardState;
  selectedPos: XiangqiPosition | null;
  validMoves: XiangqiPosition[];
  lastMove: XiangqiMove | null;
  myColor: XiangqiColor | null;
  isInCheckColor: XiangqiColor | null;
  canInteract: boolean;
  onSelectPosition: (pos: XiangqiPosition) => void;
}

export function XiangqiBoard({
  board,
  selectedPos,
  validMoves,
  lastMove,
  myColor,
  isInCheckColor,
  canInteract,
  onSelectPosition,
}: XiangqiBoardProps) {
  // Flip the board if player is playing Black, so own pieces are always at the bottom
  const isFlipped = myColor === XiangqiColor.BLACK;

  // Grid coordinates mapping
  const rowIndices = useMemo(() => {
    const indices = Array.from({ length: BOARD_ROWS }, (_, i) => i);
    return isFlipped ? indices.reverse() : indices;
  }, [isFlipped]);

  const colIndices = useMemo(() => {
    const indices = Array.from({ length: BOARD_COLS }, (_, i) => i);
    return isFlipped ? indices.reverse() : indices;
  }, [isFlipped]);

  return (
    <div className="relative p-3 sm:p-5 md:p-6 rounded-2xl bg-[#E8D4B0] dark:bg-[#1E1A16] shadow-2xl border-4 border-[#8B5A2B] dark:border-[#54361B] select-none max-w-full overflow-hidden">
      {/* Board Outer Wooden Frame and River Design */}
      <div className="relative w-[340px] h-[380px] sm:w-[420px] sm:h-[470px] md:w-[470px] md:h-[530px] flex flex-col justify-between">
        
        {/* SVG Board Grid Lines (Standard 9 columns x 10 rows) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 360 405"
        >
          {/* Outer Border */}
          <rect
            x="20"
            y="20"
            width="320"
            height="365"
            fill="none"
            stroke="#6B4423"
            strokeWidth="2.5"
            className="dark:stroke-[#9A6B3D]"
          />

          {/* Horizontal lines (10 lines total) */}
          {Array.from({ length: 10 }).map((_, i) => {
            const y = 20 + (i * 365) / 9;
            return (
              <line
                key={`h-${i}`}
                x1="20"
                y1={y}
                x2="340"
                y2={y}
                stroke="#8B5A2B"
                strokeWidth="1.2"
                className="dark:stroke-[#78532F]"
              />
            );
          })}

          {/* Vertical lines (9 lines total, interrupted across the River in rows 4-5) */}
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 20 + (i * 320) / 8;
            if (i === 0 || i === 8) {
              // Outer vertical border lines go all the way through
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1="20"
                  x2={x}
                  y2="385"
                  stroke="#8B5A2B"
                  strokeWidth="1.5"
                  className="dark:stroke-[#78532F]"
                />
              );
            }
            // Inner vertical lines break at the river
            const yRiverTop = 20 + (4 * 365) / 9;
            const yRiverBottom = 20 + (5 * 365) / 9;
            return (
              <g key={`v-${i}`}>
                <line
                  x1={x}
                  y1="20"
                  x2={x}
                  y2={yRiverTop}
                  stroke="#8B5A2B"
                  strokeWidth="1.2"
                  className="dark:stroke-[#78532F]"
                />
                <line
                  x1={x}
                  y1={yRiverBottom}
                  x2={x}
                  y2="385"
                  stroke="#8B5A2B"
                  strokeWidth="1.2"
                  className="dark:stroke-[#78532F]"
                />
              </g>
            );
          })}

          {/* Diagonal Lines for Palaces (Row 0-2 and Row 7-9 cols 3-5) */}
          {/* Top Palace (cols 3 to 5, lines 0 to 2) */}
          <line
            x1={20 + (3 * 320) / 8}
            y1={20}
            x2={20 + (5 * 320) / 8}
            y2={20 + (2 * 365) / 9}
            stroke="#8B5A2B"
            strokeWidth="1.2"
            className="dark:stroke-[#78532F]"
          />
          <line
            x1={20 + (5 * 320) / 8}
            y1={20}
            x2={20 + (3 * 320) / 8}
            y2={20 + (2 * 365) / 9}
            stroke="#8B5A2B"
            strokeWidth="1.2"
            className="dark:stroke-[#78532F]"
          />

          {/* Bottom Palace (cols 3 to 5, lines 7 to 9) */}
          <line
            x1={20 + (3 * 320) / 8}
            y1={20 + (7 * 365) / 9}
            x2={20 + (5 * 320) / 8}
            y2={385}
            stroke="#8B5A2B"
            strokeWidth="1.2"
            className="dark:stroke-[#78532F]"
          />
          <line
            x1={20 + (5 * 320) / 8}
            y1={20 + (7 * 365) / 9}
            x2={20 + (3 * 320) / 8}
            y2={385}
            stroke="#8B5A2B"
            strokeWidth="1.2"
            className="dark:stroke-[#78532F]"
          />

          {/* Traditional River Han-Chu Characters (楚河 漢界) */}
          <text
            x="95"
            y={20 + (4.65 * 365) / 9}
            fill="#8B5A2B"
            fontSize="15"
            fontFamily="serif"
            fontWeight="bold"
            letterSpacing="6"
            className="dark:fill-[#9A6B3D] opacity-60 select-none pointer-events-none"
          >
            楚 河
          </text>
          <text
            x="215"
            y={20 + (4.65 * 365) / 9}
            fill="#8B5A2B"
            fontSize="15"
            fontFamily="serif"
            fontWeight="bold"
            letterSpacing="6"
            className="dark:fill-[#9A6B3D] opacity-60 select-none pointer-events-none"
          >
            漢 界
          </text>
        </svg>

        {/* Board Cells (Intersection Points 10 rows x 9 cols) */}
        <div className="relative w-full h-full grid grid-rows-10 grid-cols-9 z-10">
          {rowIndices.map((r) =>
            colIndices.map((c) => {
              const piece = board[r][c];
              const isSelected = selectedPos?.row === r && selectedPos?.col === c;
              const isValidTarget = validMoves.some((m) => m.row === r && m.col === c);
              const isLastMoveFrom = lastMove?.from.row === r && lastMove?.from.col === c;
              const isLastMoveTo = lastMove?.to.row === r && lastMove?.to.col === c;
              const isGeneralInCheck =
                piece?.type === XiangqiPieceType.GENERAL && piece.color === isInCheckColor;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => canInteract && onSelectPosition({ row: r, col: c })}
                  className="relative flex items-center justify-center cursor-pointer group"
                >
                  {/* Last Move Indicator Ring */}
                  {(isLastMoveFrom || isLastMoveTo) && (
                    <div className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 border-amber-500/80 bg-amber-400/15 pointer-events-none animate-pulse" />
                  )}

                  {/* Valid Move Target Highlight Dot or Capture Ring */}
                  {isValidTarget && (
                    <div className="absolute z-30 pointer-events-none flex items-center justify-center">
                      {piece ? (
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-3 border-rose-500 bg-rose-500/25 animate-ping duration-1000" />
                      ) : (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 shadow-md ring-2 ring-white/80" />
                      )}
                    </div>
                  )}

                  {/* Piece Component */}
                  {piece && (
                    <XiangqiPieceComponent
                      piece={piece}
                      isSelected={isSelected}
                      isInCheck={isGeneralInCheck}
                    />
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
