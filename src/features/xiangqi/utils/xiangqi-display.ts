import { XiangqiColor, XiangqiPieceType } from "../types";

export interface PieceDisplayInfo {
  char: string;
  vietnameseName: string;
  englishName: string;
}

export function getPieceDisplay(type: XiangqiPieceType, color: XiangqiColor): PieceDisplayInfo {
  const isRed = color === XiangqiColor.RED;

  switch (type) {
    case XiangqiPieceType.GENERAL:
      return {
        char: isRed ? "帥" : "將",
        vietnameseName: isRed ? "Tướng (Soái)" : "Tướng",
        englishName: "General",
      };
    case XiangqiPieceType.ADVISOR:
      return {
        char: isRed ? "仕" : "士",
        vietnameseName: "Sĩ",
        englishName: "Advisor",
      };
    case XiangqiPieceType.ELEPHANT:
      return {
        char: isRed ? "相" : "象",
        vietnameseName: isRed ? "Tượng (Tướng)" : "Tượng (Voi)",
        englishName: "Elephant",
      };
    case XiangqiPieceType.HORSE:
      return {
        char: isRed ? "傌" : "馬",
        vietnameseName: "Mã",
        englishName: "Horse",
      };
    case XiangqiPieceType.CHARIOT:
      return {
        char: isRed ? "俥" : "車",
        vietnameseName: "Xe",
        englishName: "Chariot",
      };
    case XiangqiPieceType.CANNON:
      return {
        char: isRed ? "炮" : "砲",
        vietnameseName: "Pháo",
        englishName: "Cannon",
      };
    case XiangqiPieceType.SOLDIER:
      return {
        char: isRed ? "兵" : "卒",
        vietnameseName: isRed ? "Binh (Tốt)" : "Tốt",
        englishName: "Soldier",
      };
  }
}
