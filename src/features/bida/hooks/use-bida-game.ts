import { useState, useCallback, useRef, useEffect } from "react";
import { PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { sounds } from "@/shared/lib/sound-effects";
import { GameWinner } from "@/features/caro/types";
import { BidaBall, BidaBallType, BidaTurnState } from "../types";
import { createInitialRack } from "../utils/bida-physics";
import {
  createMatterPoolSimulation,
  type MatterPoolSimulation,
  type SimulationStepResult,
} from "../utils/bida-simulation";
import { evaluate8BallShot } from "../utils/bida-rules";

interface UseBidaGameParams {
  myRole: PlayerRole;
  sendEvent: (event: RealtimeEvent) => Promise<void>;
  onShowResultDialog: (winner: GameWinner | null) => void;
  onDismissResultDialog: () => void;
}

export function useBidaGame({
  myRole,
  sendEvent,
  onShowResultDialog,
  onDismissResultDialog,
}: UseBidaGameParams) {
  const [balls, setBalls] = useState<BidaBall[]>(() => createInitialRack());
  const [currentTurn, setCurrentTurn] = useState<PlayerRole.X | PlayerRole.O>(PlayerRole.X);
  const [turnState, setTurnState] = useState<BidaTurnState>(BidaTurnState.AIMING);
  const [lastFoul, setLastFoul] = useState<string | null>(null);
  const [isBreakShot, setIsBreakShot] = useState(true);
  const [assignedGroups, setAssignedGroups] = useState<{
    [PlayerRole.X]: BidaBallType | null;
    [PlayerRole.O]: BidaBallType | null;
  }>({ [PlayerRole.X]: null, [PlayerRole.O]: null });

  const animFrameRef = useRef<number | null>(null);
  const simulationRef = useRef<MatterPoolSimulation | null>(null);
  const sendEventRef = useRef(sendEvent);
  sendEventRef.current = sendEvent;

  const stateRef = useRef({ balls, currentTurn, myRole, turnState, assignedGroups, isBreakShot });
  stateRef.current = { balls, currentTurn, myRole, turnState, assignedGroups, isBreakShot };

  // Keep stateRef.current.myRole up to date whenever myRole changes
  useEffect(() => {
    stateRef.current.myRole = myRole;
  }, [myRole]);

  const resetGame = useCallback(
    (startingRole: PlayerRole.X | PlayerRole.O = PlayerRole.X) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const newRack = createInitialRack();
      setBalls(newRack);
      setCurrentTurn(startingRole);
      setTurnState(BidaTurnState.AIMING);
      setLastFoul(null);
      setIsBreakShot(true);
      setAssignedGroups({ [PlayerRole.X]: null, [PlayerRole.O]: null });
      onDismissResultDialog();
      simulationRef.current?.destroy();
      simulationRef.current = createMatterPoolSimulation(newRack);
      sounds.playRematchSound();
    },
    [onDismissResultDialog]
  );

  useEffect(() => {
    simulationRef.current = createMatterPoolSimulation(balls);
    return () => {
      simulationRef.current?.destroy();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const runPhysicsLoop = useCallback(
    (onSettled: (stepResult: SimulationStepResult, finalBalls: BidaBall[]) => void) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const allPocketedThisTurn: number[] = [];
      const startTime = Date.now();
      let nowFrameCount = 0;

      const tick = () => {
        const sim = simulationRef.current;
        if (!sim) return;
        const result = sim.step();
        if (result.pocketedIds.length > 0) {
          allPocketedThisTurn.push(...result.pocketedIds);
          sounds.playMoveSound("X");
        }
        if (result.hasCollisions) sounds.playMoveSound("O");

        // Update balls snapshot from simulation
        const currentSimBalls = stateRef.current.balls.map((b) => ({ ...b }));
        sim.syncBallPositions(currentSimBalls);
        allPocketedThisTurn.forEach((id) => {
          const ball = currentSimBalls.find((b) => b.id === id);
          if (ball) ball.isPocketed = true;
        });

        // Throttling React state dispatch to ~30 FPS during physics motion to avoid React re-render choke,
        // while Matter.js physics continues stepping at full 60 FPS accuracy
        nowFrameCount++;
        if (nowFrameCount % 2 === 0 || !result.isStillMoving) {
          setBalls(currentSimBalls);
        }

        // Watchdog: after 7.5s, force settled even if small collision vibrations continue
        const elapsed = Date.now() - startTime;
        if (result.isStillMoving && elapsed < 7500) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          onSettled({ ...result, pocketedIds: allPocketedThisTurn }, currentSimBalls);
        }
      };
      animFrameRef.current = requestAnimationFrame(tick);
    },
    []
  );

  const handleShotSettled = useCallback(
    (stepResult: SimulationStepResult, currentBalls: BidaBall[]) => {
      setTurnState(BidaTurnState.AIMING);
      const activePlayer = stateRef.current.currentTurn;
      const evaluation = evaluate8BallShot({
        isBreakShot: stateRef.current.isBreakShot,
        activePlayer,
        assignedGroups: stateRef.current.assignedGroups,
        stepResult,
        currentBalls,
      });

      setBalls(evaluation.settledBalls);
      setCurrentTurn(evaluation.nextTurn);
      setAssignedGroups(evaluation.assignedGroups);
      setLastFoul(evaluation.foulMessage);
      setIsBreakShot(false);

      if (simulationRef.current) {
        simulationRef.current.destroy();
        simulationRef.current = createMatterPoolSimulation(evaluation.settledBalls);
      }

      if (evaluation.winner) {
        if (evaluation.winner === (activePlayer as unknown as GameWinner)) sounds.playWinFanfare();
        else sounds.playLoseTone();
        onShowResultDialog(evaluation.winner);
      } else if (evaluation.foulMessage) {
        sounds.playLoseTone();
      }

      if (stateRef.current.myRole === activePlayer) {
        const winnerRole = evaluation.winner === GameWinner.X ? PlayerRole.X : evaluation.winner === GameWinner.O ? PlayerRole.O : null;
        sendEventRef.current({
          type: RealtimeEventType.BIDA_STATE_SYNC,
          payload: {
            balls: evaluation.settledBalls.map((b) => ({ id: b.id, x: b.x, y: b.y, isPocketed: b.isPocketed })),
            currentTurn: evaluation.nextTurn,
            assignedGroups: evaluation.assignedGroups,
            winner: winnerRole,
            foulMessage: evaluation.foulMessage,
            timestamp: Date.now(),
          },
        });
      }
    },
    [onShowResultDialog]
  );

  const applyShot = useCallback(
    (_player: PlayerRole.X | PlayerRole.O, cueAngle: number, power: number, cueBallX: number, cueBallY: number, englishX = 0, englishY = 0) => {
      setTurnState(BidaTurnState.ROLLING);
      sounds.playMoveSound(stateRef.current.currentTurn === PlayerRole.X ? "X" : "O");
      setBalls((prev) => prev.map((b) => (b.type === BidaBallType.CUE ? { ...b, x: cueBallX, y: cueBallY } : b)));

      if (simulationRef.current) {
        const cueBody = simulationRef.current.ballsMap.get(0);
        if (cueBody) {
          cueBody.position.x = cueBallX;
          cueBody.position.y = cueBallY;
          cueBody.velocity.x = 0;
          cueBody.velocity.y = 0;
        }
        simulationRef.current.applyShot(cueAngle, power, englishX, englishY);
      }
      runPhysicsLoop(handleShotSettled);
    },
    [runPhysicsLoop, handleShotSettled]
  );

  const applyAuthoritativeSync = useCallback(
    (payload: {
      balls: BidaBall[];
      currentTurn: PlayerRole.X | PlayerRole.O;
      assignedGroups?: { [PlayerRole.X]: string | null; [PlayerRole.O]: string | null };
      winner?: PlayerRole | null;
      foulMessage?: string | null;
    }) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setBalls(payload.balls);
      setCurrentTurn(payload.currentTurn);
      setTurnState(BidaTurnState.AIMING);
      setLastFoul(payload.foulMessage ?? null);
      setIsBreakShot(false);

      if (payload.assignedGroups) {
        setAssignedGroups({
          [PlayerRole.X]: (payload.assignedGroups[PlayerRole.X] as BidaBallType) ?? null,
          [PlayerRole.O]: (payload.assignedGroups[PlayerRole.O] as BidaBallType) ?? null,
        });
      }
      simulationRef.current?.destroy();
      simulationRef.current = createMatterPoolSimulation(payload.balls);

      if (payload.winner) {
        onShowResultDialog(payload.winner === PlayerRole.X ? GameWinner.X : GameWinner.O);
      }
    },
    [onShowResultDialog]
  );

  const fireShot = useCallback(
    (angle: number, power: number, englishX = 0, englishY = 0) => {
      const cueBall = stateRef.current.balls.find((b) => b.type === BidaBallType.CUE && !b.isPocketed);
      if (!cueBall) return;
      const currentTurnPlayer = stateRef.current.currentTurn;

      applyShot(currentTurnPlayer, angle, power, cueBall.x, cueBall.y, englishX, englishY);
      sendEventRef.current({
        type: RealtimeEventType.BIDA_SHOT,
        payload: {
          player: currentTurnPlayer,
          cueAngle: angle,
          power,
          cueBallX: cueBall.x,
          cueBallY: cueBall.y,
          englishX,
          englishY,
          timestamp: Date.now(),
        },
      }).catch((err) => console.error("Failed to broadcast shot:", err));
    },
    [applyShot]
  );

  return {
    balls,
    currentTurn,
    turnState,
    lastFoul,
    assignedGroups,
    isBreakShot,
    resetGame,
    applyShot,
    applyAuthoritativeSync,
    fireShot,
  };
}
