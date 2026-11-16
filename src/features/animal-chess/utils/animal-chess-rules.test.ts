import { expect, test, describe } from "bun:test";
import {
  canCapture,
  isRiver,
  isTrap,
  isDen,
  getValidMoves,
  createInitialAnimalBoard,
  BOARD_ROWS,
  BOARD_COLS,
} from "./animal-chess-rules";
import { AnimalColor, AnimalType } from "../types";

describe("Animal Chess Pure Engine Tests", () => {
  test("Board dimensions should strictly be 9 rows by 7 columns", () => {
    const board = createInitialAnimalBoard();
    expect(board.length).toBe(BOARD_ROWS);
    expect(board[0].length).toBe(BOARD_COLS);
  });

  test("Terrain coordinates: River identification", () => {
    expect(isRiver(3, 1)).toBe(true);
    expect(isRiver(4, 2)).toBe(true);
    expect(isRiver(5, 5)).toBe(true);
    expect(isRiver(2, 2)).toBe(false); // Land above river
    expect(isRiver(4, 3)).toBe(false); // Land bank between two river streams
  });

  test("Terrain coordinates: Dens and Traps", () => {
    expect(isDen(0, 3).isDen).toBe(true);
    expect(isDen(0, 3).owner).toBe(AnimalColor.BLUE);

    expect(isDen(8, 3).isDen).toBe(true);
    expect(isDen(8, 3).owner).toBe(AnimalColor.RED);

    expect(isTrap(0, 2).isTrap).toBe(true);
    expect(isTrap(7, 3).isTrap).toBe(true);
  });

  test("Combat rule: Rat captures Elephant on land", () => {
    const rat = { id: "b_rat", type: AnimalType.RAT, color: AnimalColor.BLUE };
    const elephant = { id: "r_elephant", type: AnimalType.ELEPHANT, color: AnimalColor.RED };
    expect(canCapture(rat, 2, 0, elephant, 6, 0)).toBe(true);
  });

  test("Combat rule: Elephant cannot capture Rat", () => {
    const elephant = { id: "b_elephant", type: AnimalType.ELEPHANT, color: AnimalColor.BLUE };
    const rat = { id: "r_rat", type: AnimalType.RAT, color: AnimalColor.RED };
    expect(canCapture(elephant, 2, 6, rat, 6, 6)).toBe(false);
  });

  test("Combat rule: Rat in river cannot capture Elephant on land", () => {
    const ratInRiver = { id: "b_rat", type: AnimalType.RAT, color: AnimalColor.BLUE };
    const elephantOnLand = { id: "r_elephant", type: AnimalType.ELEPHANT, color: AnimalColor.RED };
    expect(canCapture(ratInRiver, 3, 1, elephantOnLand, 3, 0)).toBe(false);
  });

  test("Combat rule: Animals trapped in enemy trap can be captured by any enemy piece", () => {
    const enemyRat = { id: "b_rat", type: AnimalType.RAT, color: AnimalColor.BLUE };
    const trappedElephant = { id: "r_elephant", type: AnimalType.ELEPHANT, color: AnimalColor.RED };
    // Defender standing in Blue trap at (0, 2)
    expect(canCapture(enemyRat, 0, 1, trappedElephant, 0, 2)).toBe(true);
  });

  test("Movement rule: Pieces cannot enter their own Den", () => {
    const board = createInitialAnimalBoard();
    // Blue pieces around Blue Den (0, 3)
    const moves = getValidMoves(board, 0, 0); // Blue Lion at (0, 0)
    expect(moves.some((m) => m.row === 0 && m.col === 3)).toBe(false);
  });
});
