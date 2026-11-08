import { ReactNode } from "react";
import { GameType } from "@/shared/types/room";

export interface GameBoardAdapterProps {
  gameType: GameType;
  children: ReactNode;
}

/**
 * GameBoard Container (Strategy Pattern Host)
 * Renders the domain-specific board adapter while keeping layout and shared borders uniform.
 */
export function GameBoard({ gameType, children }: GameBoardAdapterProps) {
  return (
    <section
      data-game-type={gameType}
      className="w-full flex flex-col items-center justify-center relative select-none animate-in fade-in duration-200"
    >
      {children}
    </section>
  );
}
