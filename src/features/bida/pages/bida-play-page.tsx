"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RoomHeader } from "@/shared/components/room-header";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";
import { GameBoard } from "@/shared/components/game-board";
import { GameType, PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { BidaTable } from "../components/bida-table";
import { BidaScoreboard } from "../components/bida-scoreboard";
import { GameWinner } from "@/features/caro/types";
import { useBidaGame } from "../hooks/use-bida-game";
import { useGameRoom } from "@/shared/hooks/use-game-room";
import type { BidaBall } from "../types";

export function BidaPlayPage() {
  const t = useTranslations("game");
  const [isVertical, setIsVertical] = useState(false);

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
    gameTitle: "Pocket Billiards (8-Ball)",
    defaultRoomCode: "BD-DEMO",
    onEventReceived: (event: RealtimeEvent) => handleRealtimeEvent(event),
    onSurrenderConfirmed: async () => {
      const winner: GameWinner =
        myRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
      showResultDialog(winner, false, false);
      await sendEvent({
        type: RealtimeEventType.PLAYER_SURRENDER,
        payload: { player: myRole },
      });
    },
  });

  // Custom Game Hook encapsulating Matter.js physics, turns, and authoritative sync
  const {
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
  } = useBidaGame({
    myRole,
    sendEvent: async (e) => sendEventRef.current(e),
    onShowResultDialog: (winner) => showResultDialog(winner),
    onDismissResultDialog: dismissResultDialog,
  });

  // Unified latest state refs to prevent stale closure in handleRealtimeEvent
  const latestGameStateRef = useRef({
    isBreakShot,
    balls,
    currentTurn,
    assignedGroups,
    lastFoul,
  });
  latestGameStateRef.current = {
    isBreakShot,
    balls,
    currentTurn,
    assignedGroups,
    lastFoul,
  };

  // Handle incoming Supabase realtime events
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      const {
        isBreakShot: currentIsBreak,
        balls: currentBalls,
        currentTurn: activeTurn,
        assignedGroups: currentGroups,
        lastFoul: currentFoul,
      } = latestGameStateRef.current;

      if (event.type === RealtimeEventType.REQUEST_ROOM_SYNC) {
        // Opponent joined or refreshed (F5): broadcast current authoritative bida state back to them
        if (!currentIsBreak || currentBalls.some((b: BidaBall) => b.isPocketed)) {
          sendEventRef.current({
            type: RealtimeEventType.RESPONSE_BIDA_SYNC,
            payload: {
              balls: currentBalls.map((b: BidaBall) => ({
                id: b.id,
                x: b.x,
                y: b.y,
                isPocketed: b.isPocketed,
              })),
              currentTurn: activeTurn,
              assignedGroups: currentGroups,
              winner: null,
              foulMessage: currentFoul,
              timestamp: Date.now(),
            },
          }).catch((err) => console.error("Failed to respond to bida sync request:", err));
        }
      } else if (
        event.type === RealtimeEventType.BIDA_STATE_SYNC ||
        event.type === RealtimeEventType.RESPONSE_BIDA_SYNC
      ) {
        applyAuthoritativeSync({
          balls: event.payload.balls as BidaBall[],
          currentTurn: event.payload.currentTurn,
          assignedGroups: event.payload.assignedGroups,
          winner: event.payload.winner,
          foulMessage: event.payload.foulMessage,
        });
      } else if (event.type === RealtimeEventType.BIDA_SHOT) {
        if (event.payload.player !== myRole) {
          applyShot(
            event.payload.player,
            event.payload.cueAngle,
            event.payload.power,
            event.payload.cueBallX,
            event.payload.cueBallY,
            event.payload.englishX ?? 0,
            event.payload.englishY ?? 0
          );
        }
      } else if (event.type === RealtimeEventType.GAME_RESET) {
        resetGame(event.payload.startingPlayer);
      } else if (event.type === RealtimeEventType.REMATCH_REQUEST) {
        showResultDialog(null, false, true);
      } else if (event.type === RealtimeEventType.REMATCH_ACCEPT) {
        resetGame(event.payload.acceptedBy === PlayerRole.X ? PlayerRole.O : PlayerRole.X);
      } else if (event.type === RealtimeEventType.PLAYER_SURRENDER) {
        const winner =
          event.payload.player === PlayerRole.X ? GameWinner.O : GameWinner.X;
        showResultDialog(winner, false, false);
      }
    },
    [
      myRole,
      applyShot,
      applyAuthoritativeSync,
      resetGame,
      showResultDialog,
      sendEventRef,
    ]
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-game">
      {/* Header with players and room code */}
      <RoomHeader
        roomCode={roomCode}
        gameTitle="Pocket Billiards (8-Ball)"
        gameType="bida"
        myRole={myRole}
        myProfile={myProfile}
        opponentProfile={opponentProfile}
        onRandomizeAvatar={randomizeAvatar}
        isOpponentOnline={isOpponentOnline}
        expectedOpponentRole={expectedOpponentRole}
        isSupabaseConfigured={isSupabaseConfigured}
        isGameActive={isOpponentOnline}
      />

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 max-w-[1440px] mx-auto w-full gap-2.5 sm:gap-3">
        {/* Game Tools & Quick Actions */}
        <div className="w-full max-w-[1360px] flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsVertical((prev) => !prev)}
            className="text-xs gap-1.5"
            title="Toggle table orientation (horizontal / vertical)"
          >
            <Icons name="arrow-up-right" size={14} />
            <span>{isVertical ? t("horizontalView") : t("verticalView")}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={promptSurrender}
            className="text-xs gap-1.5"
          >
            <Icons name="flag" size={14} />
            <span>{t("surrender")}</span>
          </Button>
        </div>

        {/* Live Scoreboard */}
        <div className="w-full max-w-[1360px]">
          <BidaScoreboard
            currentTurn={currentTurn}
            myRole={myRole}
            balls={balls}
            lastFoul={lastFoul}
            assignedGroups={assignedGroups}
            myProfile={myProfile}
            opponentProfile={opponentProfile}
            isOpponentOnline={isOpponentOnline}
          />
        </div>

        {/* Polymorphic Strategy Board Container */}
        <GameBoard gameType={GameType.BIDA}>
          <BidaTable
            balls={balls}
            isMyTurn={currentTurn === myRole}
            turnState={turnState}
            currentRole={myRole}
            myGroup={(myRole === PlayerRole.X || myRole === PlayerRole.O) ? assignedGroups[myRole] : null}
            isVertical={isVertical}
            isOpponentOnline={isOpponentOnline}
            onFireShot={fireShot}
          />
        </GameBoard>
      </main>
    </div>
  );
}
