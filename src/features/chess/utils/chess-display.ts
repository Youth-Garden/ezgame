import { ChessPieceColor, ChessPieceType } from "../types";

export const PIECE_VALUES: Record<ChessPieceType, number> = {
  [ChessPieceType.PAWN]: 1,
  [ChessPieceType.KNIGHT]: 3,
  [ChessPieceType.BISHOP]: 3,
  [ChessPieceType.ROOK]: 5,
  [ChessPieceType.QUEEN]: 9,
  [ChessPieceType.KING]: 0,
};

export const PIECE_SYMBOLS: Record<ChessPieceColor, Record<ChessPieceType, string>> = {
  [ChessPieceColor.WHITE]: {
    [ChessPieceType.KING]: "♔",
    [ChessPieceType.QUEEN]: "♕",
    [ChessPieceType.ROOK]: "♖",
    [ChessPieceType.BISHOP]: "♗",
    [ChessPieceType.KNIGHT]: "♘",
    [ChessPieceType.PAWN]: "♙",
  },
  [ChessPieceColor.BLACK]: {
    [ChessPieceType.KING]: "♚",
    [ChessPieceType.QUEEN]: "♛",
    [ChessPieceType.ROOK]: "♜",
    [ChessPieceType.BISHOP]: "♝",
    [ChessPieceType.KNIGHT]: "♞",
    [ChessPieceType.PAWN]: "♟",
  },
};
