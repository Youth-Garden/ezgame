import { AnimalColor, AnimalPiece, AnimalType, TerrainType, type Position } from "../types";

export const BOARD_ROWS = 9;
export const BOARD_COLS = 7;

export const ANIMAL_RANKS: Record<AnimalType, number> = {
  [AnimalType.RAT]: 1,
  [AnimalType.CAT]: 2,
  [AnimalType.WOLF]: 3,
  [AnimalType.DOG]: 4,
  [AnimalType.LEOPARD]: 5,
  [AnimalType.TIGER]: 6,
  [AnimalType.LION]: 7,
  [AnimalType.ELEPHANT]: 8,
};

export const ANIMAL_EMOJIS: Record<AnimalType, string> = {
  [AnimalType.RAT]: "🐀",
  [AnimalType.CAT]: "🐱",
  [AnimalType.WOLF]: "🐺",
  [AnimalType.DOG]: "🐶",
  [AnimalType.LEOPARD]: "🐆",
  [AnimalType.TIGER]: "🐯",
  [AnimalType.LION]: "🦁",
  [AnimalType.ELEPHANT]: "🐘",
};

export const ANIMAL_NAMES_VI: Record<AnimalType, string> = {
  [AnimalType.RAT]: "Chuột",
  [AnimalType.CAT]: "Mèo",
  [AnimalType.WOLF]: "Sói",
  [AnimalType.DOG]: "Chó",
  [AnimalType.LEOPARD]: "Báo",
  [AnimalType.TIGER]: "Hổ",
  [AnimalType.LION]: "Sư tử",
  [AnimalType.ELEPHANT]: "Voi",
};

// Check if a cell is river
// River spans row 3, 4, 5 and cols 1, 2 and 4, 5
export function isRiver(row: number, col: number): boolean {
  return (
    (row >= 3 && row <= 5) &&
    ((col >= 1 && col <= 2) || (col >= 4 && col <= 5))
  );
}

// Trap cells:
// Top (Blue side): (0, 2), (0, 4), (1, 3)
// Bottom (Red side): (8, 2), (8, 4), (7, 3)
export function isTrap(row: number, col: number): { isTrap: boolean; owner?: AnimalColor } {
  if ((row === 0 && (col === 2 || col === 4)) || (row === 1 && col === 3)) {
    return { isTrap: true, owner: AnimalColor.BLUE };
  }
  if ((row === 8 && (col === 2 || col === 4)) || (row === 7 && col === 3)) {
    return { isTrap: true, owner: AnimalColor.RED };
  }
  return { isTrap: false };
}

// Dens:
// Blue Den: (0, 3)
// Red Den: (8, 3)
export function isDen(row: number, col: number): { isDen: boolean; owner?: AnimalColor } {
  if (row === 0 && col === 3) return { isDen: true, owner: AnimalColor.BLUE };
  if (row === 8 && col === 3) return { isDen: true, owner: AnimalColor.RED };
  return { isDen: false };
}

export function getTerrainType(row: number, col: number): TerrainType {
  if (isRiver(row, col)) return TerrainType.RIVER;
  if (isTrap(row, col).isTrap) return TerrainType.TRAP;
  if (isDen(row, col).isDen) return TerrainType.DEN;
  return TerrainType.LAND;
}

// Initialize standard starting board
export function createInitialAnimalBoard(): (AnimalPiece | null)[][] {
  const board: (AnimalPiece | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null)
  );

  // Helper to place piece
  const place = (row: number, col: number, type: AnimalType, color: AnimalColor) => {
    board[row][col] = {
      id: `${color}_${type}`,
      type,
      color,
    };
  };

  // Top (Blue):
  // Row 0: Lion at (0,0), Tiger at (0,6)
  place(0, 0, AnimalType.LION, AnimalColor.BLUE);
  place(0, 6, AnimalType.TIGER, AnimalColor.BLUE);
  // Row 1: Dog at (1,1), Cat at (1,5)
  place(1, 1, AnimalType.DOG, AnimalColor.BLUE);
  place(1, 5, AnimalType.CAT, AnimalColor.BLUE);
  // Row 2: Rat at (2,0), Leopard at (2,2), Wolf at (2,4), Elephant at (2,6)
  place(2, 0, AnimalType.RAT, AnimalColor.BLUE);
  place(2, 2, AnimalType.LEOPARD, AnimalColor.BLUE);
  place(2, 4, AnimalType.WOLF, AnimalColor.BLUE);
  place(2, 6, AnimalType.ELEPHANT, AnimalColor.BLUE);

  // Bottom (Red):
  // Row 8: Tiger at (8,0), Lion at (8,6)
  place(8, 0, AnimalType.TIGER, AnimalColor.RED);
  place(8, 6, AnimalType.LION, AnimalColor.RED);
  // Row 7: Cat at (7,1), Dog at (7,5)
  place(7, 1, AnimalType.CAT, AnimalColor.RED);
  place(7, 5, AnimalType.DOG, AnimalColor.RED);
  // Row 6: Elephant at (6,0), Wolf at (6,2), Leopard at (6,4), Rat at (6,6)
  place(6, 0, AnimalType.ELEPHANT, AnimalColor.RED);
  place(6, 2, AnimalType.WOLF, AnimalColor.RED);
  place(6, 4, AnimalType.LEOPARD, AnimalColor.RED);
  place(6, 6, AnimalType.RAT, AnimalColor.RED);

  return board;
}

