export enum AnimalColor {
  BLUE = "BLUE",
  RED = "RED",
}

export enum AnimalType {
  RAT = "RAT",           // Cấp 1: Chuột (bơi được, bắt voi)
  CAT = "CAT",           // Cấp 2: Mèo
  WOLF = "WOLF",         // Cấp 3: Sói
  DOG = "DOG",           // Cấp 4: Chó
  LEOPARD = "LEOPARD",   // Cấp 5: Báo
  TIGER = "TIGER",       // Cấp 6: Hổ (nhảy sông)
  LION = "LION",         // Cấp 7: Sư tử (nhảy sông)
  ELEPHANT = "ELEPHANT", // Cấp 8: Voi (bắt được từ cấp 2-8, sợ Chuột)
}

export enum TerrainType {
  LAND = "LAND",
  RIVER = "RIVER",
  TRAP = "TRAP",
  DEN = "DEN",
}

export interface AnimalPiece {
  id: string;
  type: AnimalType;
  color: AnimalColor;
}

export interface Position {
  row: number; // 0 to 8 (9 rows total)
  col: number; // 0 to 6 (7 cols total)
}

export interface AnimalMove {
  from: Position;
  to: Position;
  piece: AnimalPiece;
  captured?: AnimalPiece | null;
}

export type AnimalBoardState = (AnimalPiece | null)[][];
