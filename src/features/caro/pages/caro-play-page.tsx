"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Flag } from "lucide-react";
import { CaroBoard } from "../components/caro-board";
import { checkWin, createEmptyBoard } from "../utils/check-win";
import { CaroPlayer, GameWinner, type CaroGameState } from "../types";
import { useRoomRealtime } from "@/shared/hooks/use-room-realtime";
import { RoomHeader } from "@/shared/components/room-header";
import { ResultDialog, type ResultDialogData } from "@/shared/components/result-dialog";
import { usePortal } from "@/shared/components/portal";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";

export function CaroPlayPage() {
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const rawCode = (routeParams?.code as string) || "CR-DEMO";
  const roomCode = rawCode.toUpperCase();

  const roleParam = searchParams?.get("role")?.toUpperCase();
  const initialRole =
    roleParam === "O"
      ? PlayerRole.O
      : roleParam === "SPECTATOR"
      ? PlayerRole.SPECTATOR
      : PlayerRole.X;

  // My Role (X, O, or SPECTATOR)
  const [myRole, setMyRole] = useState<PlayerRole>(initialRole);

  // Game state
  const [gameState, setGameState] = useState<CaroGameState>({
    board: createEmptyBoard(),
    currentTurn: CaroPlayer.X,
    lastMove: null,
    winner: null,
    winningLine: null,
    moveCount: 0,
  });

  // Portal Dialog Hook from Lumen architecture
  const [presentResultDialog, dismissResultDialog] =
    usePortal<ResultDialogData>(ResultDialog);

  // Mutable refs to decouple callbacks without closure staleness or render mutations
  const stateRef = useRef({
    gameState,
    myRole,
  });

  const sendEventRef = useRef<(event: RealtimeEvent) => Promise<void>>(
    async () => {}
  );

  const showDialogRef = useRef<
    (
      currentWinner: GameWinner | null,
      isRequestedByMe: boolean,
      isRequestedByOpponent: boolean
    ) => void
  >(() => {});

  // Reset board helper
  const resetGame = useCallback(
    (nextTurn: CaroPlayer = CaroPlayer.X) => {
      setGameState({
        board: createEmptyBoard(),
        currentTurn: nextTurn,
        lastMove: null,
        winner: null,
        winningLine: null,
        moveCount: 0,
      });
      dismissResultDialog();
      sounds.playRematchSound();
    },
    [dismissResultDialog]
  );

  // Show result dialog with current action handlers
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
          const { myRole: role, gameState: current } = stateRef.current;

          showDialogRef.current(current.winner, true, false);
          await sendEventRef.current({
            type: RealtimeEventType.REMATCH_REQUEST,
            payload: { from: role },
          });
        },
        onAcceptRematch: async () => {
          const { myRole: role } = stateRef.current;
          resetGame(CaroPlayer.X);

          await sendEventRef.current({
            type: RealtimeEventType.REMATCH_ACCEPT,
            payload: { acceptedBy: role },
          });
        },
      });
    },
    [presentResultDialog, resetGame]
  );

  // Synchronize refs safely in effect
  useEffect(() => {
    stateRef.current = { gameState, myRole };
    showDialogRef.current = showResultDialog;
  }, [gameState, myRole, showResultDialog]);

  // Handle incoming broadcast events from peer
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case RealtimeEventType.GAME_MOVE: {
          const { row, col, player } = event.payload;
          const caroPlayer =
            player === PlayerRole.X ? CaroPlayer.X : CaroPlayer.O;

          setGameState((prev) => {
            if (prev.board[row][col] || prev.winner) return prev;

            const nextBoard = prev.board.map((rowCells, rowIndex) =>
              rowIndex === row
                ? rowCells.map((cellValue, colIndex) =>
                    colIndex === col ? caroPlayer : cellValue
                  )
                : rowCells
            );

            const nextMoveCount = prev.moveCount + 1;
            const { winner, winningLine } = checkWin(
              nextBoard,
              row,
              col,
              caroPlayer,
              nextMoveCount
            );

            sounds.playMoveSound(caroPlayer as unknown as "X" | "O");

            return {
              board: nextBoard,
              currentTurn:
                caroPlayer === CaroPlayer.X ? CaroPlayer.O : CaroPlayer.X,
              lastMove: [row, col],
              winner,
              winningLine,
              moveCount: nextMoveCount,
            };
          });

          // Check win from updated values
          const updatedState = stateRef.current.gameState;
          const updatedBoard = updatedState.board.map((r, rIdx) =>
            rIdx === row
              ? r.map((c, cIdx) => (cIdx === col ? caroPlayer : c))
              : r
          );
          const outcome = checkWin(
            updatedBoard,
            row,
            col,
            caroPlayer,
            updatedState.moveCount + 1
          );

          if (outcome.winner) {
            showResultDialog(outcome.winner, false, false);
          }
          break;
        }

        case RealtimeEventType.PLAYER_SURRENDER: {
          const { player } = event.payload;
          const winner =
            player === PlayerRole.X ? GameWinner.O : GameWinner.X;
          setGameState((prev) => ({
            ...prev,
            winner,
          }));
          showResultDialog(winner, false, false);
          break;
        }

        case RealtimeEventType.REMATCH_REQUEST: {
          showResultDialog(stateRef.current.gameState.winner, false, true);
          break;
        }

        case RealtimeEventType.REMATCH_ACCEPT: {
          resetGame(CaroPlayer.X);
          break;
        }

        default:
          break;
      }
    },
    [resetGame, showResultDialog]
  );

  // Hook into Realtime (Broadcast + Presence)
  const {
    isOpponentOnline,
    sendEvent,
    isSupabaseConfigured,
    expectedOpponentRole,
  } = useRoomRealtime({
    roomCode,
    myRole,
    onEventReceived: handleRealtimeEvent,
  });

  useEffect(() => {
    sendEventRef.current = sendEvent;
  }, [sendEvent]);

  // Check if current client is allowed to place a stone
  const canClick =
    !gameState.winner &&
    (myRole as unknown as CaroPlayer) === gameState.currentTurn;

  // Handle cell click
  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (!canClick || gameState.board[row][col] || gameState.winner) return;

      const playerToPlace: CaroPlayer = myRole as unknown as CaroPlayer;

      const nextBoard = gameState.board.map((rowCells, rowIndex) =>
        rowIndex === row
          ? rowCells.map((cellValue, colIndex) =>
              colIndex === col ? playerToPlace : cellValue
            )
          : rowCells
      );
      const nextMoveCount = gameState.moveCount + 1;
      const { winner, winningLine } = checkWin(
        nextBoard,
        row,
        col,
        playerToPlace,
        nextMoveCount
      );

      sounds.playMoveSound(playerToPlace as unknown as "X" | "O");

      setGameState({
        board: nextBoard,
        currentTurn:
          playerToPlace === CaroPlayer.X ? CaroPlayer.O : CaroPlayer.X,
        lastMove: [row, col],
        winner,
        winningLine,
        moveCount: nextMoveCount,
      });

      if (winner) {
        showResultDialog(winner, false, false);
      }

      await sendEvent({
        type: RealtimeEventType.GAME_MOVE,
        payload: {
          row,
          col,
          player:
            playerToPlace === CaroPlayer.X ? PlayerRole.X : PlayerRole.O,
          timestamp: Date.now(),
        },
      });
    },
    [canClick, gameState, myRole, sendEvent, showResultDialog]
  );

  // Surrender Handler
  const handleSurrender = async () => {
    if (gameState.winner || myRole === PlayerRole.SPECTATOR) return;
    const confirmSurrender = window.confirm(
      "Are you sure you want to surrender this match?"
    );
    if (!confirmSurrender) return;

    const winner: GameWinner =
      myRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
    setGameState((prev) => ({
      ...prev,
      winner,
    }));

    showResultDialog(winner, false, false);

    await sendEvent({
      type: RealtimeEventType.PLAYER_SURRENDER,
      payload: { player: myRole },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Room Header */}
      <RoomHeader
        roomCode={roomCode}
        gameTitle="Caro 15x15"
        myRole={myRole}
        isOpponentOnline={isOpponentOnline}
        expectedOpponentRole={expectedOpponentRole}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-6xl mx-auto w-full">
        {/* Game Tools & Quick Actions */}
        <div className="w-full max-w-md flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Quick Switch Role (for testing) */}
            <button
              onClick={() =>
                setMyRole((prev) =>
                  prev === PlayerRole.X ? PlayerRole.O : PlayerRole.X
                )
              }
              type="button"
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-colors"
              title="Switch role for testing"
            >
              Switch to {myRole === PlayerRole.X ? "O" : "X"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Surrender button */}
            {!gameState.winner && (
              <button
                onClick={handleSurrender}
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Surrender
              </button>
            )}
          </div>
        </div>

        {/* Board Component */}
        <CaroBoard
          board={gameState.board}
          lastMove={gameState.lastMove}
          winningLine={gameState.winningLine}
          canClick={canClick}
          myRole={myRole}
          currentTurn={gameState.currentTurn}
          onCellClick={handleCellClick}
        />
      </main>
    </div>
  );
}
