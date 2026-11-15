import {
  XiangqiBoardState,
  XiangqiColor,
  XiangqiMove,
  XiangqiPiece,
  XiangqiPieceType,
  XiangqiPosition,
} from "../types";

export const BOARD_ROWS = 10;
export const BOARD_COLS = 9;

/**
 * Creates the official standard initial Xiangqi board layout (9 cols x 10 rows)
 * Row 0: Black back rank
 * Row 9: Red back rank
 */
export function createInitialXiangqiBoard(): XiangqiBoardState {
  const board: XiangqiBoardState = Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => null)
  );

  // Black pieces (Row 0 to 3)
  board[0][0] = { id: "b_r1", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.BLACK };
  board[0][1] = { id: "b_h1", type: XiangqiPieceType.HORSE, color: XiangqiColor.BLACK };
  board[0][2] = { id: "b_e1", type: XiangqiPieceType.ELEPHANT, color: XiangqiColor.BLACK };
  board[0][3] = { id: "b_a1", type: XiangqiPieceType.ADVISOR, color: XiangqiColor.BLACK };
  board[0][4] = { id: "b_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.BLACK };
  board[0][5] = { id: "b_a2", type: XiangqiPieceType.ADVISOR, color: XiangqiColor.BLACK };
  board[0][6] = { id: "b_e2", type: XiangqiPieceType.ELEPHANT, color: XiangqiColor.BLACK };
  board[0][7] = { id: "b_h2", type: XiangqiPieceType.HORSE, color: XiangqiColor.BLACK };
  board[0][8] = { id: "b_r2", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.BLACK };

  board[2][1] = { id: "b_c1", type: XiangqiPieceType.CANNON, color: XiangqiColor.BLACK };
  board[2][7] = { id: "b_c2", type: XiangqiPieceType.CANNON, color: XiangqiColor.BLACK };

  board[3][0] = { id: "b_s1", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.BLACK };
  board[3][2] = { id: "b_s2", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.BLACK };
  board[3][4] = { id: "b_s3", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.BLACK };
  board[3][6] = { id: "b_s4", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.BLACK };
  board[3][8] = { id: "b_s5", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.BLACK };

  // Red pieces (Row 6 to 9)
  board[6][0] = { id: "r_s1", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
  board[6][2] = { id: "r_s2", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
  board[6][4] = { id: "r_s3", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
  board[6][6] = { id: "r_s4", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };
  board[6][8] = { id: "r_s5", type: XiangqiPieceType.SOLDIER, color: XiangqiColor.RED };

  board[7][1] = { id: "r_c1", type: XiangqiPieceType.CANNON, color: XiangqiColor.RED };
  board[7][7] = { id: "r_c2", type: XiangqiPieceType.CANNON, color: XiangqiColor.RED };

  board[9][0] = { id: "r_r1", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.RED };
  board[9][1] = { id: "r_h1", type: XiangqiPieceType.HORSE, color: XiangqiColor.RED };
  board[9][2] = { id: "r_e1", type: XiangqiPieceType.ELEPHANT, color: XiangqiColor.RED };
  board[9][3] = { id: "r_a1", type: XiangqiPieceType.ADVISOR, color: XiangqiColor.RED };
  board[9][4] = { id: "r_g", type: XiangqiPieceType.GENERAL, color: XiangqiColor.RED };
  board[9][5] = { id: "r_a2", type: XiangqiPieceType.ADVISOR, color: XiangqiColor.RED };
  board[9][6] = { id: "r_e2", type: XiangqiPieceType.ELEPHANT, color: XiangqiColor.RED };
  board[9][7] = { id: "r_h2", type: XiangqiPieceType.HORSE, color: XiangqiColor.RED };
  board[9][8] = { id: "r_r2", type: XiangqiPieceType.CHARIOT, color: XiangqiColor.RED };

  return board;
}

export function isInsidePalace(row: number, col: number, color: XiangqiColor): boolean {
  if (col < 3 || col > 5) return false;
  if (color === XiangqiColor.BLACK) {
    return row >= 0 && row <= 2;
  }
  return row >= 7 && row <= 9;
}

export function isWithinBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

/**
 * Checks if Generals are facing each other with no intervening pieces (Flying General Rule)
 */
export function areGeneralsFacing(board: XiangqiBoardState): boolean {
  let redGeneralPos: XiangqiPosition | null = null;
  let blackGeneralPos: XiangqiPosition | null = null;

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece?.type === XiangqiPieceType.GENERAL) {
        if (piece.color === XiangqiColor.RED) {
          redGeneralPos = { row: r, col: c };
        } else {
          blackGeneralPos = { row: r, col: c };
        }
      }
    }
  }

  if (!redGeneralPos || !blackGeneralPos) return false;
  if (redGeneralPos.col !== blackGeneralPos.col) return false;

  const col = redGeneralPos.col;
  const startRow = Math.min(redGeneralPos.row, blackGeneralPos.row) + 1;
  const endRow = Math.max(redGeneralPos.row, blackGeneralPos.row);

  for (let r = startRow; r < endRow; r++) {
    if (board[r][col] !== null) {
      return false; // Intervening piece found
    }
  }

  return true; // Flying general facing illegally!
}

