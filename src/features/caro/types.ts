export enum CaroPlayer {
  X = "X",
  O = "O",
}

export enum GameWinner {
  X = "X",
  O = "O",
  DRAW = "DRAW",
}

export type CellValue = CaroPlayer | null;

export type BoardState = CellValue[][];

export type WinningLine = [number, number][];

export interface CaroGameState {
  board: BoardState;
  currentTurn: CaroPlayer;
  lastMove: [number, number] | null;
  winner: GameWinner | null;
  winningLine: WinningLine | null;
  moveCount: number;
}
