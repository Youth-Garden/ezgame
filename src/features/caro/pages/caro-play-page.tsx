"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CaroBoard } from "../components/caro-board";
import { CaroScoreboard } from "../components/caro-scoreboard";
import { CaroPlayer, GameWinner } from "../types";
import { RoomHeader } from "@/shared/components/room-header";
import { GameActionBar } from "@/shared/components/game-action-bar";
import { PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { Icons } from "@/shared/icons";
import { GameBoard } from "@/shared/components/game-board";
import { GameType } from "@/shared/types/room";
import { useCaroGame } from "../hooks/use-caro-game";
import { useGameRoom } from "@/shared/hooks/use-game-room";
import { DEFAULT_CARO_CONFIG } from "../config/caro-config";
import { useTurnTimer } from "@/shared/hooks/use-turn-timer";

export function CaroPlayPage() {
  const t = useTranslations("game");

  // Encapsulated shared room realtime, presence, profiles, and portal dialogs
  const {
    roomCode,
    myRole,
    myProfile,
    randomizeAvatar,
    isOpponentOnline,
    opponentProfile,
    expectedOpponentRole,
    isSupabaseConfigured,
    sendEvent,
    sendEventRef,
    showResultDialog,
    dismissResultDialog,
    promptSurrender,
  } = useGameRoom({
    gameTitle: DEFAULT_CARO_CONFIG.title,
    defaultRoomCode: DEFAULT_CARO_CONFIG.defaultRoomCode,
    onEventReceived: (event: RealtimeEvent) => handleRealtimeEvent(event),
    onSurrenderConfirmed: async () => {
      const winner: GameWinner =
        myRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
      setGameState((prev) => ({ ...prev, winner }));
      showResultDialog(
        winner,
        false,
        false,
        () => handleRequestRematchRef.current(),
        () => handleAcceptRematchRef.current()
      );
      await sendEvent({
        type: RealtimeEventType.PLAYER_SURRENDER,
        payload: { player: myRole },
      });
    },
  });

  // Custom Caro game hook encapsulating move state, win calculation, and sounds
  const {
    gameState,
    setGameState,
    resetGame,
    applyMove,
    handleCellClick,
  } = useCaroGame({
    myRole,
    sendEvent: async (e) => sendEventRef.current(e),
    onShowResultDialog: (winner) =>
      showResultDialog(
        winner,
        false,
        false,
        () => handleRequestRematchRef.current(),
        () => handleAcceptRematchRef.current()
      ),
    onDismissResultDialog: dismissResultDialog,
  });

  const latestGameStateRef = useRef(gameState);
  latestGameStateRef.current = gameState;

  const handleRequestRematchRef = useRef<() => void>(() => {});
  const handleAcceptRematchRef = useRef<() => void>(() => {});

  const handleRequestRematch = useCallback(async () => {
    const currentWinner = latestGameStateRef.current.winner;
    showResultDialog(
      currentWinner,
      true, // isRequestedByMe
      false, // isRequestedByOpponent
      () => handleRequestRematchRef.current(),
      () => handleAcceptRematchRef.current()
    );
    await sendEventRef.current({
      type: RealtimeEventType.REMATCH_REQUEST,
      payload: { from: myRole },
    });
  }, [myRole, showResultDialog]);

  const handleAcceptRematch = useCallback(async () => {
    resetGame(CaroPlayer.X);
    await sendEventRef.current({
      type: RealtimeEventType.REMATCH_ACCEPT,
      payload: { acceptedBy: myRole },
    });
  }, [resetGame]);

  useEffect(() => {
    handleRequestRematchRef.current = handleRequestRematch;
    handleAcceptRematchRef.current = handleAcceptRematch;
  }, [handleRequestRematch, handleAcceptRematch]);

  // Handle incoming broadcast events from peer
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case RealtimeEventType.REQUEST_ROOM_SYNC: {
          const current = latestGameStateRef.current;
          if (current.moveCount > 0) {
            sendEventRef.current({
              type: RealtimeEventType.RESPONSE_CARO_SYNC,
              payload: {
                board: current.board,
                currentTurn: current.currentTurn,
                lastMove: current.lastMove,
                winner: current.winner,
                winningLine: current.winningLine,
                moveCount: current.moveCount,
                timestamp: Date.now(),
              },
            });
          }
          break;
        }

        case RealtimeEventType.RESPONSE_CARO_SYNC: {
          const { board, currentTurn, lastMove, winner, winningLine, moveCount } = event.payload;
          setGameState({
            board: board as CaroPlayer[][],
            currentTurn: currentTurn as CaroPlayer,
            lastMove,
            winner: winner as GameWinner | null,
            winningLine,
            moveCount,
          });
          break;
        }

        case RealtimeEventType.GAME_MOVE: {
          const { row, col, player } = event.payload;
          const caroPlayer =
            player === PlayerRole.X ? CaroPlayer.X : CaroPlayer.O;
          applyMove(row, col, caroPlayer);
          break;
        }

        case RealtimeEventType.REMATCH_REQUEST: {
          const currentWinner = latestGameStateRef.current.winner;
          showResultDialog(
            currentWinner,
            false,
            true,
            () => handleRequestRematchRef.current(),
            () => handleAcceptRematchRef.current()
          );
          break;
        }

        case RealtimeEventType.REMATCH_ACCEPT: {
          resetGame(CaroPlayer.X);
          break;
        }

        case RealtimeEventType.GAME_TIMEOUT_PASS_TURN: {
          const nextCaroTurn =
            event.payload.nextTurn === PlayerRole.X ? CaroPlayer.X : CaroPlayer.O;
          setGameState((prev) => ({
            ...prev,
            currentTurn: nextCaroTurn,
          }));
          break;
        }

        case RealtimeEventType.PLAYER_SURRENDER: {
          const winner =
            event.payload.player === PlayerRole.X ? GameWinner.O : GameWinner.X;
          setGameState((prev) => ({ ...prev, winner }));
          showResultDialog(
            winner,
            false,
            false,
            () => handleRequestRematchRef.current(),
            () => handleAcceptRematchRef.current()
          );
          break;
        }

        default:
          break;
      }
    },
    [applyMove, resetGame, setGameState, showResultDialog]
  );

  // Turn permission calculation
  const isMyTurn =
    (gameState.currentTurn === CaroPlayer.X && myRole === PlayerRole.X) ||
    (gameState.currentTurn === CaroPlayer.O && myRole === PlayerRole.O);

  const canClick =
    isMyTurn && isOpponentOnline && !gameState.winner && (myRole as PlayerRole) !== PlayerRole.SPECTATOR;

  // Turn Countdown Timer
  const { timeLeft, timeFraction, isWarning: isTimerWarning } = useTurnTimer({
    currentTurn: gameState.currentTurn,
    isGameActive: isOpponentOnline && !gameState.winner,
    timeLimitSeconds: DEFAULT_CARO_CONFIG.turnTimeLimitSeconds,
    warningThresholdSeconds: DEFAULT_CARO_CONFIG.warningThresholdSeconds,
    onTimeOut: () => {
      // Turn timeout: switch turn to opponent without losing
      if (isMyTurn && !gameState.winner && isOpponentOnline) {
        const nextTurn = myRole === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
        const nextCaroTurn = nextTurn === PlayerRole.X ? CaroPlayer.X : CaroPlayer.O;
        setGameState((prev) => ({
          ...prev,
          currentTurn: nextCaroTurn,
        }));
        sendEvent({
          type: RealtimeEventType.GAME_TIMEOUT_PASS_TURN,
          payload: {
            player: myRole,
            nextTurn,
            timestamp: Date.now(),
          },
        }).catch(() => {});
      }
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-game">
      {/* Room Header */}
      <RoomHeader
        roomCode={roomCode}
        gameTitle="Caro 15x15"
        gameType="caro"
        myRole={myRole}
        myProfile={myProfile}
        opponentProfile={opponentProfile}
        onRandomizeAvatar={randomizeAvatar}
        isOpponentOnline={isOpponentOnline}
        expectedOpponentRole={expectedOpponentRole}
        isSupabaseConfigured={isSupabaseConfigured}
        isGameActive={!gameState.winner && isOpponentOnline}
        onSurrender={promptSurrender}
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-6 w-full">
        {/* Game Stage Content Container: Uniform max width matching Caro and Xiangqi */}
        <div className="w-full max-w-[540px] flex flex-col items-center">
          {/* Desktop Game Tools & Quick Actions */}
          <GameActionBar
            canSurrender={Boolean(isOpponentOnline && !gameState.winner)}
            onSurrender={promptSurrender}
            maxWidthClass="w-full"
            className="hidden sm:flex mb-3"
          />

          {/* Live Caro Scoreboard directly on table - Perfectly matches board width */}
          <div className="mb-4 w-full">
            <CaroScoreboard
              currentTurn={gameState.currentTurn}
              myRole={myRole}
              winner={gameState.winner ? (gameState.winner === GameWinner.X ? CaroPlayer.X : CaroPlayer.O) : null}
              myProfile={myProfile}
              opponentProfile={opponentProfile}
              isOpponentOnline={isOpponentOnline}
              timeLeft={timeLeft}
              timeFraction={timeFraction}
              isTimerWarning={isTimerWarning}
            />
          </div>

          {/* Board Component wrapped in GameBoard Strategy container */}
          <GameBoard gameType={GameType.CARO}>
            <CaroBoard
              board={gameState.board}
              lastMove={gameState.lastMove}
              winningLine={gameState.winningLine}
              canClick={canClick}
              myRole={myRole}
              currentTurn={gameState.currentTurn}
              onCellClick={handleCellClick}
            />
          </GameBoard>
        </div>
      </main>
    </div>
  );
}
