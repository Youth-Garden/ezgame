"use client";

import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { RoomHeader } from "@/shared/components/room-header";
import { GameBoard } from "@/shared/components/game-board";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";
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
  } = useGameRoom({
    gameTitle: DEFAULT_XIANGQI_CONFIG.title,
    defaultRoomCode: DEFAULT_XIANGQI_CONFIG.defaultRoomCode,
    onEventReceived: (event: RealtimeEvent) => handleRealtimeEvent(event),
    onSurrenderConfirmed: async () => {
      const gameWinner: GameWinner =
        myRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
      showResultDialog(gameWinner, false, false);
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
    myColor,
    isInCheckColor,
    handleSelectPosition,
    executeMove,
    resetGame,
    passTurnTimeout,
  } = useXiangqiGame({
    myRole,
    sendEvent: async (e) => sendEventRef.current(e),
    onShowResultDialog: (win) => showResultDialog(win),
    onDismissResultDialog: dismissResultDialog,
  });

  const latestStateRef = useRef({ board, currentTurn, winner });
  latestStateRef.current = { board, currentTurn, winner };

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
      } else if (event.type === RealtimeEventType.PLAYER_SURRENDER) {
        const surrenderingPlayer = (event.payload as { player: PlayerRole })?.player;
        const gameWinner: GameWinner =
          surrenderingPlayer === PlayerRole.X ? GameWinner.O : GameWinner.X;
        showResultDialog(gameWinner, false, false);
      } else if (event.type === RealtimeEventType.GAME_TIMEOUT_PASS_TURN) {
        passTurnTimeout();
      }
    },
    [board, executeMove, passTurnTimeout, resetGame, showResultDialog]
  );

  const isMyTurn = myColor !== null && currentTurn === myColor;
  const canInteract = isMyTurn && isOpponentOnline && !winner;

  // Turn Timer
  const { timeLeft, timeFraction, isWarning } = useTurnTimer({
    currentTurn,
    isGameActive: isOpponentOnline && !winner,
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
        {/* Quick Actions */}
        <div className="w-full max-w-[520px] flex items-center justify-end gap-2">
          {!winner && (
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

        {/* Live Scoreboard */}
        <div className="w-full max-w-[520px]">
          <XiangqiScoreboard
            currentTurn={currentTurn}
            myRole={myRole}
            myColor={myColor}
            myProfile={myProfile}
            opponentProfile={opponentProfile}
            isOpponentOnline={isOpponentOnline}
            timeLeft={timeLeft}
            timeFraction={timeFraction}
            isTimerWarning={isWarning}
            isInCheckColor={isInCheckColor}
            capturedByRed={capturedByRed}
            capturedByBlack={capturedByBlack}
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
      </main>
    </div>
  );
}
