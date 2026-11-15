import { describe, it, expect } from "bun:test";
import {
  BOARD_ROWS,
  BOARD_COLS,
  isGeneralInCheck,
  hasAnyLegalMoves,
  applyMoveToBoard,
  getLegalMovesForPosition,
  getPseudoLegalMoves,
  areGeneralsFacing,
  createInitialXiangqiBoard,
} from "./xiangqi-rules";
import {
  XiangqiBoardState,
  XiangqiColor,
  XiangqiPieceType,
  XiangqiMove,
} from "../types";

function createBlankBoard(): XiangqiBoardState {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => null)
  );
}

describe("Xiangqi Rules - Piece Movement & Obstacle Rules", () => {
  it("Horse (Mã): valid L-moves and blocked by horse foot (cản chân mã)", () => {
    const board = createBlankBoard();
    // Red Horse at (7, 4)
    board[7][4] = { id: "r_h", type: XiangqiPieceType.HORSE, color: XiangqiColor.RED };

    // Without obstacle: 8 legal destinations
    let moves = getPseudoLegalMoves(board, { row: 7, col: 4 });
    expect(moves.length).toBe(8);

    // Place an obstacle at (6, 4) (blocking forward jump to (5, 3) and (5, 5))
    board[6][4] = { id: "r_p", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
    moves = getPseudoLegalMoves(board, { row: 7, col: 4 });
    expect(moves.length).toBe(6);
    expect(moves.some((m) => m.row === 5 && m.col === 3)).toBe(false);
    expect(moves.some((m) => m.row === 5 && m.col === 5)).toBe(false);
  });

  it("Elephant (Tượng): 2 diagonal steps, blocked by elephant eye (chặn mắt tượng), cannot cross river", () => {
    const board = createBlankBoard();
    // Red Elephant at (9, 2)
    board[9][2] = { id: "r_e", type: XiangqiPieceType.ELEPHANT, color: XiangqiColor.RED };

    let moves = getPseudoLegalMoves(board, { row: 9, col: 2 });
    // From (9, 2), normal moves are (7, 0) and (7, 4)
    expect(moves.length).toBe(2);

    // Block the eye towards (7, 4) by placing a piece at (8, 3)
    board[8][3] = { id: "blocker", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
    moves = getPseudoLegalMoves(board, { row: 9, col: 2 });
    expect(moves.length).toBe(1);
    expect(moves[0]).toEqual({ row: 7, col: 0 });

    // Ensure Elephant at river bank (5, 2) cannot cross to row 4
    board[5][2] = { id: "r_e2", type: XiangqiPieceType.ELEPHANT, color: XiangqiColor.RED };
    const riverMoves = getPseudoLegalMoves(board, { row: 5, col: 2 });
    expect(riverMoves.every((m) => m.row >= 5)).toBe(true);
  });

  it("Cannon (Pháo): moves freely orthogonally, captures ONLY with exactly 1 intervening piece (ngòi pháo)", () => {
    const board = createBlankBoard();
    // Red Cannon at (7, 1)
    board[7][1] = { id: "r_c", type: XiangqiPieceType.CANNON, color: XiangqiColor.RED };
    // Screen (ngòi) at (4, 1)
    board[4][1] = { id: "screen", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
    // Enemy target at (1, 1)
    board[1][1] = { id: "target", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.BLACK };
    // Second enemy target at (0, 1) (behind the first target)
    board[0][1] = { id: "target2", type: XiangqiPieceType.ADVISOR, color: XiangqiColor.BLACK };

    const moves = getPseudoLegalMoves(board, { row: 7, col: 1 });
    // Can move to empty squares (6, 1) and (5, 1)
    expect(moves.some((m) => m.row === 6 && m.col === 1)).toBe(true);
    expect(moves.some((m) => m.row === 5 && m.col === 1)).toBe(true);
    // Cannot move to screen square (4, 1)
    expect(moves.some((m) => m.row === 4 && m.col === 1)).toBe(false);
    // Can capture target at (1, 1) via the screen
    expect(moves.some((m) => m.row === 1 && m.col === 1)).toBe(true);
    // CANNOT capture target2 at (0, 1) because there are 2 screens
    expect(moves.some((m) => m.row === 0 && m.col === 1)).toBe(false);
  });

  it("Advisor (Sĩ) & General (Tướng): strictly confined within 3x3 Palace", () => {
    const board = createBlankBoard();
    // Red Advisor at center of palace (8, 4)
    board[8][4] = { id: "r_a", type: XiangqiPieceType.ADVISOR, color: XiangqiColor.RED };
    const advisorMoves = getPseudoLegalMoves(board, { row: 8, col: 4 });
    // Can only move to the 4 corners of palace: (7, 3), (7, 5), (9, 3), (9, 5)
    expect(advisorMoves.length).toBe(4);

    // Red General at palace edge (9, 5)
    board[9][5] = { id: "r_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.RED };
    const generalMoves = getPseudoLegalMoves(board, { row: 9, col: 5 });
    // Cannot move right to col 6 (outside palace) or down to row 10
    expect(generalMoves.every((m) => m.col >= 3 && m.col <= 5 && m.row >= 7 && m.row <= 9)).toBe(true);
  });

  it("Soldier (Tốt / Binh): forward only before river, forward and sideways after crossing river", () => {
    const board = createBlankBoard();
    // Red Soldier before crossing river (row 6)
    board[6][4] = { id: "r_s1", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
    const beforeRiverMoves = getPseudoLegalMoves(board, { row: 6, col: 4 });
    expect(beforeRiverMoves.length).toBe(1);
    expect(beforeRiverMoves[0]).toEqual({ row: 5, col: 4 }); // only forward

    // Red Soldier after crossing river (row 4)
    board[4][4] = { id: "r_s2", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
    const afterRiverMoves = getPseudoLegalMoves(board, { row: 4, col: 4 });
    // Can go forward (3, 4), left (4, 3), right (4, 5) - cannot go backwards!
    expect(afterRiverMoves.length).toBe(3);
    expect(afterRiverMoves.some((m) => m.row === 5 && m.col === 4)).toBe(false); // No backward
  });
});

describe("Xiangqi Rules - Stalemate, Checkmate & Flying General Tests", () => {
  it("Scenario 1: Red General trapped in corner with enemy Chariot (Checkmate)", () => {
    const board = createBlankBoard();
    board[9][3] = { id: "r_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.RED };
    board[0][4] = { id: "b_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.BLACK };
    board[8][3] = { id: "b_r2", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.BLACK };

    expect(isGeneralInCheck(board, XiangqiColor.RED)).toBe(true);
  });

  it("Scenario 2: Stalemate (Hết nước đi / Vô đường cùng không bị chiếu) -> Loss in Xiangqi", () => {
    const board = createBlankBoard();
    board[9][4] = { id: "r_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.RED };
    board[8][3] = { id: "b_r1", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.BLACK };
    board[8][5] = { id: "b_r2", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.BLACK };

    expect(isGeneralInCheck(board, XiangqiColor.RED)).toBe(false);
    expect(hasAnyLegalMoves(board, XiangqiColor.RED)).toBe(false);
  });

  it("Scenario 3: Flying General Rule (Lộ mặt tướng) prevents illegal move", () => {
    const board = createBlankBoard();
    board[0][4] = { id: "b_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.BLACK };
    board[9][4] = { id: "r_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.RED };
    board[5][4] = { id: "r_c", type: XiangqiPieceType.CANNON, color: XiangqiColor.RED };

    const legalMoves = getLegalMovesForPosition(board, { row: 5, col: 4 });
    const movesOffCol4 = legalMoves.filter((m) => m.col !== 4);
    expect(movesOffCol4.length).toBe(0);
  });

  it("Scenario 4: Initial board has exactly 32 pieces and both sides have legal moves", () => {
    const initialBoard = createInitialXiangqiBoard();
    let pieceCount = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (initialBoard[r][c] !== null) pieceCount++;
      }
    }
    expect(pieceCount).toBe(32);
    expect(areGeneralsFacing(initialBoard)).toBe(false);
    expect(isGeneralInCheck(initialBoard, XiangqiColor.RED)).toBe(false);
    expect(isGeneralInCheck(initialBoard, XiangqiColor.BLACK)).toBe(false);
    expect(hasAnyLegalMoves(initialBoard, XiangqiColor.RED)).toBe(true);
    expect(hasAnyLegalMoves(initialBoard, XiangqiColor.BLACK)).toBe(true);
  });
});
