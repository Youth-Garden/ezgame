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

// Traditional Cross Markers (Dấu hoa thị) for Xiangqi
function StarMarker({ x, y, skipLeft = false, skipRight = false }: { x: number; y: number; skipLeft?: boolean; skipRight?: boolean }) {
  const d = 3.5;
  const len = 6;
  return (
    <g stroke="#8B5A2B" strokeWidth="1" className="dark:stroke-[#9A6B3D] opacity-70">
      {!skipLeft && (
        <>
          <path d={`M ${x - d - len} ${y - d} L ${x - d} ${y - d} L ${x - d} ${y - d - len}`} fill="none" />
          <path d={`M ${x - d - len} ${y + d} L ${x - d} ${y + d} L ${x - d} ${y + d + len}`} fill="none" />
        </>
      )}
      {!skipRight && (
        <>
          <path d={`M ${x + d + len} ${y - d} L ${x + d} ${y - d} L ${x + d} ${y - d - len}`} fill="none" />
          <path d={`M ${x + d + len} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + d + len}`} fill="none" />
        </>
      )}
    </g>
  );
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
    <div className="relative p-2.5 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-b from-[#ECD7B5] via-[#E2C99D] to-[#CFB280] dark:from-[#2A2016] dark:via-[#211810] dark:to-[#160F0A] shadow-[0_18px_40px_rgba(0,0,0,0.45),0_8px_0_#543013,inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-4px_6px_rgba(0,0,0,0.35)] border-4 border-[#8B5325] dark:border-[#523014] select-none max-w-full overflow-hidden">
      {/* Wooden Inner Trim with Recessed Carved Look (Hiệu ứng khoét rãnh 3D lòng bàn cờ) */}
      <div className="relative p-1.5 sm:p-2 rounded-xl border border-[#7A451A]/60 dark:border-[#42240E]/80 bg-gradient-to-b from-[#E7D0A9] to-[#F1E0BE] dark:from-[#1D150E] dark:to-[#241B13] shadow-[inset_0_3px_6px_rgba(0,0,0,0.25),inset_0_-2px_4px_rgba(255,255,255,0.4)]">
        <div className="relative w-[340px] h-[380px] sm:w-[420px] sm:h-[470px] md:w-[470px] md:h-[530px] flex flex-col justify-between">
          
          {/* SVG Board Grid Lines (Standard 9 columns x 10 rows) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 360 405"
          >
            {/* Outer Inset Shadow for Grid */}
            <rect
              x="16"
              y="16"
              width="328"
              height="373"
              fill="none"
              stroke="#A87242"
              strokeWidth="1.2"
              opacity="0.4"
              className="dark:stroke-[#9A6B3D]"
            />
            {/* Outer Border with inner thin line */}
            <rect
              x="20"
              y="20"
              width="320"
              height="365"
              fill="none"
              stroke="#5C3615"
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
            {/* Top Palace */}
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

            {/* Bottom Palace */}
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

            {/* Traditional Star Cross Markers for Cannon & Soldier Positions */}
            {/* Cannon rows: row 2 & row 7, cols 1 & 7 */}
            {[2, 7].map((r) =>
              [1, 7].map((c) => {
                const x = 20 + (c * 320) / 8;
                const y = 20 + (r * 365) / 9;
                return <StarMarker key={`cannon-star-${r}-${c}`} x={x} y={y} />;
              })
            )}

            {/* Soldier rows: row 3 & row 6, cols 0, 2, 4, 6, 8 */}
            {[3, 6].map((r) =>
              [0, 2, 4, 6, 8].map((c) => {
                const x = 20 + (c * 320) / 8;
                const y = 20 + (r * 365) / 9;
                return (
                  <StarMarker
                    key={`soldier-star-${r}-${c}`}
                    x={x}
                    y={y}
                    skipLeft={c === 0}
                    skipRight={c === 8}
                  />
                );
              })
            )}

            {/* Traditional River Han-Chu Characters (楚河 漢界) */}
            <text
              x="92"
              y={20 + (4.65 * 365) / 9}
              fill="#8B5A2B"
              fontSize="16"
              fontFamily="serif"
              fontWeight="900"
              letterSpacing="8"
              className="dark:fill-[#9A6B3D] opacity-75 select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
            >
              楚 河
            </text>
            <text
              x="212"
              y={20 + (4.65 * 365) / 9}
              fill="#8B5A2B"
              fontSize="16"
              fontFamily="serif"
              fontWeight="900"
              letterSpacing="8"
              className="dark:fill-[#9A6B3D] opacity-75 select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
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
                      <div className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 border-amber-500/90 bg-amber-400/20 pointer-events-none animate-pulse shadow-sm" />
                    )}

                    {/* Valid Move Target Highlight Dot or Capture Ring */}
                    {isValidTarget && (
                      <div className="absolute z-20 pointer-events-none flex items-center justify-center">
                        {piece ? (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 border-rose-500/80 bg-rose-500/20" />
                        ) : (
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 shadow-[0_2px_4px_rgba(16,185,129,0.4)] ring-2 ring-white/90" />
                        )}
                      </div>
                    )}

                    {/* Piece Component */}
                    {piece && (
                      <XiangqiPieceComponent
                        piece={piece}
                        size="lg"
                        interactive={canInteract}
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
    </div>
  );
}
