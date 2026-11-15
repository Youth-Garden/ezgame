"use client";

import { useTranslations } from "next-intl";
import { PlayerRole } from "@/shared/types/room";
import { CaroPlayer } from "../types";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Badge } from "@/shared/components/ui/badge";
import { GameScoreboard } from "@/shared/components/game-scoreboard";
import { CaroPieceMark } from "./caro-piece-mark";

interface CaroScoreboardProps {
  currentTurn: CaroPlayer;
  myRole: PlayerRole;
  winner?: CaroPlayer | null;
  myProfile?: PlayerProfile;
  opponentProfile?: {
    name: string;
    avatarUrl: string;
    role: PlayerRole;
  } | null;
  isOpponentOnline?: boolean;
  timeLeft?: number;
  timeFraction?: number;
  isTimerWarning?: boolean;
}

export function CaroScoreboard({
  currentTurn,
  myRole,
  winner,
  myProfile,
  opponentProfile,
  isOpponentOnline = false,
  timeLeft,
  timeFraction,
  isTimerWarning = false,
}: CaroScoreboardProps) {
  const t = useTranslations("game");
  const isGameFinished = Boolean(winner);
  const isMyTurn = !isGameFinished && (currentTurn as unknown as PlayerRole) === myRole;

  const isMeX = myRole !== PlayerRole.O;
  const myTurnRole = isMeX ? CaroPlayer.X : CaroPlayer.O;
  const opponentTurnRole = isMeX ? CaroPlayer.O : CaroPlayer.X;

  const isMeActiveTurn = !isGameFinished && currentTurn === myTurnRole;
  const isOpponentActiveTurn = !isGameFinished && currentTurn === opponentTurnRole;

  const myName = myProfile?.name || t("you");
  const opponentName = opponentProfile?.name || t("opponent");

  return (
    <GameScoreboard.Root>
      {/* Player (You) */}
      <GameScoreboard.Left
        name={myName}
        avatarUrl={myProfile?.avatarUrl}
        fallbackText={isMeX ? "X" : "O"}
        isActiveTurn={isMeActiveTurn}
        activeColor={isMeX ? "primary" : "destructive"}
        size="sm"
        timer={!isGameFinished ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 30 } : undefined}
        badge={
          <Badge variant="subtle" size="sm" className="gap-1 shrink-0 font-bold px-1.5 py-0.5">
            <CaroPieceMark value={myTurnRole} size="xs" />
            <span>{isMeX ? "Player X" : "Player O"}</span>
          </Badge>
        }
      />

      {/* Turn indicator in the middle */}
      <GameScoreboard.Center
        isWaiting={!isOpponentOnline && !isGameFinished}
        waitingText={t("waiting")}
        turnText={
          isGameFinished ? (
            <span className="text-xs font-bold text-muted-foreground">{t("matchOver", { defaultMessage: "Kết thúc" })}</span>
          ) : (
            <Badge
              variant={isMyTurn ? "success" : "secondary"}
              size="sm"
              className={`whitespace-nowrap text-[9px] sm:text-[11px] px-2 sm:px-3 ${
                isMyTurn ? "animate-pulse" : ""
              }`}
            >
              {isMyTurn ? t("yourTurn") : t("opponentTurn")}
            </Badge>
          )
        }
      />

      {/* Opponent */}
      <GameScoreboard.Right
        name={opponentName}
        avatarUrl={opponentProfile?.avatarUrl}
        fallbackText={isMeX ? "O" : "X"}
        isActiveTurn={isOpponentActiveTurn}
        activeColor={isMeX ? "destructive" : "primary"}
        size="sm"
        timer={!isGameFinished ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 30 } : undefined}
        badge={
          <Badge variant="subtle" size="sm" className="gap-1 shrink-0 font-bold px-1.5 py-0.5">
            <CaroPieceMark value={opponentTurnRole} size="xs" />
            <span>{isMeX ? "Player O" : "Player X"}</span>
          </Badge>
        }
      />
    </GameScoreboard.Root>
  );
}