// Can piece A capture piece B at position (targetRow, targetCol)?
export function canCapture(
  attacker: AnimalPiece,
  fromRow: number,
  fromCol: number,
  defender: AnimalPiece,
  toRow: number,
  toCol: number
): boolean {
  if (attacker.color === defender.color) return false;

  const targetTrap = isTrap(toRow, toCol);
  // If defender is standing in attacker's trap, defender's rank becomes 0!
  if (targetTrap.isTrap && targetTrap.owner === attacker.color) {
    return true;
  }

  // Rat vs Elephant special rules:
  // Rat can capture Elephant, unless Rat is coming out of water to attack Elephant on land
  const attackerInRiver = isRiver(fromRow, fromCol);
  const defenderInRiver = isRiver(toRow, toCol);

  if (attacker.type === AnimalType.RAT && defender.type === AnimalType.ELEPHANT) {
    return !attackerInRiver; // Rat in water cannot attack land Elephant
  }

  // Elephant cannot capture Rat
  if (attacker.type === AnimalType.ELEPHANT && defender.type === AnimalType.RAT) {
    return false;
  }

  // If attacker is in river and defender is on land, cannot capture
  if (attackerInRiver && !defenderInRiver) {
    return false;
  }

  // If attacker is on land and defender is in river, cannot capture
  if (!attackerInRiver && defenderInRiver) {
    return false;
  }

  // General rank comparison: higher or equal rank captures lower rank
  return ANIMAL_RANKS[attacker.type] >= ANIMAL_RANKS[defender.type];
}

// Calculate all valid moves for a piece at (row, col)
export function getValidMoves(
  board: (AnimalPiece | null)[][],
  row: number,
  col: number
): Position[] {
  const piece = board[row][col];
  if (!piece) return [];

  const validMoves: Position[] = [];
  const directions = [
    { dr: -1, dc: 0 }, // Up
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
  ];

  for (const { dr, dc } of directions) {
    const nextRow = row + dr;
    const nextCol = col + dc;

    // Check bounds
    if (nextRow < 0 || nextRow >= BOARD_ROWS || nextCol < 0 || nextCol >= BOARD_COLS) {
      continue;
    }

    // A piece cannot enter its OWN Den!
    const denInfo = isDen(nextRow, nextCol);
    if (denInfo.isDen && denInfo.owner === piece.color) {
      continue;
    }

    // River interaction
    if (isRiver(nextRow, nextCol)) {
      // 1. Rat can step into river
      if (piece.type === AnimalType.RAT) {
        const destPiece = board[nextRow][nextCol];
        if (!destPiece || canCapture(piece, row, col, destPiece, nextRow, nextCol)) {
          validMoves.push({ row: nextRow, col: nextCol });
        }
      }

      // 2. Lion and Tiger can jump across river horizontally or vertically!
      if (piece.type === AnimalType.LION || piece.type === AnimalType.TIGER) {
        let jumpRow = nextRow;
        let jumpCol = nextCol;
        let blockedByRatInRiver = false;

        while (isRiver(jumpRow, jumpCol)) {
          // If any Rat (friend or foe) is in the water between the jump path, the jump is blocked!
          if (board[jumpRow][jumpCol]?.type === AnimalType.RAT) {
            blockedByRatInRiver = true;
            break;
          }
          jumpRow += dr;
          jumpCol += dc;
        }

        if (!blockedByRatInRiver) {
          // Landing cell on opposite bank
          const landingPiece = board[jumpRow][jumpCol];
          if (!landingPiece || canCapture(piece, row, col, landingPiece, jumpRow, jumpCol)) {
            validMoves.push({ row: jumpRow, col: jumpCol });
          }
        }
      }

      // Other animals cannot enter river
      continue;
    }

    // Regular land step
    const destPiece = board[nextRow][nextCol];
    if (!destPiece) {
      validMoves.push({ row: nextRow, col: nextCol });
    } else if (canCapture(piece, row, col, destPiece, nextRow, nextCol)) {
      validMoves.push({ row: nextRow, col: nextCol });
    }
  }

  return validMoves;
}
