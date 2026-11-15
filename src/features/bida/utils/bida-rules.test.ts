import { describe, it, expect } from "bun:test";
import { evaluate8BallShot } from "./bida-rules";
import { BidaBall, BidaBallType } from "../types";
import { PlayerRole } from "@/shared/types/room";
import { GameWinner } from "@/features/caro/types";

function createMockBalls(): BidaBall[] {
  const balls: BidaBall[] = [];
  // Cue ball
  balls.push({ id: 0, x: 200, y: 300, isPocketed: false, type: BidaBallType.CUE_BALL });
  // Solids 1-7
  for (let i = 1; i <= 7; i++) {
    balls.push({ id: i, x: 400 + i * 20, y: 300, isPocketed: false, type: BidaBallType.SOLIDS });
  }
  // 8-ball
  balls.push({ id: 8, x: 600, y: 300, isPocketed: false, type: BidaBallType.EIGHT_BALL });
  // Stripes 9-15
  for (let i = 9; i <= 15; i++) {
    balls.push({ id: i, x: 700 + (i - 8) * 20, y: 300, isPocketed: false, type: BidaBallType.STRIPES });
  }
  return balls;
}

describe("Bida (8-Ball Pool) - evaluate8BallShot Unit Tests", () => {
  it("Scenario 1: Cue ball scratch -> Foul and switch turn", () => {
    const balls = createMockBalls();
    const result = evaluate8BallShot({
      isBreakShot: false,
      activePlayer: PlayerRole.X,
      assignedGroups: { [PlayerRole.X]: BidaBallType.SOLIDS, [PlayerRole.O]: BidaBallType.STRIPES },
      currentBalls: balls,
      stepResult: {
        pocketedIds: [0], // Cue ball scratched
        firstContactBallId: 1,
        totalCollisions: 3,
        cueBallFinalPosition: { x: 0, y: 0 },
      },
    });

    expect(result.foulMessage).toContain("scratched");
    expect(result.nextTurn).toBe(PlayerRole.O);
    expect(result.winner).toBeNull();
  });

  it("Scenario 2: Making a valid solid ball on Open Table assigns group and retains turn", () => {
    const balls = createMockBalls();
    const result = evaluate8BallShot({
      isBreakShot: false,
      activePlayer: PlayerRole.X,
      assignedGroups: { [PlayerRole.X]: null, [PlayerRole.O]: null }, // Open table
      currentBalls: balls,
      stepResult: {
        pocketedIds: [3], // Pocketed solid ball 3
        firstContactBallId: 3,
        totalCollisions: 2,
        cueBallFinalPosition: { x: 250, y: 300 },
      },
    });

    expect(result.foulMessage).toBeNull();
    expect(result.assignedGroups[PlayerRole.X]).toBe(BidaBallType.SOLIDS);
    expect(result.assignedGroups[PlayerRole.O]).toBe(BidaBallType.STRIPES);
    expect(result.nextTurn).toBe(PlayerRole.X); // Keeps turn
    expect(result.winner).toBeNull();
  });

  it("Scenario 3: Prematurely pocketing 8-ball when solids remain -> Immediate Loss", () => {
    const balls = createMockBalls();
    // Player X still has solids on the table
    const result = evaluate8BallShot({
      isBreakShot: false,
      activePlayer: PlayerRole.X,
      assignedGroups: { [PlayerRole.X]: BidaBallType.SOLIDS, [PlayerRole.O]: BidaBallType.STRIPES },
      currentBalls: balls,
      stepResult: {
        pocketedIds: [8], // 8-ball made early
        firstContactBallId: 8,
        totalCollisions: 1,
        cueBallFinalPosition: { x: 400, y: 300 },
      },
    });

    // Player X loses, Player O wins
    expect(result.winner).toBe(GameWinner.O);
    expect(result.foulMessage).toContain("before clearing all object balls");
  });

  it("Scenario 4: Pocketing 8-ball after clearing all balls without scratch -> Victory", () => {
    const balls = createMockBalls();
    // Mark all solids (1-7) as already pocketed
    balls.forEach((b) => {
      if (b.type === BidaBallType.SOLIDS) {
        b.isPocketed = true;
      }
    });

    const result = evaluate8BallShot({
      isBreakShot: false,
      activePlayer: PlayerRole.X,
      assignedGroups: { [PlayerRole.X]: BidaBallType.SOLIDS, [PlayerRole.O]: BidaBallType.STRIPES },
      currentBalls: balls,
      stepResult: {
        pocketedIds: [8], // 8-ball made legally
        firstContactBallId: 8,
        totalCollisions: 1,
        cueBallFinalPosition: { x: 400, y: 300 },
      },
    });

    // Player X wins
    expect(result.winner).toBe(GameWinner.X);
    expect(result.foulMessage).toBeNull();
  });
});