/**
 * Calculates raw pseudo-legal moves for a piece at (row, col) without considering self-check
 */
export function getPseudoLegalMoves(
  board: XiangqiBoardState,
  from: XiangqiPosition
): XiangqiPosition[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: XiangqiPosition[] = [];
  const { row, col } = from;
  const color = piece.color;

  const addMoveIfValid = (targetRow: number, targetCol: number) => {
    if (!isWithinBoard(targetRow, targetCol)) return;
    const targetPiece = board[targetRow][targetCol];
    if (targetPiece && targetPiece.color === color) return;
    moves.push({ row: targetRow, col: targetCol });
  };

  switch (piece.type) {
    case XiangqiPieceType.GENERAL: {
      const deltas = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      deltas.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (isInsidePalace(nr, nc, color)) {
          addMoveIfValid(nr, nc);
        }
      });
      break;
    }

    case XiangqiPieceType.ADVISOR: {
      const deltas = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
      deltas.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (isInsidePalace(nr, nc, color)) {
          addMoveIfValid(nr, nc);
        }
      });
      break;
    }

    case XiangqiPieceType.ELEPHANT: {
      // Moves exactly 2 steps diagonally, cannot cross river, blocked by eye
      const deltas = [
        { dr: -2, dc: -2, eyeR: -1, eyeC: -1 },
        { dr: -2, dc: 2, eyeR: -1, eyeC: 1 },
        { dr: 2, dc: -2, eyeR: 1, eyeC: -1 },
        { dr: 2, dc: 2, eyeR: 1, eyeC: 1 },
      ];
      deltas.forEach(({ dr, dc, eyeR, eyeC }) => {
        const nr = row + dr;
        const nc = col + dc;
        if (!isWithinBoard(nr, nc)) return;

        // Elephant cannot cross the river
        if (color === XiangqiColor.RED && nr < 5) return;
        if (color === XiangqiColor.BLACK && nr > 4) return;

        // Check elephant's eye (block point)
        if (board[row + eyeR][col + eyeC] !== null) return;

        addMoveIfValid(nr, nc);
      });
      break;
    }

    case XiangqiPieceType.HORSE: {
      // Moves 1 step orthogonally then 1 step diagonally, blocked by horse foot
      const deltas = [
        { dr: -2, dc: -1, footR: -1, footC: 0 },
        { dr: -2, dc: 1, footR: -1, footC: 0 },
        { dr: 2, dc: -1, footR: 1, footC: 0 },
        { dr: 2, dc: 1, footR: 1, footC: 0 },
        { dr: -1, dc: -2, footR: 0, footC: -1 },
        { dr: 1, dc: -2, footR: 0, footC: -1 },
        { dr: -1, dc: 2, footR: 0, footC: 1 },
        { dr: 1, dc: 2, footR: 0, footC: 1 },
      ];
      deltas.forEach(({ dr, dc, footR, footC }) => {
        const nr = row + dr;
        const nc = col + dc;
        if (!isWithinBoard(nr, nc)) return;
        // Check horse hobble / foot
        if (board[row + footR][col + footC] !== null) return;
        addMoveIfValid(nr, nc);
      });
      break;
    }

    case XiangqiPieceType.CHARIOT: {
      // Moves horizontally or vertically without distance limit
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (!isWithinBoard(nr, nc)) break;

          const target = board[nr][nc];
          if (target === null) {
            moves.push({ row: nr, col: nc });
          } else {
            if (target.color !== color) {
              moves.push({ row: nr, col: nc });
            }
            break; // Blocked by any piece
          }
          step++;
        }
      });
      break;
    }

    case XiangqiPieceType.CANNON: {
      // Moves like chariot, but captures only by jumping over exactly 1 piece (the mount/screen)
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        let screenFound = false;

        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (!isWithinBoard(nr, nc)) break;

          const target = board[nr][nc];
          if (!screenFound) {
            if (target === null) {
              moves.push({ row: nr, col: nc }); // Non-capture move
            } else {
              screenFound = true; // Found the jumping screen
            }
          } else {
            if (target !== null) {
              if (target.color !== color) {
                moves.push({ row: nr, col: nc }); // Capture!
              }
              break; // Cannot jump over a second piece
            }
          }
          step++;
        }
      });
      break;
    }

    case XiangqiPieceType.SOLDIER: {
      const isCrossRiver = color === XiangqiColor.RED ? row <= 4 : row >= 5;
      const forwardDir = color === XiangqiColor.RED ? -1 : 1;

      // Always can move forward
      const fRow = row + forwardDir;
      if (isWithinBoard(fRow, col)) {
        addMoveIfValid(fRow, col);
      }

      // If crossed river, can also move left and right
      if (isCrossRiver) {
        if (isWithinBoard(row, col - 1)) addMoveIfValid(row, col - 1);
        if (isWithinBoard(row, col + 1)) addMoveIfValid(row, col + 1);
      }
      break;
    }
  }

  return moves;
}

