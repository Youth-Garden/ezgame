export enum XiangqiColor {
  RED = "RED",
  BLACK = "BLACK",
}

export enum XiangqiPieceType {
  GENERAL = "GENERAL",   // Tướng / Soái (帥 / 將)
  ADVISOR = "ADVISOR",   // Sĩ (仕 / 士)
  ELEPHANT = "ELEPHANT", // Tượng / Tịnh (相 / 象)
  HORSE = "HORSE",       // Mã (傌 / 馬)
  CHARIOT = "CHARIOT",   // Xe (俥 / 車)
  CANNON = "CANNON",     // Pháo (炮 / 砲)
  SOLDIER = "SOLDIER",   // Tốt / Binh (兵 / 卒)
}

export interface XiangqiPiece {
  id: string;
  type: XiangqiPieceType;
  color: XiangqiColor;
}

export interface XiangqiPosition {
  row: number; // 0 to 9 (0 is Black base, 9 is Red base)
  col: number; // 0 to 8 (0 is Left, 8 is Right from Red's perspective)
}

export interface XiangqiMove {
  from: XiangqiPosition;
  to: XiangqiPosition;
  piece: XiangqiPiece;
  captured?: XiangqiPiece | null;
}

export type XiangqiBoardState = (XiangqiPiece | null)[][];
