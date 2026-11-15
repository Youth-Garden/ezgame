"use client";

import { useTranslations } from "next-intl";
import { GameScoreboard } from "@/shared/components/game-scoreboard";
import { Badge } from "@/shared/components/ui/badge";
import { GameWinner, PlayerRole } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { AnimalColor, AnimalType } from "../types";
import { ANIMAL_EMOJIS } from "../utils/animal-chess-rules";

interface AnimalChessScoreboardProps {
  myRole: PlayerRole;
  myProfile?: PlayerProfile;
  opponentProfile?: {
    name: string;
    avatarUrl: string;
    role: PlayerRole;
  } | null;
  currentTurn: PlayerRole.X | PlayerRole.O;
  isOpponentOnline: boolean;
  timeLeft: number;
  timeFraction: number;
  isTimerWarning: boolean;
  winner: GameWinner | null;
  capturedByBlue: AnimalType[]; // Captured from Red
  capturedByRed: AnimalType[];  // Captured from Blue
}

function CapturedAnimalsList({
  pieces,
  color,
}: {
  pieces: AnimalType[];
  color: AnimalColor;
}) {
  if (pieces.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 overflow-hidden max-w-[75px] xs:max-w-[90px] sm:max-w-[120px]">
      {pieces.slice(-5).map((type, idx) => (
        <span
          key={idx}
          className={`text-xs sm:text-sm drop-shadow-xs select-none ${
            color === AnimalColor.BLUE ? "text-blue-500" : "text-rose-500"
          }`}
        >
          {ANIMAL_EMOJIS[type]}
        </span>
      ))}
      {pieces.length > 5 && (
        <span className="text-[10px] font-bold text-muted-foreground ml-0.5">
          +{pieces.length - 5}
        </span>
      )}
    </div>
  );
}

export function AnimalChessScoreboard({
  myRole,
  myProfile,
  opponentProfile,
  currentTurn,
  isOpponentOnline,
  timeLeft,
  timeFraction,
  isTimerWarning,
  winner,
  capturedByBlue,
  capturedByRed,
}: AnimalChessScoreboardProps) {
  const t = useTranslations("game");

  const isBlue = myRole === PlayerRole.X;
  const myColor = isBlue ? AnimalColor.BLUE : AnimalColor.RED;
  const oppColor = isBlue ? AnimalColor.RED : AnimalColor.BLUE;

  const isGameFinished = Boolean(winner);
  const isMyTurn = !isGameFinished && currentTurn === myRole;
  const isOpponentTurn =
    !isGameFinished && currentTurn !== myRole && isOpponentOnline;

  const myCaptured = isBlue ? capturedByBlue : capturedByRed;
  const oppCaptured = isBlue ? capturedByRed : capturedByBlue;

  const myName = myProfile?.name || t("you");
  const opponentName = opponentProfile?.name || t("opponent");

  return (
    <GameScoreboard.Root>
      {/* Player (You) */}
      <GameScoreboard.Left
        name={myName}
        avatarUrl={myProfile?.avatarUrl}
        fallbackText={isBlue ? "🦁" : "🐯"}
        isActiveTurn={isMyTurn}
        activeColor={isBlue ? "sky" : "destructive"}
        size="sm"
        timer={
          !isGameFinished
            ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 30 }
            : undefined
        }
        badge={
          <Badge
            variant="subtle"
            size="sm"
            className="shrink-0 font-bold px-1.5 py-0.5"
          >
            <span>{isBlue ? `${t("blue")} (🦁)` : `${t("red")} (🐯)`}</span>
          </Badge>
        }
      >
        <CapturedAnimalsList pieces={myCaptured} color={oppColor} />
      </GameScoreboard.Left>

      {/* Center: Turn Info */}
      <GameScoreboard.Center
        isWaiting={!isOpponentOnline && !isGameFinished}
        waitingText={t("waitingForOpponent")}
        turnText={
          isGameFinished ? (
            <span className="text-xs font-bold text-muted-foreground">
              {t("matchOver", { defaultMessage: "Kết thúc" })}
            </span>
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
        fallbackText={!isBlue ? "🦁" : "🐯"}
        isActiveTurn={isOpponentTurn}
        activeColor={!isBlue ? "sky" : "destructive"}
        size="sm"
        timer={
          !isGameFinished
            ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 30 }
            : undefined
        }
        badge={
          <Badge
            variant="subtle"
            size="sm"
            className="shrink-0 font-bold px-1.5 py-0.5"
          >
            <span>{!isBlue ? `${t("blue")} (🦁)` : `${t("red")} (🐯)`}</span>
          </Badge>
        }
      >
        <CapturedAnimalsList pieces={oppCaptured} color={myColor} />
      </GameScoreboard.Right>
    </GameScoreboard.Root>
  );
}
