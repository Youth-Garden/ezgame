"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { useRoomRealtime } from "@/shared/hooks/use-room-realtime";
import { RoomHeader } from "@/shared/components/room-header";
import { ResultDialog, type ResultDialogData } from "@/shared/components/result-dialog";
import { usePortal } from "@/shared/components/portal";
import { sounds } from "@/shared/lib/sound-effects";
import { usePlayerProfile } from "@/shared/hooks/use-player-profile";
import { BidaTable } from "../components/bida-table";
import { BidaScoreboard } from "../components/bida-scoreboard";
import { BidaBallType, BidaTurnState, type BidaBall } from "../types";
import { createInitialRack } from "../utils/bida-physics";
import { respawnCueBall, updatePhysicsStep } from "../utils/bida-simulation";
import { GameWinner } from "@/features/caro/types";

export function BidaPlayPage() {
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const { profile: myProfile, randomizeAvatar } = usePlayerProfile();

  const rawCode = (routeParams?.code as string) || "BD-DEMO";
  const roomCode = rawCode.toUpperCase();

  const roleParam = searchParams?.get("role")?.toUpperCase();
  const initialRole =
    roleParam === "O"
      ? PlayerRole.O
      : roleParam === "SPECTATOR"
      ? PlayerRole.SPECTATOR
      : PlayerRole.X;

  const [myRole, setMyRole] = useState<PlayerRole>(initialRole);
  const [balls, setBalls] = useState<BidaBall[]>(() => createInitialRack());
  const [currentTurn, setCurrentTurn] = useState<PlayerRole.X | PlayerRole.O>(PlayerRole.X);
  const [turnState, setTurnState] = useState<BidaTurnState>(BidaTurnState.AIMING);
  const [lastFoul, setLastFoul] = useState<string | null>(null);

  const [presentResultDialog, dismissResultDialog] =
    usePortal<ResultDialogData>(ResultDialog);

  const animFrameRef = useRef<number | null>(null);
  const sendEventRef = useRef<(event: RealtimeEvent) => Promise<void>>(async () => {});
  const stateRef = useRef({ balls, currentTurn, myRole, turnState });
  stateRef.current = { balls, currentTurn, myRole, turnState };

  // Rematch & game reset
  const resetGame = useCallback(
    (startingRole: PlayerRole.X | PlayerRole.O = PlayerRole.X) => {
      setBalls(createInitialRack());
      setCurrentTurn(startingRole);
      setTurnState(BidaTurnState.AIMING);
      setLastFoul(null);
      dismissResultDialog();
      sounds.playRematchSound();
    },
    [dismissResultDialog]
  );

  // Show end game dialog
  const showResultDialog = useCallback(
    (
      currentWinner: GameWinner | null,
      isRequestedByMe: boolean,
      isRequestedByOpponent: boolean
    ) => {
      presentResultDialog({
        winner: currentWinner,
        myRole: stateRef.current.myRole,
        isRematchRequestedByMe: isRequestedByMe,
        isRematchRequestedByOpponent: isRequestedByOpponent,
        onRequestRematch: async () => {
          await sendEventRef.current({
            type: RealtimeEventType.REMATCH_REQUEST,
            payload: { from: stateRef.current.myRole },
          });
          showResultDialog(currentWinner, true, isRequestedByOpponent);
        },
        onAcceptRematch: async () => {
          const nextStarting =
            stateRef.current.currentTurn === PlayerRole.X
              ? PlayerRole.O
              : PlayerRole.X;
          await sendEventRef.current({
            type: RealtimeEventType.REMATCH_ACCEPT,
            payload: { acceptedBy: stateRef.current.myRole },
          });
          resetGame(nextStarting);
        },
      });
    },
    [presentResultDialog, resetGame]
  );

  // Physics animation loop after a shot
  const runPhysicsLoop = useCallback(
    (onSettled: (pocketed: BidaBall[]) => void) => {
      let allPocketed: BidaBall[] = [];

      const step = () => {
        setBalls((prevBalls) => {
          const next = prevBalls.map((b) => ({ ...b }));
          const result = updatePhysicsStep(next);

          if (result.hasCollisions) {
            sounds.playMoveSound("X");
          }

          if (result.pocketedBalls.length > 0) {
            sounds.playWinFanfare();
            allPocketed = [...allPocketed, ...result.pocketedBalls];
          }

          if (result.isStillMoving) {
            animFrameRef.current = requestAnimationFrame(step);
          } else {
            // Settled!
            onSettled(allPocketed);
          }
          return next;
        });
      };

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(step);
    },
    []
  );

  // Apply shot physics impulse
  const applyShot = useCallback(
    (
      player: PlayerRole.X | PlayerRole.O,
      angle: number,
      power: number,
      cueX?: number,
      cueY?: number
    ) => {
      setTurnState(BidaTurnState.BALLS_MOVING);
      sounds.playMoveSound("O");

      setBalls((prevBalls) => {
        return prevBalls.map((ball) => {
          if (ball.type === BidaBallType.CUE) {
            const impulse = (power / 100) * 22; // max velocity
            return {
              ...ball,
              x: cueX ?? ball.x,
              y: cueY ?? ball.y,
              vx: Math.cos(angle) * impulse,
              vy: Math.sin(angle) * impulse,
            };
          }
          return ball;
        });
      });

      // Run local physics simulation
      runPhysicsLoop((pocketed) => {
        const cuePocketed = pocketed.some((b) => b.type === BidaBallType.CUE);
        const eightBallPocketed = pocketed.some((b) => b.type === BidaBallType.EIGHT_BALL);

        // Turn resolution logic
        setBalls((currentBalls) => {
          const updated = currentBalls.map((b) => ({ ...b }));
          if (cuePocketed) {
            respawnCueBall(updated);
            setLastFoul("Phạm quy: Bi trắng rơi vào lỗ!");
          }

          if (eightBallPocketed) {
            // 8-ball pocketed -> determine winner
            const winnerRole = cuePocketed
              ? player === PlayerRole.X ? PlayerRole.O : PlayerRole.X
              : player;
            setTurnState(BidaTurnState.GAME_OVER);
            showResultDialog(
              winnerRole === PlayerRole.X ? GameWinner.X : GameWinner.O,
              false,
              false
            );
          } else {
            // Check next turn
            const nextTurn = player === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
            setCurrentTurn(nextTurn);
            setTurnState(BidaTurnState.AIMING);
          }

          return updated;
        });
      });
    },
    [runPhysicsLoop, showResultDialog]
  );

  // Realtime Event Handler
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      if (event.type === RealtimeEventType.BIDA_SHOT) {
        if (event.payload.player !== stateRef.current.myRole) {
          applyShot(
            event.payload.player,
            event.payload.cueAngle,
            event.payload.power,
            event.payload.cueBallX,
            event.payload.cueBallY
          );
        }
      } else if (event.type === RealtimeEventType.GAME_RESET) {
        resetGame(event.payload.startingPlayer);
      } else if (event.type === RealtimeEventType.REMATCH_REQUEST) {
        showResultDialog(null, false, true);
      } else if (event.type === RealtimeEventType.REMATCH_ACCEPT) {
        resetGame(PlayerRole.X);
      } else if (event.type === RealtimeEventType.PLAYER_SURRENDER) {
        const winner =
          event.payload.player === PlayerRole.X ? GameWinner.O : GameWinner.X;
        showResultDialog(winner, false, false);
      }
    },
    [applyShot, resetGame, showResultDialog]
  );

  // Initialize Realtime Hook
  const {
    isOpponentOnline,
    opponentProfile,
    sendEvent,
    isSupabaseConfigured,
    expectedOpponentRole,
  } = useRoomRealtime({
    roomCode,
    myRole,
    profile: myProfile,
    onEventReceived: handleRealtimeEvent,
  });

  sendEventRef.current = sendEvent;

  // Fire shot action from active client
  const handleFireShot = useCallback(
    async (angle: number, power: number) => {
      const cueBall = stateRef.current.balls.find(
        (b) => b.type === BidaBallType.CUE && !b.isPocketed
      );
      if (!cueBall) return;

      const currentTurnPlayer = stateRef.current.currentTurn;

      // Broadcast shot to opponent
      await sendEvent({
        type: RealtimeEventType.BIDA_SHOT,
        payload: {
          player: currentTurnPlayer,
          cueAngle: angle,
          power,
          cueBallX: cueBall.x,
          cueBallY: cueBall.y,
          timestamp: Date.now(),
        },
      });

      // Apply locally
      applyShot(currentTurnPlayer, angle, power, cueBall.x, cueBall.y);
    },
    [sendEvent, applyShot]
  );

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 md:p-6">
      {/* Header with players and room code */}
      <RoomHeader
        roomCode={roomCode}
        gameTitle="Bida"
        myRole={myRole}
        myProfile={myProfile}
        opponentProfile={opponentProfile}
        onRandomizeAvatar={randomizeAvatar}
        isOpponentOnline={isOpponentOnline}
        expectedOpponentRole={expectedOpponentRole}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 my-2">
        <BidaScoreboard
          currentTurn={currentTurn}
          myRole={myRole}
          balls={balls}
          lastFoul={lastFoul}
        />

        <BidaTable
          balls={balls}
          isMyTurn={currentTurn === myRole}
          turnState={turnState}
          currentRole={myRole}
          onFireShot={handleFireShot}
        />
      </main>

      {/* Footer Instructions */}
      <footer className="text-center text-xs text-neutral-500 py-2">
        EzGame Billiards • Đồng bộ thời gian thực 2 người chơi • Đưa bi mục tiêu vào lỗ
      </footer>
    </div>
  );
}