/**
 * Checks if the king/general of `color` is under attack (in check)
 */
export function isGeneralInCheck(board: XiangqiBoardState, color: XiangqiColor): boolean {
  if (areGeneralsFacing(board)) {
    return true; // Flying generals is illegal check
  }

  // Find general position
  let generalPos: XiangqiPosition | null = null;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece?.type === XiangqiPieceType.GENERAL && piece.color === color) {
        generalPos = { row: r, col: c };
        break;
      }
    }
    if (generalPos) break;
  }

  if (!generalPos) return true; // General missing means checkmate/lost

  const opponentColor = color === XiangqiColor.RED ? XiangqiColor.BLACK : XiangqiColor.RED;

  // Check if any opponent piece can hit the general
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        const rawMoves = getPseudoLegalMoves(board, { row: r, col: c });
        if (rawMoves.some((m) => m.row === generalPos!.row && m.col === generalPos!.col)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Clones board and applies a move
 */
export function applyMoveToBoard(board: XiangqiBoardState, move: XiangqiMove): XiangqiBoardState {
  const nextBoard: XiangqiBoardState = board.map((row) => [...row]);
  nextBoard[move.to.row][move.to.col] = move.piece;
  nextBoard[move.from.row][move.from.col] = null;
  return nextBoard;
}

/**
 * Returns all fully legal moves for piece at (row, col) (eliminates moves leaving own general in check)
 */
export function getLegalMovesForPosition(
  board: XiangqiBoardState,
  from: XiangqiPosition
): XiangqiPosition[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, from);

  return pseudoMoves.filter((targetPos) => {
    const testMove: XiangqiMove = {
      from,
      to: targetPos,
      piece,
      captured: board[targetPos.row][targetPos.col],
    };
    const simulatedBoard = applyMoveToBoard(board, testMove);
    return !isGeneralInCheck(simulatedBoard, piece.color);
  });
}

/**
 * Checks if the player of `color` has any legal moves left. If none, it is checkmate or stalemate (both loss in Xiangqi).
 */
export function hasAnyLegalMoves(board: XiangqiBoardState, color: XiangqiColor): boolean {
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const legalMoves = getLegalMovesForPosition(board, { row: r, col: c });
        if (legalMoves.length > 0) return true;
      }
    }
  }
  return false;
}
