"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RoomHeader } from "@/shared/components/room-header";
import { GameBoard } from "@/shared/components/game-board";
import { GameActionBar } from "@/shared/components/game-action-bar";
import { GameType, GameWinner, PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { useGameRoom } from "@/shared/hooks/use-game-room";
import { useTurnTimer } from "@/shared/hooks/use-turn-timer";
import { DEFAULT_XIANGQI_CONFIG } from "../config/xiangqi-config";
import { useXiangqiGame } from "../hooks/use-xiangqi-game";
import { XiangqiBoard } from "../components/xiangqi-board";
import { XiangqiScoreboard } from "../components/xiangqi-scoreboard";
import { XiangqiColor, XiangqiMove } from "../types";

export function XiangqiPlayPage() {
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
    isGameStarted,
    isHost,
    startGame,
  } = useGameRoom({
    gameTitle: DEFAULT_XIANGQI_CONFIG.title,
    gameType: "xiangqi",
    defaultRoomCode: DEFAULT_XIANGQI_CONFIG.defaultRoomCode,
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
    currentTurn,
    selectedPos,
    validMoves,
    lastMove,
    capturedByRed,
    capturedByBlack,
    winner,
    setGameWinner,
    myColor,
    isInCheckColor,
    handleSelectPosition,
    executeMove,
    resetGame,
    passTurnTimeout,
  } = useXiangqiGame({
    myRole,
    sendEvent: async (e) => sendEventRef.current(e),
    onShowResultDialog: (win) =>
      showResultDialog(
        win,
        false,
        false,
        handleRequestRematch,
        handleAcceptRematch
      ),
    onDismissResultDialog: dismissResultDialog,
  });

  const latestStateRef = useRef({ board, currentTurn, winner });
  latestStateRef.current = { board, currentTurn, winner };

  const handleRequestRematchRef = useRef<() => void>(() => {});
  const handleAcceptRematchRef = useRef<() => void>(() => {});

  // Realtime rematch handlers
  const handleRequestRematch = useCallback(async () => {
    const currentWinner = latestStateRef.current.winner;
    showResultDialog(
      currentWinner,
      true,
      false,
      () => handleRequestRematchRef.current(),
      () => handleAcceptRematchRef.current()
    );
    await sendEventRef.current({
      type: RealtimeEventType.REMATCH_REQUEST,
      payload: { from: myRole },
    });
  }, [myRole, showResultDialog]);

  const handleAcceptRematch = useCallback(async () => {
    resetGame();
    await sendEventRef.current({
      type: RealtimeEventType.REMATCH_ACCEPT,
      payload: { acceptedBy: myRole },
    });
  }, [resetGame, myRole]);

  useEffect(() => {
    handleRequestRematchRef.current = handleRequestRematch;
    handleAcceptRematchRef.current = handleAcceptRematch;
  }, [handleRequestRematch, handleAcceptRematch]);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      if (event.type === RealtimeEventType.GAME_MOVE) {
        const payload = event.payload;
        if (
          payload &&
          typeof payload.fromRow === "number" &&
          typeof payload.fromCol === "number"
        ) {
          const fromPos = { row: payload.fromRow, col: payload.fromCol };
          const toPos = { row: payload.row, col: payload.col };
          const movingPiece = board[fromPos.row][fromPos.col];
          const capturedPiece = board[toPos.row][toPos.col];

          if (movingPiece) {
            executeMove({
              from: fromPos,
              to: toPos,
              piece: movingPiece,
              captured: capturedPiece,
            });
          }
        }
      } else if (event.type === RealtimeEventType.GAME_RESET) {
        resetGame();
      } else if (event.type === RealtimeEventType.REMATCH_REQUEST) {
        const currentWinner = latestStateRef.current.winner;
        showResultDialog(
          currentWinner,
          false,
          true,
          () => handleRequestRematchRef.current(),
          () => handleAcceptRematchRef.current()
        );
      } else if (event.type === RealtimeEventType.REMATCH_ACCEPT) {
        resetGame();
      } else if (event.type === RealtimeEventType.PLAYER_SURRENDER) {
        const surrenderingPlayer = (event.payload as { player: PlayerRole })?.player;
        const gameWinner: GameWinner =
          surrenderingPlayer === PlayerRole.X ? GameWinner.O : GameWinner.X;
        setGameWinner(gameWinner);
        showResultDialog(
          gameWinner,
          false,
          false,
          () => handleRequestRematchRef.current(),
          () => handleAcceptRematchRef.current()
        );
      } else if (event.type === RealtimeEventType.GAME_TIMEOUT_PASS_TURN) {
        passTurnTimeout();
      }
    },
    [
      board,
      executeMove,
      handleAcceptRematch,
      handleRequestRematch,
      passTurnTimeout,
      resetGame,
      setGameWinner,
      showResultDialog,
      winner,
    ]
  );

  const isMyTurn = myColor !== null && currentTurn === myColor;
  const canInteract = isMyTurn && isOpponentOnline && isGameStarted && !winner;

  // Turn Timer
  const { timeLeft, timeFraction, isWarning } = useTurnTimer({
    currentTurn,
    isGameActive: isOpponentOnline && isGameStarted && !winner,
    timeLimitSeconds: DEFAULT_XIANGQI_CONFIG.turnTimeoutSeconds,
    onTimeOut: async () => {
      if (isMyTurn) {
        passTurnTimeout();
        const nextRole = myRole === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
        await sendEvent({
          type: RealtimeEventType.GAME_TIMEOUT_PASS_TURN,
          payload: {
            player: myRole,
            nextTurn: nextRole,
            timestamp: Date.now(),
          },
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-game">
      {/* Header with players and room code */}
      <RoomHeader
        roomCode={roomCode}
        gameTitle="Xiangqi (Chinese Chess)"
        gameType="xiangqi"
        myRole={myRole}
        myProfile={myProfile}
        opponentProfile={opponentProfile}
        onRandomizeAvatar={randomizeAvatar}
        isOpponentOnline={isOpponentOnline}
        expectedOpponentRole={expectedOpponentRole}
        isSupabaseConfigured={isSupabaseConfigured}
        isGameActive={isOpponentOnline && !winner}
        onSurrender={promptSurrender}
      />

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 max-w-[1440px] mx-auto w-full gap-2.5 sm:gap-3">
        {/* Game Stage Content Container: Aligned uniformly with standard game board width */}
        <div className="w-full max-w-[540px] flex flex-col items-center gap-2.5 sm:gap-3">
          {/* Game Action Bar - Fixed height (h-8) avoids layout shifts */}
          <GameActionBar
            canSurrender={Boolean(isOpponentOnline && !winner)}
            onSurrender={promptSurrender}
            maxWidthClass="w-full"
          />

          {/* Live Scoreboard */}
          <div className="w-full">
            <XiangqiScoreboard
              currentTurn={currentTurn}
              myRole={myRole}
              myColor={myColor}
              winner={winner}
              myProfile={myProfile}
              opponentProfile={opponentProfile}
              isOpponentOnline={isOpponentOnline}
              timeLeft={timeLeft}
              timeFraction={timeFraction}
              isTimerWarning={isWarning}
              isInCheckColor={isInCheckColor}
              capturedByRed={capturedByRed}
              capturedByBlack={capturedByBlack}
              isGameStarted={isGameStarted}
              isHost={isHost}
              onStartGame={startGame}
            />
          </div>

          {/* Strategy Game Board */}
          <GameBoard gameType={GameType.XIANGQI}>
            <XiangqiBoard
              board={board}
              selectedPos={selectedPos}
              validMoves={validMoves}
              lastMove={lastMove}
              myColor={myColor}
              isInCheckColor={isInCheckColor}
              canInteract={canInteract}
              onSelectPosition={handleSelectPosition}
            />
          </GameBoard>
        </div>
      </main>
    </div>
  );
}
