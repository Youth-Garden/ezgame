import { PlayerRole } from "@/shared/types/room";
import { GameWinner } from "@/features/caro/types";
import { BidaBall, BidaBallType } from "../types";
import { respotEightBall, respawnCueBall, type SimulationStepResult } from "./bida-simulation";

export interface ShotSettledResult {
  settledBalls: BidaBall[];
  nextTurn: PlayerRole.X | PlayerRole.O;
  foulMessage: string | null;
  winner: GameWinner | null;
  assignedGroups: {
    [PlayerRole.X]: BidaBallType | null;
    [PlayerRole.O]: BidaBallType | null;
  };
}

export function evaluate8BallShot(params: {
  isBreakShot: boolean;
  activePlayer: PlayerRole.X | PlayerRole.O;
  assignedGroups: {
    [PlayerRole.X]: BidaBallType | null;
    [PlayerRole.O]: BidaBallType | null;
  };
  stepResult: SimulationStepResult;
  currentBalls: BidaBall[];
}): ShotSettledResult {
  const { isBreakShot, activePlayer, assignedGroups, stepResult, currentBalls } = params;
  const pocketedIds = stepResult.pocketedIds;
  const firstContact = stepResult.firstContactBallId;

  let settledBalls = currentBalls;
  let foulMessage: string | null = null;
  let shouldSwitchTurn = true;
  let winner: GameWinner | null = null;

  const opponentRole = activePlayer === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
  const cueScratch = pocketedIds.includes(0);
  const eightBallPocketed = pocketedIds.includes(8);

  const myGroup = assignedGroups[activePlayer];
  const isTableOpen = myGroup === null;

  // 1. Cue Ball Scratch
  if (cueScratch) {
    foulMessage = "Foul: Cue ball scratched!";
    settledBalls = respawnCueBall(settledBalls);
  }

  // 2. Break Shot Special Logic (Miniclip 8-Ball Pool)
  if (isBreakShot) {
    if (eightBallPocketed) {
      if (cueScratch) {
        // Scratch + 8-ball on break = Loss in standard competitive pool
        winner = activePlayer === PlayerRole.X ? GameWinner.O : GameWinner.X;
        foulMessage = "Foul: Pocketed 8-ball and scratched on break!";
      } else {
        // Respot 8-ball without loss, continue if other balls were made
        settledBalls = respotEightBall(settledBalls);
        const otherPocketed = pocketedIds.filter((id) => id !== 0 && id !== 8);
        if (otherPocketed.length > 0) {
          shouldSwitchTurn = false;
        }
      }
    } else if (!cueScratch) {
      const targetBallsPocketed = pocketedIds.filter((id) => id >= 1 && id <= 15 && id !== 8);
      if (targetBallsPocketed.length > 0) {
        shouldSwitchTurn = false;
      }
    }

    if (shouldSwitchTurn && !winner) {
      return {
        settledBalls,
        nextTurn: opponentRole,
        foulMessage,
        winner: null,
        assignedGroups,
      };
    }

    return {
      settledBalls,
      nextTurn: shouldSwitchTurn ? opponentRole : activePlayer,
      foulMessage,
      winner,
      assignedGroups,
    };
  }

  // 3. Normal Shot: Check 8-Ball Pocketed
  if (eightBallPocketed) {
    const remainingMyTargets = isTableOpen
      ? 7
      : settledBalls.filter((b) => b.type === myGroup && !b.isPocketed).length;

    if (!isTableOpen && remainingMyTargets === 0 && !cueScratch && firstContact === 8) {
      // Clean legitimate win!
      winner = activePlayer === PlayerRole.X ? GameWinner.X : GameWinner.O;
    } else {
      // Illegal 8-ball potting (before clearing suit, or scratch, or wrong ball first) = Instant Loss
      winner = activePlayer === PlayerRole.X ? GameWinner.O : GameWinner.X;
      foulMessage = cueScratch
        ? "Foul: 8-ball pocketed with cue ball scratch! Opponent wins."
        : remainingMyTargets > 0
        ? "Foul: 8-ball pocketed before clearing all object balls! Opponent wins."
        : "Foul: Illegal contact on 8-ball! Opponent wins.";
    }

    return {
      settledBalls,
      nextTurn: opponentRole,
      foulMessage,
      winner,
      assignedGroups,
    };
  }

  // 4. Contact & Cushion Foul Checks (WPA & Miniclip standard)
  if (!cueScratch) {
    if (firstContact === null) {
      foulMessage = "Foul: Cue ball failed to hit any object ball!";
      shouldSwitchTurn = true;
    } else if (!isTableOpen) {
      const firstBall = settledBalls.find((b) => b.id === firstContact);
      if (firstBall) {
        const remainingMine = settledBalls.filter((b) => b.type === myGroup && !b.isPocketed).length;
        const legalType = remainingMine === 0 ? BidaBallType.EIGHT_BALL : myGroup;
        if (firstBall.type !== legalType) {
          foulMessage = `Foul: Hit opponent's ball (#${firstContact}) first!`;
          shouldSwitchTurn = true;
        }
      }
    } else if (firstContact === 8) {
      // On an open table, hitting 8-ball first is a foul
      foulMessage = "Foul: Cannot hit 8-ball first on an open table!";
      shouldSwitchTurn = true;
    }

    // Cushion after contact rule (if no ball pocketed and no rail reached)
    if (!foulMessage && pocketedIds.length === 0 && !stepResult.cushionHitAfterContact) {
      foulMessage = "Foul: No ball reached a cushion after contact!";
      shouldSwitchTurn = true;
    }
  }

  // 5. Open Table Assignment & Turn Continuity
  let updatedGroups = { ...assignedGroups };
  const validTargetPockets = pocketedIds.filter((id) => id >= 1 && id <= 15 && id !== 8);

  if (!foulMessage && validTargetPockets.length > 0) {
    if (isTableOpen) {
      // Assign group based on first ball potted
      const firstPottedId = validTargetPockets[0];
      const assignedType = firstPottedId <= 7 ? BidaBallType.SOLIDS : BidaBallType.STRIPES;
      const oppositeType = assignedType === BidaBallType.SOLIDS ? BidaBallType.STRIPES : BidaBallType.SOLIDS;

      updatedGroups = {
        [PlayerRole.X]: activePlayer === PlayerRole.X ? assignedType : oppositeType,
        [PlayerRole.O]: activePlayer === PlayerRole.O ? assignedType : oppositeType,
      };
      shouldSwitchTurn = false;
    } else {
      const pocketedMyBall = validTargetPockets.some((id) => {
        const ball = settledBalls.find((b) => b.id === id);
        return ball?.type === myGroup;
      });

      if (pocketedMyBall) {
        shouldSwitchTurn = false;
      }
    }
  }

  return {
    settledBalls,
    nextTurn: shouldSwitchTurn ? opponentRole : activePlayer,
    foulMessage,
    winner,
    assignedGroups: updatedGroups,
  };
}
