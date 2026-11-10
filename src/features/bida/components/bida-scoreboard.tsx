import { useTranslations } from "next-intl";
import { BidaBall, BidaBallType } from "../types";
import { PlayerRole } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { PlayerAvatar } from "@/shared/components/player-avatar";

interface BidaScoreboardProps {
  currentTurn: PlayerRole.X | PlayerRole.O;
  myRole: PlayerRole;
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
  isTimerWarning?: boolean;
}

function ScoreboardBallItem({ ball }: { ball: BidaBall }) {
  const isPocketed = ball.isPocketed;

  return (
    <div
      title={`Ball #${ball.id} ${isPocketed ? "(Pocketed)" : "(On Table)"}`}
      className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
        isPocketed
          ? "opacity-20 scale-75 grayscale contrast-50 brightness-75"
          : "opacity-100 scale-100 hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
      }`}
    >
      <img
        src={`/games/bida/ball-${ball.id}.svg`}
        alt={`Ball ${ball.id}`}
        className="w-full h-full object-contain pointer-events-none select-none"
        loading="eager"
      />
    </div>
  );
}

export function BidaScoreboard({
  currentTurn,
  myRole,
  balls,
  lastFoul,
  assignedGroups,
  myProfile,
  opponentProfile,
  isOpponentOnline = false,
  timeLeft,
  isTimerWarning = false,
}: BidaScoreboardProps) {
  const t = useTranslations("game");
  const isMyTurn = currentTurn === myRole;

  const playerXGroup = assignedGroups?.[PlayerRole.X] ?? null;
  const playerOGroup = assignedGroups?.[PlayerRole.O] ?? null;

  // Solids (Balls 1-7) & Stripes (Balls 9-15)
  const solidBalls = balls.filter((b) => b.type === BidaBallType.SOLIDS);
  const solidsRemaining = solidBalls.filter((b) => !b.isPocketed).length;
  const stripeBalls = balls.filter((b) => b.type === BidaBallType.STRIPES);
  const stripesRemaining = stripeBalls.filter((b) => !b.isPocketed).length;

  const eightBall = balls.find((b) => b.type === BidaBallType.EIGHT_BALL);
  const isEightBallPocketed = eightBall?.isPocketed;

  // Authentic profiles for Player X and Player O
  const playerXProfile =
    myRole === PlayerRole.X
      ? myProfile
      : opponentProfile?.role === PlayerRole.X
      ? opponentProfile
      : opponentProfile;

  const playerOProfile =
    myRole === PlayerRole.O
      ? myProfile
      : opponentProfile?.role === PlayerRole.O
      ? opponentProfile
      : opponentProfile;

  const playerXName = playerXProfile?.name || (myRole === PlayerRole.X ? t("you") : t("opponent"));
  const playerOName = playerOProfile?.name || (myRole === PlayerRole.O ? t("you") : t("opponent"));

  return (
    <Card
      variant="solid"
      className="w-full flex items-center justify-between gap-1 sm:gap-4 px-3 sm:px-6 py-2.5 rounded-2xl shadow-none border-none select-none overflow-hidden"
    >
      {/* Player X (Left) */}
      <PlayerAvatar
        name={playerXName}
        avatarUrl={playerXProfile?.avatarUrl}
        fallbackText={playerXName.slice(0, 1).toUpperCase()}
        isActiveTurn={currentTurn === PlayerRole.X}
        activeColor="amber"
        align="left"
        timeLeft={currentTurn === PlayerRole.X ? timeLeft : undefined}
        totalTime={45}
        isTimerWarning={currentTurn === PlayerRole.X && isTimerWarning}
        subBadge={
          playerXGroup === null ? (
            <Badge variant="subtle" size="sm" className="shrink-0">
              {t("open")}
            </Badge>
          ) : (
            <Badge
              variant={playerXGroup === BidaBallType.SOLIDS ? "solids" : "stripes"}
              size="sm"
              className="shrink-0"
            >
              {playerXGroup === BidaBallType.SOLIDS
                ? `${t("solids")} ${7 - solidsRemaining}/7`
                : `${t("stripes")} ${7 - stripesRemaining}/7`}
            </Badge>
          )
        }
        contentBelow={
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 px-2 py-1 rounded-full bg-secondary/50 dark:bg-muted/40 shrink-0">
            {(playerXGroup === BidaBallType.STRIPES ? stripeBalls : solidBalls).map((b) => (
              <ScoreboardBallItem key={b.id} ball={b} />
            ))}
          </div>
        }
      />

      {/* Center Message Only - fixed height to prevent vertical board shift when foul/status appears */}
      <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4 min-h-[44px]">
        {!isOpponentOnline ? (
          <Badge variant="warning">
            {t("waitingForOpponent")}
          </Badge>
        ) : (
          <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight text-center animate-in fade-in duration-200">
            {isMyTurn ? t("yourTurn") : t("opponentAiming")}
          </span>
        )}

        <div className="h-4 flex items-center justify-center">
          {isEightBallPocketed ? (
            <span className="text-[10px] font-bold text-rose-500 uppercase">
              🎱 8-Ball Pocketed
            </span>
          ) : lastFoul ? (
            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold tracking-tight text-center animate-in fade-in duration-150">
              ⚠️ {lastFoul}
            </span>
          ) : null}
        </div>
      </div>

      {/* Player O (Right) */}
      <PlayerAvatar
        name={playerOName}
        avatarUrl={playerOProfile?.avatarUrl}
        fallbackText={playerOName.slice(0, 1).toUpperCase()}
        isActiveTurn={currentTurn === PlayerRole.O}
        activeColor="sky"
        align="right"
        timeLeft={currentTurn === PlayerRole.O ? timeLeft : undefined}
        totalTime={45}
        isTimerWarning={currentTurn === PlayerRole.O && isTimerWarning}
        subBadge={
          playerOGroup === null ? (
            <Badge variant="subtle" size="sm" className="shrink-0">
              {t("open")}
            </Badge>
          ) : (
            <Badge
              variant={playerOGroup === BidaBallType.STRIPES ? "stripes" : "solids"}
              size="sm"
              className="shrink-0"
            >
              {playerOGroup === BidaBallType.STRIPES
                ? `${t("stripes")} ${7 - stripesRemaining}/7`
                : `${t("solids")} ${7 - solidsRemaining}/7`}
            </Badge>
          )
        }
        contentBelow={
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 px-2 py-1 rounded-full bg-secondary/50 dark:bg-muted/40 shrink-0">
            {(playerOGroup === BidaBallType.SOLIDS ? solidBalls : stripeBalls).map((b) => (
              <ScoreboardBallItem key={b.id} ball={b} />
            ))}
          </div>
        }
      />
    </Card>
  );
}
