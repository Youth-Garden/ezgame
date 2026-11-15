export enum ChessPieceColor {
  WHITE = "w",
  BLACK = "b",
}

export enum ChessPieceType {
  PAWN = "p",
  KNIGHT = "n",
  BISHOP = "b",
  ROOK = "r",
  QUEEN = "q",
  KING = "k",
}

export interface ChessPiece {
  type: ChessPieceType;
  color: ChessPieceColor;
}

export interface SquareCoord {
  row: number; // 0 to 7
  col: number; // 0 to 7
}

export interface ChessMovePayload {
  from: string; // e.g. "e2"
  to: string;   // e.g. "e4"
  promotion?: string; // "q", "r", "b", "n"
}
