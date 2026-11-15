import { memo } from "react";
import { CaroPlayer } from "../types";

export type CaroPieceSize = "xs" | "sm" | "md" | "lg";

interface CaroPieceMarkProps {
  value: CaroPlayer;
  size?: CaroPieceSize;
  className?: string;
}

const SIZE_MAP: Record<CaroPieceSize, { container: string; svg: string; stroke: string }> = {
  xs: {
    container: "w-4 h-4",
    svg: "w-3 h-3",
    stroke: "3.5",
  },
  sm: {
    container: "w-5 h-5",
    svg: "w-4 h-4",
    stroke: "3",
  },
  md: {
    container: "w-7 h-7 sm:w-8 sm:h-8",
    svg: "w-5 h-5 sm:w-6 sm:h-6",
    stroke: "2.5",
  },
  lg: {
    container: "w-full h-full",
    svg: "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6",
    stroke: "3",
  },
};

export const CaroPieceMark = memo(function CaroPieceMark({
  value,
  size = "md",
  className = "",
}: CaroPieceMarkProps) {
  const sizeConfig = SIZE_MAP[size];

  if (value === CaroPlayer.X) {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 select-none ${sizeConfig.container} ${className}`}
      >
        <svg
          className={`${sizeConfig.svg} text-indigo-600 dark:text-indigo-400 drop-shadow-xs`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={sizeConfig.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${sizeConfig.container} ${className}`}
    >
      <svg
        className={`${sizeConfig.svg} text-rose-500 drop-shadow-xs`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sizeConfig.stroke}
      >
        <circle cx="12" cy="12" r="8" />
      </svg>
    </div>
  );
});
