import { ReactNode } from "react";
import { GameType } from "@/shared/types/room";

export interface GameBoardAdapterProps {
  gameType: GameType;
  children: ReactNode;
  className?: string;
}

/**
 * Standard game board maximum width mapping for board games (Caro, Xiangqi, Chess...)
 * Ensures all turn-based strategy board games maintain uniform width alignment with their scoreboards.
 */
export const GAME_BOARD_MAX_WIDTH: Record<GameType, string> = {
  [GameType.CARO]: "max-w-[540px]",
  [GameType.XIANGQI]: "max-w-[540px]",
  [GameType.CHESS]: "max-w-[540px]",
  [GameType.ANIMAL_CHESS]: "max-w-[540px]",
  [GameType.BIDA]: "max-w-[720px]",
  [GameType.TICTACTOE]: "max-w-[420px]",
};

/**
 * GameBoard Container (Strategy Pattern Host)
 * Provides standard layout container, responsive centering, and uniform alignment across all game modes.
 */
export function GameBoard({ gameType, children, className = "" }: GameBoardAdapterProps) {
  const maxWidthClass = GAME_BOARD_MAX_WIDTH[gameType] || "max-w-[540px]";

  return (
    <section
      data-game-type={gameType}
      className={`w-full ${maxWidthClass} flex flex-col items-center justify-center relative select-none animate-in fade-in duration-200 ${className}`}
    >
      {children}
    </section>
  );
}
