import { memo } from "react";
import { type BidaBall } from "../types";

export interface BidaBallItemProps {
  id: number;
  ball?: BidaBall;
  size?: "xs" | "sm" | "md" | "lg";
  isPocketed?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const BidaBallItem = memo(function BidaBallItem({
  id,
  ball,
  size = "sm",
  isPocketed = ball?.isPocketed ?? false,
  className = "",
}: BidaBallItemProps) {
  const ballId = ball?.id ?? id;

  return (
    <div
      title={`Ball #${ballId} ${isPocketed ? "(Pocketed)" : "(On Table)"}`}
      className={`relative ${SIZE_CLASSES[size]} rounded-full flex items-center justify-center shrink-0 transition-all duration-300 select-none ${
        isPocketed
          ? "opacity-20 scale-75 grayscale contrast-50 brightness-75"
          : "opacity-100 scale-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
      } ${className}`}
    >
      <img
        src={`/games/bida/ball-${ballId}.svg`}
        alt={`Ball ${ballId}`}
        className="w-full h-full object-contain pointer-events-none select-none"
        loading="eager"
      />
    </div>
  );
});
