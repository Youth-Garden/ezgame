"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RoomHeader } from "@/shared/components/room-header";
import { GameBoard } from "@/shared/components/game-board";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";
import {
  GameType,
  GameWinner,
  PlayerRole,
  RealtimeEventType,
  type RealtimeEvent,
} from "@/shared/types/room";
import { useGameRoom } from "@/shared/hooks/use-game-room";
import { useTurnTimer } from "@/shared/hooks/use-turn-timer";
import { DEFAULT_ANIMAL_CHESS_CONFIG } from "../config/animal-chess-config";
import { useAnimalChessGame } from "../hooks/use-animal-chess-game";
import { AnimalChessBoard } from "../components/animal-chess-board";
import { AnimalChessScoreboard } from "../components/animal-chess-scoreboard";
import type { AnimalBoardState } from "../types";

export function AnimalChessPlayPage() {
  const t = useTranslations("game");

  // Shared room realtime, presence, profiles, and portal dialogs
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
    gameTitle: DEFAULT_ANIMAL_CHESS_CONFIG.title,
    gameType: "animal-chess",
    defaultRoomCode: DEFAULT_ANIMAL_CHESS_CONFIG.defaultRoomCode,
    onEventReceived: (event: RealtimeEvent) => handleRealtimeEvent(event),
    onSurrenderConfirmed: async () => {
      const gameWinner: GameWinner =
        myRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
      setGameWinner(gameWinner);
      showResultDialog(
        gameWinner,
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

  const {
    board,
    setBoard,
    currentTurn,
    winner,
    setGameWinner,
    myColor,
    isMyTurn,
    selectedPos,
    validMoves,
    lastMove,
    capturedByBlue,
    capturedByRed,
    handleCellClick,
    executeMove,
    resetGame,
    passTurnTimeout,
  } = useAnimalChessGame({
    myRole,
    sendEvent: async (e) => sendEventRef.current(e),
    onShowResultDialog: (win) =>
      showResultDialog(
        win,
        false,
        false,
        () => handleRequestRematchRef.current(),
        () => handleAcceptRematchRef.current()
      ),
    onDismissResultDialog: dismissResultDialog,
  });

  const latestStateRef = useRef({ board, currentTurn, winner, lastMove });
  latestStateRef.current = { board, currentTurn, winner, lastMove };

  const handleRequestRematchRef = useRef<() => void>(() => {});
  const handleAcceptRematchRef = useRef<() => void>(() => {});

  // Realtime rematch handlers
  const handleRequestRematch = useCallback(async () => {
    const currentWinner = latestStateRef.current.winner;
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
    resetGame(PlayerRole.X);
    await sendEventRef.current({
      type: RealtimeEventType.REMATCH_ACCEPT,
      payload: { acceptedBy: myRole },
    });
  }, [myRole, resetGame]);

  useEffect(() => {
    handleRequestRematchRef.current = handleRequestRematch;
    handleAcceptRematchRef.current = handleAcceptRematch;
  }, [handleRequestRematch, handleAcceptRematch]);

  // Turn timer hook (matches Caro and Chess pattern)
  const { timeLeft, timeFraction, isWarning, resetTimer } = useTurnTimer({
    currentTurn,
    isGameActive: isOpponentOnline && !winner,
    timeLimitSeconds: DEFAULT_ANIMAL_CHESS_CONFIG.turnTimeoutSeconds,
    onTimeOut: () => {
      passTurnTimeout(currentTurn);
    },
  });

  // Handle incoming realtime network events
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case RealtimeEventType.ANIMAL_CHESS_MOVE: {
          executeMove(
            { row: event.payload.fromRow, col: event.payload.fromCol },
            { row: event.payload.toRow, col: event.payload.toCol },
            false
          );
          resetTimer();
          break;
        }

        case RealtimeEventType.REQUEST_ROOM_SYNC: {
          if (event.payload.from !== myRole) {
            const current = latestStateRef.current;
            sendEvent({
              type: RealtimeEventType.RESPONSE_ANIMAL_CHESS_SYNC,
              payload: {
                board: current.board.map((row) =>
                  row.map((cell) =>
                    cell ? { type: cell.type, color: cell.color } : null
                  )
                ),
                currentTurn: current.currentTurn,
                winner: current.winner,
                lastMove: current.lastMove
                  ? {
                      from: [current.lastMove.from.row, current.lastMove.from.col],
                      to: [current.lastMove.to.row, current.lastMove.to.col],
                    }
                  : null,
                timestamp: Date.now(),
              },
            });
          }
          break;
        }

        case RealtimeEventType.RESPONSE_ANIMAL_CHESS_SYNC: {
          if (event.payload.board) {
            setBoard(event.payload.board as unknown as AnimalBoardState);
            if (event.payload.winner) setGameWinner(event.payload.winner);
            resetTimer();
          }
          break;
        }

        case RealtimeEventType.PLAYER_SURRENDER: {
          const gameWinner =
            event.payload.player === PlayerRole.X ? GameWinner.O : GameWinner.X;
          setGameWinner(gameWinner);
          showResultDialog(
            gameWinner,
            false,
            false,
            () => handleRequestRematchRef.current(),
            () => handleAcceptRematchRef.current()
          );
          break;
        }

        case RealtimeEventType.REMATCH_REQUEST: {
          const currentWinner = latestStateRef.current.winner;
          showResultDialog(
            currentWinner,
            false, // isRequestedByMe
            true,  // isRequestedByOpponent
            () => handleRequestRematchRef.current(),
            () => handleAcceptRematchRef.current()
          );
          break;
        }

        case RealtimeEventType.REMATCH_ACCEPT: {
          resetGame(PlayerRole.X);
          resetTimer();
          break;
        }

        case RealtimeEventType.GAME_TIMEOUT_PASS_TURN: {
          passTurnTimeout(event.payload.player);
          resetTimer();
          break;
        }

        default:
          break;
      }
    },
    [
      executeMove,
      resetTimer,
      myRole,
      sendEvent,
      setBoard,
      setGameWinner,
      showResultDialog,
      resetGame,
      passTurnTimeout,
    ]
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-game">
      {/* Universal Room Header */}
      <RoomHeader
        roomCode={roomCode}
        gameTitle="Animal Chess (Cờ Thú)"
        gameType="animal-chess"
        myRole={myRole}
        myProfile={myProfile}
        opponentProfile={opponentProfile}
        onRandomizeAvatar={randomizeAvatar}
        isOpponentOnline={isOpponentOnline}
        expectedOpponentRole={expectedOpponentRole}
        isSupabaseConfigured={isSupabaseConfigured}
        isGameActive={!winner && isOpponentOnline}
        onSurrender={promptSurrender}
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
        {/* Game Stage Content Container */}
        <div className="w-full sm:w-fit flex flex-col items-center justify-center">
          {/* Desktop Game Tools & Quick Actions - Reserved height container (h-8) */}
          <div className="hidden sm:flex w-full h-8 items-center justify-end gap-2 mb-2">
            {isOpponentOnline && !winner && (
              <Button
                variant="destructive"
                size="sm"
                onClick={promptSurrender}
                className="text-xs gap-1.5"
              >
                <Icons name="flag" size={14} />
                <span>{t("surrender")}</span>
              </Button>
            )}
          </div>

          {/* Live Scoreboard directly on table */}
          <div className="mb-2.5 w-full">
            <AnimalChessScoreboard
              myRole={myRole}
              myProfile={myProfile}
              opponentProfile={opponentProfile}
              currentTurn={currentTurn}
              isOpponentOnline={isOpponentOnline}
              timeLeft={timeLeft}
              timeFraction={timeFraction}
              isTimerWarning={isWarning}
              winner={winner}
              capturedByBlue={capturedByBlue}
              capturedByRed={capturedByRed}
            />
          </div>

          {/* Board Component wrapped in GameBoard Strategy container */}
          <GameBoard gameType={GameType.ANIMAL_CHESS}>
            <AnimalChessBoard
              board={board}
              myColor={myColor}
              selectedPos={selectedPos}
              validMoves={validMoves}
              lastMove={lastMove}
              onCellClick={handleCellClick}
              disabled={!isOpponentOnline || !isMyTurn || !!winner}
            />
          </GameBoard>
        </div>
      </main>
    </div>
  );
}
