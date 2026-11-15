import { useTranslations } from "next-intl";
import { BidaBall, BidaBallType } from "../types";
import { PlayerRole, type GameWinner } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";
import { GameScoreboard } from "@/shared/components/game-scoreboard";
import { SpreadPing } from "@/shared/components/spread-ping";
import { BidaBallItem } from "./bida-ball-item";

interface BidaScoreboardProps {
  currentTurn: PlayerRole.X | PlayerRole.O;
  myRole: PlayerRole;
  winner?: GameWinner | null;
  balls: BidaBall[];
  lastFoul?: string | null;
  assignedGroups?: {
    [PlayerRole.X]: BidaBallType | null;
    [PlayerRole.O]: BidaBallType | null;
  };
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
  isGameStarted?: boolean;
  isHost?: boolean;
  onStartGame?: () => void;
}


export function BidaScoreboard({
  currentTurn,
  myRole,
  winner,
  balls,
  lastFoul,
  assignedGroups,
  myProfile,
  opponentProfile,
  isOpponentOnline = false,
  timeLeft,
  timeFraction,
  isTimerWarning = false,
  isGameStarted = true,
  isHost = false,
  onStartGame,
}: BidaScoreboardProps) {
  const t = useTranslations("game");
  const isGameFinished = Boolean(winner);
  const isReadyToStart = isOpponentOnline && !isGameStarted && !isGameFinished;
  const isMyTurn = !isGameFinished && isGameStarted && currentTurn === myRole;

  const solidBalls = balls.filter((b) => b.type === BidaBallType.SOLIDS);
  const solidsRemaining = solidBalls.filter((b) => !b.isPocketed).length;
  const stripeBalls = balls.filter((b) => b.type === BidaBallType.STRIPES);
  const stripesRemaining = stripeBalls.filter((b) => !b.isPocketed).length;

  const eightBall = balls.find((b) => b.type === BidaBallType.EIGHT_BALL);
  const isEightBallPocketed = eightBall?.isPocketed;

  const isMeX = myRole !== PlayerRole.O;
  const myRoleKey = isMeX ? PlayerRole.X : PlayerRole.O;
  const opponentRoleKey = isMeX ? PlayerRole.O : PlayerRole.X;

  const myGroup = assignedGroups?.[myRoleKey] ?? null;
  const opponentGroup = assignedGroups?.[opponentRoleKey] ?? null;

  const myName = myProfile?.name || t("you");
  const opponentName = opponentProfile?.name || t("opponent");

  const isMyActiveTurn = !isGameFinished && isGameStarted && currentTurn === myRoleKey;
  const isOpponentActiveTurn = !isGameFinished && isGameStarted && currentTurn === opponentRoleKey;

  return (
    <GameScoreboard.Root>
      {/* Player (You) */}
      <GameScoreboard.Left
        name={myName}
        avatarUrl={myProfile?.avatarUrl}
        fallbackText={myName.slice(0, 1).toUpperCase()}
        isActiveTurn={isMyActiveTurn}
        activeColor="amber"
        timer={!isGameFinished && isGameStarted ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 45 } : undefined}
        badge={
          myGroup === null ? (
            <Badge variant="subtle" size="sm" className="shrink-0">
              {t("open")}
            </Badge>
          ) : (
            <Badge
              variant={myGroup === BidaBallType.SOLIDS ? "solids" : "stripes"}
              size="sm"
              className="shrink-0"
            >
              {myGroup === BidaBallType.SOLIDS
                ? `${t("solids")} ${7 - solidsRemaining}/7`
                : `${t("stripes")} ${7 - stripesRemaining}/7`}
            </Badge>
          )
        }
      >
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 px-2 py-1 rounded-full bg-secondary/50 dark:bg-muted/40 shrink-0">
          {(myGroup === BidaBallType.STRIPES ? stripeBalls : solidBalls).map((b) => (
            <BidaBallItem key={b.id} id={b.id} ball={b} size="sm" />
          ))}
        </div>
      </GameScoreboard.Left>

      {/* Center: Turn Info & Foul Notice */}
      <GameScoreboard.Center
        isWaiting={!isOpponentOnline && !isGameFinished}
        waitingText={t("waitingForOpponent")}
        turnText={
          isGameFinished ? (
            t("matchOver", { defaultMessage: "Trận đấu kết thúc" })
          ) : isReadyToStart ? (
            isHost ? (
              <Button
                variant="default"
                size="sm"
                onClick={onStartGame}
                className="text-[11px] sm:text-xs font-bold gap-1 px-3 py-1 shadow-md hover:scale-105 transition-transform"
              >
                <Icons name="check" size={13} />
                <span>{t("startGame")}</span>
              </Button>
            ) : (
              <Badge
                variant="warning"
                size="sm"
                className="whitespace-nowrap text-[10px] sm:text-xs px-2.5 py-1 font-bold inline-flex items-center gap-1.5"
              >
                <SpreadPing variant="amber" size="xs" />
                <span>{t("waitingForHost")}</span>
              </Badge>
            )
          ) : isMyTurn ? (
            t("yourTurn")
          ) : (
            t("opponentAiming")
          )
        }
        notice={
          !isGameFinished && isGameStarted ? (
            isEightBallPocketed ? (
              <span className="text-[10px] font-bold text-rose-500 uppercase">
                🎱 8-Ball Pocketed
              </span>
            ) : lastFoul ? (
              <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold tracking-tight text-center animate-in fade-in duration-150">
                ⚠️ {lastFoul}
              </span>
            ) : null
          ) : null
        }
      />

      {/* Opponent */}
      <GameScoreboard.Right
        name={opponentName}
        avatarUrl={opponentProfile?.avatarUrl}
        fallbackText={opponentName.slice(0, 1).toUpperCase()}
        isActiveTurn={isOpponentActiveTurn}
        activeColor="sky"
        timer={!isGameFinished && isGameStarted ? { timeLeft, timeFraction, isWarning: isTimerWarning, totalTime: 45 } : undefined}
        badge={
          opponentGroup === null ? (
            <Badge variant="subtle" size="sm" className="shrink-0">
              {t("open")}
            </Badge>
          ) : (
            <Badge
              variant={opponentGroup === BidaBallType.STRIPES ? "stripes" : "solids"}
              size="sm"
              className="shrink-0"
            >
              {opponentGroup === BidaBallType.STRIPES
                ? `${t("stripes")} ${7 - stripesRemaining}/7`
                : `${t("solids")} ${7 - solidsRemaining}/7`}
            </Badge>
          )
        }
      >
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 px-2 py-1 rounded-full bg-secondary/50 dark:bg-muted/40 shrink-0">
          {(opponentGroup === BidaBallType.SOLIDS ? solidBalls : stripeBalls).map((b) => (
            <BidaBallItem key={b.id} id={b.id} ball={b} size="sm" />
          ))}
        </div>
      </GameScoreboard.Right>
    </GameScoreboard.Root>
  );
}
