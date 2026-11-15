import { useTranslations } from "next-intl";
import { XiangqiColor, XiangqiPiece } from "../types";
import { PlayerRole, type GameWinner } from "@/shared/types/room";
import { PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Badge } from "@/shared/components/ui/badge";
import { GameScoreboard } from "@/shared/components/game-scoreboard";
import { getPieceDisplay } from "../utils/xiangqi-display";

interface XiangqiScoreboardProps {
  currentTurn: XiangqiColor;
  myRole: PlayerRole;
  myColor: XiangqiColor | null;
  winner?: GameWinner | null;
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
  isInCheckColor?: XiangqiColor | null;
  capturedByRed: XiangqiPiece[];
  capturedByBlack: XiangqiPiece[];
}

function CapturedPiecesList({ pieces }: { pieces: XiangqiPiece[] }) {
  if (pieces.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 overflow-hidden max-w-[70px] xs:max-w-[85px] sm:max-w-[110px]">
      {pieces.slice(-5).map((piece) => (
        <span
          key={piece.id}
          className={`text-[10px] sm:text-xs opacity-80 font-serif font-bold ${
            piece.color === XiangqiColor.RED
              ? "text-red-600 dark:text-red-400"
              : "text-slate-700 dark:text-slate-300"
          }`}
          title={getPieceDisplay(piece.type, piece.color).vietnameseName}
        >
          {getPieceDisplay(piece.type, piece.color).char}
        </span>
      ))}
    </div>
  );
}

export function XiangqiScoreboard({
  currentTurn,
  myRole,
  winner,
  myProfile,
  opponentProfile,
  isOpponentOnline = false,
  timeLeft,
  timeFraction,
  isTimerWarning = false,
  isInCheckColor = null,
  capturedByRed,
  capturedByBlack,
}: XiangqiScoreboardProps) {
  const t = useTranslations("game");

  const isMeRed = myRole !== PlayerRole.O;
  const myColor = isMeRed ? XiangqiColor.RED : XiangqiColor.BLACK;
  const opponentColor = isMeRed ? XiangqiColor.BLACK : XiangqiColor.RED;

  const myName = myProfile?.name || t("you");
  const opponentName = opponentProfile?.name || t("opponent");

  const isGameFinished = Boolean(winner);
  const isMyTurn = !isGameFinished && currentTurn === myColor;
  const isOpponentTurn = !isGameFinished && currentTurn === opponentColor;

  const myCapturedPieces = isMeRed ? capturedByRed : capturedByBlack;
  const opponentCapturedPieces = isMeRed ? capturedByBlack : capturedByRed;

  return (
    <GameScoreboard.Root>
      {/* Left: Player (You) */}
      <GameScoreboard.Left
        name={myName}
        avatarUrl={myProfile?.avatarUrl}
        fallbackText={isMeRed ? "R" : "B"}
        isActiveTurn={isMyTurn}
        activeColor={isMeRed ? "amber" : "sky"}
        timer={!isGameFinished ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 45 } : undefined}
        badge={
          <Badge
            variant="subtle"
            size="sm"
            className={`shrink-0 font-bold ${
              isMeRed
                ? "text-red-600 dark:text-red-400"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            {isMeRed ? `${t("red")} (先)` : `${t("black")} (後)`}
          </Badge>
        }
      >
        <CapturedPiecesList pieces={myCapturedPieces} />
      </GameScoreboard.Left>

      {/* Center: Turn Info & In-Check Notice */}
      <GameScoreboard.Center
        isWaiting={!isOpponentOnline && !isGameFinished}
        turnText={
          isGameFinished ? (
            <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              {t("matchOver", { defaultMessage: "Trận đấu kết thúc" })}
            </span>
          ) : (
            <Badge
              variant={isMyTurn ? "success" : "secondary"}
              size="sm"
              className={`whitespace-nowrap text-[10px] sm:text-xs px-2 sm:px-2.5 font-bold ${
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
              ⚡ CHIẾU TƯỚNG!
            </span>
          ) : null
        }
      />

      {/* Right: Opponent */}
      <GameScoreboard.Right
        name={opponentName}
        avatarUrl={opponentProfile?.avatarUrl}
        fallbackText={isMeRed ? "B" : "R"}
        isActiveTurn={isOpponentTurn}
        activeColor={isMeRed ? "sky" : "amber"}
        timer={!isGameFinished ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 45 } : undefined}
        badge={
          <Badge
            variant="subtle"
            size="sm"
            className={`shrink-0 font-bold ${
              isMeRed
                ? "text-slate-800 dark:text-slate-200"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isMeRed ? `${t("black")} (後)` : `${t("red")} (先)`}
          </Badge>
        }
      >
        <CapturedPiecesList pieces={opponentCapturedPieces} />
      </GameScoreboard.Right>
    </GameScoreboard.Root>
  );
}
