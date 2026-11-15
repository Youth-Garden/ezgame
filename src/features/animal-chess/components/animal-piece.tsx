import { memo } from "react";
import { AnimalColor, AnimalType } from "../types";
import { ANIMAL_EMOJIS, ANIMAL_NAMES_VI, ANIMAL_RANKS } from "../utils/animal-chess-rules";

interface AnimalPieceProps {
  type: AnimalType;
  color: AnimalColor;
  className?: string;
}

export const AnimalPieceView = memo(function AnimalPieceView({
  type,
  color,
  className = "w-full h-full",
}: AnimalPieceProps) {
  const isBlue = color === AnimalColor.BLUE;
  const rank = ANIMAL_RANKS[type];
  const name = ANIMAL_NAMES_VI[type];
  const emoji = ANIMAL_EMOJIS[type];

  return (
    <div
      className={`relative rounded-full flex flex-col items-center justify-center p-1 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 shadow-md border-2 ${
        isBlue
          ? "bg-gradient-to-b from-blue-500 to-indigo-700 border-blue-200 text-white shadow-blue-500/30"
          : "bg-gradient-to-b from-rose-500 to-red-700 border-rose-200 text-white shadow-rose-500/30"
      } ${className}`}
    >
      {/* Animal Emoji */}
      <span className="text-xl sm:text-2xl leading-none drop-shadow-sm select-none">
        {emoji}
      </span>

      {/* Name and Rank Badge */}
      <div className="flex items-center gap-0.5 mt-0.5">
        <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none drop-shadow">
          {name}
        </span>
        <span className="text-[8px] font-bold px-1 rounded-full bg-black/30 leading-none">
          {rank}
        </span>
      </div>
    </div>
  );
});
