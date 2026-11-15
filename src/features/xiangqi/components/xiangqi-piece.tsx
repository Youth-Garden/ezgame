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
      className={`relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-serif font-black select-none transition-transform duration-150 cursor-pointer shadow-md ${
        isRed
          ? "bg-[#FEF2E8] dark:bg-[#2C1810] text-[#DC2626] border-2 border-[#EA580C] shadow-[#EA580C]/20"
          : "bg-[#F3F4F6] dark:bg-[#1E2024] text-[#1E293B] dark:text-[#E2E8F0] border-2 border-[#475569] shadow-black/30"
      } ${
        isSelected
          ? "scale-110 ring-4 ring-amber-400 ring-offset-2 z-20 drop-shadow-lg"
          : "hover:scale-105 z-10"
      } ${
        isInCheck ? "animate-pulse ring-4 ring-rose-500 ring-offset-2" : ""
      }`}
      title={`${display.vietnameseName} (${display.englishName})`}
    >
      {/* Wooden Ring Inset Texture */}
      <div
        className={`absolute inset-0.5 rounded-full border border-dashed pointer-events-none opacity-40 ${
          isRed ? "border-[#DC2626]" : "border-[#475569]"
        }`}
      />

      {/* Traditional Calligraphy Character */}
      <span className="text-xl sm:text-2xl md:text-3xl leading-none tracking-normal drop-shadow-sm font-bold">
        {display.char}
      </span>
    </div>
  );
}
