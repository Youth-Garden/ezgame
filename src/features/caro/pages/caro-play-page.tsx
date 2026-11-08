"use client";

import { useCallback, useEffect } from "react";
import { CaroBoard } from "../components/caro-board";
import { CaroScoreboard } from "../components/caro-scoreboard";
import { CaroPlayer, GameWinner } from "../types";
import { RoomHeader } from "@/shared/components/room-header";
import { Button } from "@/shared/components/ui/button";
import { PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { Icons } from "@/shared/icons";
import { GameBoard } from "@/shared/components/game-board";
import { GameType } from "@/shared/types/room";
import { useCaroGame } from "../hooks/use-caro-game";
import { useGameRoom } from "@/shared/hooks/use-game-room";

export function CaroPlayPage() {
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
    gameTitle: "Caro 15x15",
    defaultRoomCode: "CR-DEMO",
    onEventReceived: (event: RealtimeEvent) => handleRealtimeEvent(event),
    onSurrenderConfirmed: async () => {
      const winner: GameWinner =
        myRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
      setGameState((prev) => ({ ...prev, winner }));
      showResultDialog(winner, false, false);
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
    onShowResultDialog: (winner) => showResultDialog(winner),
    onDismissResultDialog: dismissResultDialog,
  });

  // Handle incoming broadcast events from peer
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case RealtimeEventType.REQUEST_ROOM_SYNC: {
          // A peer joined or refreshed: send them current authoritative board state
          if (gameState.moveCount > 0) {
            sendEventRef.current({
              type: RealtimeEventType.RESPONSE_CARO_SYNC,
              payload: {
                board: gameState.board,
                currentTurn: gameState.currentTurn,
                lastMove: gameState.lastMove,
                winner: gameState.winner,
                winningLine: gameState.winningLine,
                moveCount: gameState.moveCount,
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
          showResultDialog(gameState.winner, false, true);
          break;
        }

        case RealtimeEventType.REMATCH_ACCEPT: {
          resetGame(CaroPlayer.X);
          break;
        }

        case RealtimeEventType.PLAYER_SURRENDER: {
          const winner =
            event.payload.player === PlayerRole.X ? GameWinner.O : GameWinner.X;
          setGameState((prev) => ({ ...prev, winner }));
          showResultDialog(winner, false, false);
          break;
        }

        default:
          break;
      }
    },
    [applyMove, gameState, resetGame, setGameState, showResultDialog, sendEventRef]
  );

  // Turn permission calculation
  const isMyTurn =
    (gameState.currentTurn === CaroPlayer.X && myRole === PlayerRole.X) ||
    (gameState.currentTurn === CaroPlayer.O && myRole === PlayerRole.O);

  const canClick =
    isMyTurn && isOpponentOnline && !gameState.winner && (myRole as PlayerRole) !== PlayerRole.SPECTATOR;

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
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-6xl mx-auto w-full">
        {/* Game Tools & Quick Actions */}
        <div className="w-full max-w-[620px] flex items-center justify-end gap-2 mb-3">
          {!gameState.winner && (
            <Button
              variant="destructive"
              size="sm"
              onClick={promptSurrender}
              className="text-xs gap-1.5"
            >
              <Icons name="flag" size={14} />
              <span>Surrender</span>
            </Button>
          )}
        </div>

        {/* Live Caro Scoreboard directly on table */}
        <div className="mb-4 w-full max-w-[620px]">
          <CaroScoreboard
            currentTurn={gameState.currentTurn}
            myRole={myRole}
            myProfile={myProfile}
            opponentProfile={opponentProfile}
            isOpponentOnline={isOpponentOnline}
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
      </main>
    </div>
  );
}
