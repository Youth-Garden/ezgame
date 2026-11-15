import { describe, it, expect } from "bun:test";
import { BOARD_SIZE, createEmptyBoard, checkWin } from "./check-win";
import { CaroPlayer, GameWinner } from "../types";

describe("Caro (Gomoku) - checkWin Unit Tests", () => {
  it("should create an empty 15x15 board", () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(BOARD_SIZE);
    expect(board[0].length).toBe(BOARD_SIZE);
    expect(board[0][0]).toBeNull();
  });

  it("should detect horizontal 5-in-a-row victory for Player X", () => {
    const board = createEmptyBoard();
    const row = 7;
    // Place 4 pieces: (7, 2), (7, 3), (7, 4), (7, 5)
    for (let c = 2; c <= 5; c++) {
      board[row][c] = CaroPlayer.X;
    }
    // Final move at (7, 6)
    board[row][6] = CaroPlayer.X;

    const result = checkWin(board, row, 6, CaroPlayer.X, 5);
    expect(result.winner).toBe(GameWinner.X);
    expect(result.winningLine).toBeDefined();
    expect(result.winningLine?.length).toBe(5);
  });

  it("should detect vertical 5-in-a-row victory for Player O", () => {
    const board = createEmptyBoard();
    const col = 10;
    // Place 4 pieces vertically: (3, 10), (4, 10), (5, 10), (6, 10)
    for (let r = 3; r <= 6; r++) {
      board[r][col] = CaroPlayer.O;
    }
    // 5th piece at (7, 10)
    board[7][col] = CaroPlayer.O;

    const result = checkWin(board, 7, col, CaroPlayer.O, 5);
    expect(result.winner).toBe(GameWinner.O);
    expect(result.winningLine?.length).toBe(5);
  });

  it("should detect main diagonal (\\) 5-in-a-row victory", () => {
    const board = createEmptyBoard();
    for (let i = 0; i < 4; i++) {
      board[i][i] = CaroPlayer.X;
    }
    board[4][4] = CaroPlayer.X;

    const result = checkWin(board, 4, 4, CaroPlayer.X, 5);
    expect(result.winner).toBe(GameWinner.X);
    expect(result.winningLine?.length).toBe(5);
  });

  it("should detect anti-diagonal (/) 5-in-a-row victory", () => {
    const board = createEmptyBoard();
    // (4, 0), (3, 1), (2, 2), (1, 3), (0, 4)
    board[4][0] = CaroPlayer.O;
    board[3][1] = CaroPlayer.O;
    board[2][2] = CaroPlayer.O;
    board[1][3] = CaroPlayer.O;
    board[0][4] = CaroPlayer.O;

    const result = checkWin(board, 0, 4, CaroPlayer.O, 5);
    expect(result.winner).toBe(GameWinner.O);
    expect(result.winningLine?.length).toBe(5);
  });

  it("should return null winner when line is broken or fewer than 5", () => {
    const board = createEmptyBoard();
    board[5][1] = CaroPlayer.X;
    board[5][2] = CaroPlayer.X;
    board[5][3] = CaroPlayer.O; // Blocked by opponent
    board[5][4] = CaroPlayer.X;
    board[5][5] = CaroPlayer.X;

    const result = checkWin(board, 5, 5, CaroPlayer.X, 5);
    expect(result.winner).toBeNull();
    expect(result.winningLine).toBeNull();
  });

  it("should declare a Draw when board is completely filled without winner", () => {
    const board = createEmptyBoard();
    // 15 * 15 = 225 moves
    const result = checkWin(board, 0, 0, CaroPlayer.X, 225);
    expect(result.winner).toBe(GameWinner.DRAW);
  });
});
