"use client";

import { useTranslations } from "next-intl";
import { GameScoreboard } from "@/shared/components/game-scoreboard";
import { Badge } from "@/shared/components/ui/badge";
import { GameWinner, PlayerRole } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { ChessPieceColor, ChessPieceType } from "../types";
import { PIECE_SYMBOLS } from "../utils/chess-display";

interface ChessScoreboardProps {
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
  isInCheckColor: ChessPieceColor | null;
  capturedWhite: ChessPieceType[]; // Pieces captured from White
  capturedBlack: ChessPieceType[]; // Pieces captured from Black
}

function CapturedPiecesList({
  pieces,
  color,
}: {
  pieces: ChessPieceType[];
  color: ChessPieceColor;
}) {
  if (pieces.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 overflow-hidden max-w-[70px] xs:max-w-[85px] sm:max-w-[110px]">
      {pieces.slice(-5).map((pieceType, index) => (
        <span
          key={index}
          className="text-xs sm:text-sm font-serif leading-none opacity-85"
        >
          {PIECE_SYMBOLS[color][pieceType]}
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

export function ChessScoreboard({
  myRole,
  myProfile,
  opponentProfile,
  currentTurn,
  isOpponentOnline,
  timeLeft,
  timeFraction,
  isTimerWarning,
  winner,
  isInCheckColor,
  capturedWhite,
  capturedBlack,
}: ChessScoreboardProps) {
  const t = useTranslations("game");

  const isWhite = myRole === PlayerRole.X;
  const myChessColor = isWhite ? ChessPieceColor.WHITE : ChessPieceColor.BLACK;
  const oppChessColor = isWhite ? ChessPieceColor.BLACK : ChessPieceColor.WHITE;

  const isGameFinished = Boolean(winner);
  const isMyTurn = !isGameFinished && currentTurn === myRole;
  const isOpponentTurn =
    !isGameFinished && currentTurn !== myRole && isOpponentOnline;

  const myCapturedPieces = isWhite ? capturedBlack : capturedWhite;
  const oppCapturedPieces = isWhite ? capturedWhite : capturedBlack;

  const myName = myProfile?.name || t("you");
  const opponentName = opponentProfile?.name || t("opponent");

  return (
    <GameScoreboard.Root>
      {/* Player (You) */}
      <GameScoreboard.Left
        name={myName}
        avatarUrl={myProfile?.avatarUrl}
        fallbackText={isWhite ? "♔" : "♚"}
        isActiveTurn={isMyTurn}
        activeColor={isWhite ? "primary" : "destructive"}
        size="sm"
        timer={
          !isGameFinished
            ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 45 }
            : undefined
        }
        badge={
          <Badge
            variant="subtle"
            size="sm"
            className="shrink-0 font-bold px-1.5 py-0.5"
          >
            <span>{isWhite ? `${t("white")} (♔)` : `${t("black")} (♚)`}</span>
          </Badge>
        }
      >
        <CapturedPiecesList pieces={myCapturedPieces} color={oppChessColor} />
      </GameScoreboard.Left>

      {/* Center: Turn Info & In-Check Notice */}
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
        notice={
          !isGameFinished && isInCheckColor ? (
            <span className="text-[10px] sm:text-[11px] text-rose-500 dark:text-rose-400 font-extrabold tracking-tight text-center animate-pulse whitespace-nowrap mt-0.5">
              ⚡ {t("check")}
            </span>
          ) : null
        }
      />

      {/* Opponent */}
      <GameScoreboard.Right
        name={opponentName}
        avatarUrl={opponentProfile?.avatarUrl}
        fallbackText={!isWhite ? "♔" : "♚"}
        isActiveTurn={isOpponentTurn}
        activeColor={!isWhite ? "primary" : "destructive"}
        size="sm"
        timer={
          !isGameFinished
            ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 45 }
            : undefined
        }
        badge={
          <Badge
            variant="subtle"
            size="sm"
            className="shrink-0 font-bold px-1.5 py-0.5"
          >
            <span>{!isWhite ? `${t("white")} (♔)` : `${t("black")} (♚)`}</span>
          </Badge>
        }
      >
        <CapturedPiecesList pieces={oppCapturedPieces} color={myChessColor} />
      </GameScoreboard.Right>
    </GameScoreboard.Root>
  );
}
