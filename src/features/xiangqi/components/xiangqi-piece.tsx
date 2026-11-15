import { XiangqiColor, XiangqiPiece } from "../types";
import { getPieceDisplay } from "../utils/xiangqi-display";

interface XiangqiPieceProps {
  piece: XiangqiPiece;
  isSelected?: boolean;
  isInCheck?: boolean;
}

export function XiangqiPieceComponent({
  piece,
  isSelected = false,
  isInCheck = false,
}: XiangqiPieceProps) {
  const isRed = piece.color === XiangqiColor.RED;
  const display = getPieceDisplay(piece.type, piece.color);

  return (
    <div
      className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center select-none transition-all duration-150 cursor-pointer ${
        isRed
          ? "bg-gradient-to-b from-[#FFFDF8] via-[#FCE4C3] to-[#E8A366] text-[#B91C1C] border border-[#C2621C] shadow-[0_5px_0_#943E08,0_7px_8px_rgba(0,0,0,0.45),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(148,62,8,0.5)]"
          : "bg-gradient-to-b from-[#FFFFFF] via-[#E6ECF2] to-[#A8B8C8] text-[#0F172A] border border-[#4F6174] shadow-[0_5px_0_#2B3847,0_7px_8px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-3px_5px_rgba(30,41,59,0.5)]"
      } ${
        isSelected
          ? "-translate-y-2 scale-105 ring-4 ring-amber-400 ring-offset-2 z-30 shadow-[0_12px_20px_rgba(0,0,0,0.4),0_6px_0_#943E08]"
          : "hover:-translate-y-0.5 hover:scale-105 z-10"
      } ${
        isInCheck ? "animate-pulse ring-4 ring-rose-600 ring-offset-2" : ""
      }`}
      title={`${display.vietnameseName} (${display.englishName})`}
    >
      {/* 3D Circular Groove Ring (Khắc rãnh tròn đồng tâm) */}
      <div
        className={`absolute inset-0.5 sm:inset-1 rounded-full border pointer-events-none transition-colors ${
          isRed
            ? "border-[#EA580C]/50 shadow-[inset_0_1.5px_2px_rgba(185,28,28,0.35),0_1px_1px_rgba(255,255,255,0.8)]"
            : "border-[#475569]/45 shadow-[inset_0_1.5px_2px_rgba(15,23,42,0.35),0_1px_1px_rgba(255,255,255,0.8)]"
        }`}
      />

      {/* Traditional Calligraphy Character with Chiseled / Engraved Effect */}
      <span
        className={`text-xl sm:text-2xl md:text-[28px] leading-none tracking-normal font-serif font-black select-none ${
          isRed
            ? "drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] filter [text-shadow:_0_1px_1px_rgba(255,255,255,0.8),_0_-1px_1px_#7F1D1D]"
            : "drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] filter [text-shadow:_0_1px_1px_rgba(255,255,255,0.8),_0_-1px_1px_#020617]"
        }`}
      >
        {display.char}
      </span>
    </div>
  );
}
