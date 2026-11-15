import { XiangqiColor, XiangqiPieceType, type XiangqiPiece } from "../types";
import { getPieceDisplay } from "../utils/xiangqi-display";

export type XiangqiPieceSize = "xs" | "sm" | "md" | "lg";

export interface XiangqiPieceComponentProps {
  piece?: XiangqiPiece;
  type?: XiangqiPieceType;
  color?: XiangqiColor;
  size?: XiangqiPieceSize;
  interactive?: boolean;
  isSelected?: boolean;
  isInCheck?: boolean;
  className?: string;
}

const SIZE_STYLES: Record<
  XiangqiPieceSize,
  { container: string; text: string; groove: string }
> = {
  xs: {
    container: "w-[18px] h-[18px]",
    text: "text-[11px]",
    groove: "hidden",
  },
  sm: {
    container: "w-6 h-6",
    text: "text-xs",
    groove: "inset-0.5",
  },
  md: {
    container: "w-8 h-8 sm:w-9 sm:h-9",
    text: "text-lg sm:text-xl",
    groove: "inset-0.5",
  },
  lg: {
    container: "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11",
    text: "text-xl sm:text-2xl md:text-[28px]",
    groove: "inset-0.5 sm:inset-1",
  },
};

export function XiangqiPieceComponent({
  piece,
  type = piece?.type ?? XiangqiPieceType.SOLDIER,
  color = piece?.color ?? XiangqiColor.RED,
  size = "lg",
  interactive = false,
  isSelected = false,
  isInCheck = false,
  className = "",
}: XiangqiPieceComponentProps) {
  const isRed = color === XiangqiColor.RED;
  const display = getPieceDisplay(type, color);
  const sizeConfig = SIZE_STYLES[size];

  // Visual 3D gradients and borders
  const colorStyles = isRed
    ? "bg-gradient-to-b from-[#FFFDF8] via-[#FCE4C3] to-[#E8A366] text-[#B91C1C] border border-[#C2621C]"
    : "bg-gradient-to-b from-[#FFFFFF] via-[#E6ECF2] to-[#A8B8C8] text-[#0F172A] border border-[#4F6174]";

  const shadowStyles =
    size === "xs"
      ? "shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
      : isRed
      ? "shadow-[0_4px_0_#943E08,0_6px_8px_rgba(0,0,0,0.45),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(148,62,8,0.5)]"
      : "shadow-[0_4px_0_#2B3847,0_6px_8px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(30,41,59,0.5)]";

  const interactiveStyles = interactive
    ? `cursor-pointer transition-all duration-150 ${
        isSelected
          ? "-translate-y-2 scale-105 ring-4 ring-amber-400 ring-offset-2 z-30 shadow-[0_12px_20px_rgba(0,0,0,0.4),0_6px_0_#943E08]"
          : "hover:-translate-y-0.5 hover:scale-105 z-10"
      }`
    : "cursor-default select-none pointer-events-none";

  const checkStyles = isInCheck
    ? "animate-pulse ring-4 ring-rose-600 ring-offset-2"
    : "";

  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 select-none ${sizeConfig.container} ${colorStyles} ${shadowStyles} ${interactiveStyles} ${checkStyles} ${className}`}
      title={`${display.vietnameseName} (${display.englishName})`}
    >
      {/* 3D Circular Groove Ring */}
      {size !== "xs" && (
        <div
          className={`absolute rounded-full border pointer-events-none ${sizeConfig.groove} ${
            isRed
              ? "border-[#EA580C]/50 shadow-[inset_0_1.5px_2px_rgba(185,28,28,0.35),0_1px_1px_rgba(255,255,255,0.8)]"
              : "border-[#475569]/45 shadow-[inset_0_1.5px_2px_rgba(15,23,42,0.35),0_1px_1px_rgba(255,255,255,0.8)]"
          }`}
        />
      )}

      {/* Traditional Calligraphy Character with Chiseled Effect */}
      <span
        className={`leading-none tracking-normal font-serif font-black select-none ${sizeConfig.text} ${
          isRed
            ? "drop-shadow-[0_0.5px_1px_rgba(255,255,255,0.9)] filter [text-shadow:_0_0.5px_1px_rgba(255,255,255,0.8),_0_-0.5px_1px_#7F1D1D]"
            : "drop-shadow-[0_0.5px_1px_rgba(255,255,255,0.9)] filter [text-shadow:_0_0.5px_1px_rgba(255,255,255,0.8),_0_-0.5px_1px_#020617]"
        }`}
      >
        {display.char}
      </span>
    </div>
  );
}
