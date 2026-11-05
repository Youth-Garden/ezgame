import { CaroPlayer, GameWinner, type BoardState, type WinningLine } from "../types";

export const BOARD_SIZE = 15;

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

interface WinCheckResult {
  winner: GameWinner | null;
  winningLine: WinningLine | null;
}

const DIRECTIONS: [number, number][][] = [
  // Horizontal [dx, dy]
  [[0, 1], [0, -1]],
  // Vertical
  [[1, 0], [-1, 0]],
  // Main diagonal (\)
  [[1, 1], [-1, -1]],
  // Anti-diagonal (/)
  [[1, -1], [-1, 1]],
];

/**
 * Checks if the move at (row, col) creates a winning 5-in-a-row line.
 * Time complexity: O(1) (checks at most 9 cells per direction, 36 cells total)
 */
export function checkWin(
  board: BoardState,
  row: number,
  col: number,
  player: CaroPlayer,
  moveCount: number
): WinCheckResult {
  for (const [dir1, dir2] of DIRECTIONS) {
    const lineCoords: [number, number][] = [[row, col]];

    // Scan direction 1
    let r = row + dir1[0];
    let c = col + dir1[1];
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === player
    ) {
      lineCoords.push([r, c]);
      r += dir1[0];
      c += dir1[1];
    }

    // Scan direction 2
    r = row + dir2[0];
    c = col + dir2[1];
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === player
    ) {
      lineCoords.push([r, c]);
      r += dir2[0];
      c += dir2[1];
    }

    // 5 or more consecutive pieces
    if (lineCoords.length >= 5) {
      return {
        winner: player === CaroPlayer.X ? GameWinner.X : GameWinner.O,
        winningLine: lineCoords,
      };
    }
  }

  // Check for Draw (board completely filled)
  if (moveCount >= BOARD_SIZE * BOARD_SIZE) {
    return {
      winner: GameWinner.DRAW,
      winningLine: null,
    };
  }

  return {
    winner: null,
    winningLine: null,
  };
}
