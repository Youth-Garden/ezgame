import Image from "next/image";
import { useTranslations } from "next-intl";
import { BidaBall, BidaBallType } from "../types";
import { PlayerRole } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

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
}

function ScoreboardBallItem({ ball }: { ball: BidaBall }) {
  const isPocketed = ball.isPocketed;

  return (
    <div
      title={`Ball #${ball.id} ${isPocketed ? "(Pocketed)" : "(On Table)"}`}
      className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
        isPocketed
          ? "opacity-20 scale-75 grayscale contrast-50 brightness-75"
          : "opacity-100 scale-100 shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:scale-110"
      }`}
    >
      <img
        src={`/games/bida/ball-${ball.id}.svg`}
        alt={`Ball ${ball.id}`}
        className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
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

  // Determine which profile belongs to Player X and Player O based on authentic roles
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

  return (
    <Card
      variant="solid"
      className="w-full flex items-center justify-between gap-1 sm:gap-4 px-3 sm:px-6 py-2 rounded-2xl shadow-none border-none select-none overflow-hidden"
    >
      {/* Player X Pod */}
      <div
        className={`flex items-center gap-2 sm:gap-3 min-w-0 transition-all duration-300 ${
          currentTurn === PlayerRole.X ? "scale-102 opacity-100" : "opacity-60"
        }`}
      >
        <div className="relative shrink-0">
          <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden bg-muted shadow-md flex items-center justify-center transition-all ${
            currentTurn === PlayerRole.X ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-background" : ""
          }`}>
            {playerXProfile?.avatarUrl ? (
              <Image
                src={playerXProfile.avatarUrl}
                alt="Player X"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-xs font-black text-amber-500">X</span>
            )}
          </div>
          {currentTurn === PlayerRole.X && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center text-[7px] font-black text-neutral-950">
              ✓
            </span>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-foreground max-w-[90px] sm:max-w-[130px] truncate">
              {playerXProfile?.name || (myRole === PlayerRole.X ? t("you") : t("opponent"))}
            </span>
            <Badge variant="solids" size="sm" className="shrink-0">
              {playerXGroup === null ? t("open") : playerXGroup === BidaBallType.SOLIDS ? `${t("solids")} ${7 - solidsRemaining}/7` : `${t("stripes")} ${7 - stripesRemaining}/7`}
            </Badge>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-secondary/40 max-w-full overflow-hidden">
            {(playerXGroup === BidaBallType.STRIPES ? stripeBalls : solidBalls).map((b) => (
              <ScoreboardBallItem key={b.id} ball={b} />
            ))}
          </div>
        </div>
      </div>

      {/* Center Turn Banner */}
      <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          {!isOpponentOnline ? (
            <Badge variant="warning">
              {t("waitingForOpponent")}
            </Badge>
          ) : (
            <Badge
              variant={isMyTurn ? "success" : "secondary"}
              className={isMyTurn ? "animate-pulse" : ""}
            >
              {isMyTurn ? t("yourTurn") : t("opponentTurn")}
            </Badge>
          )}
          {isEightBallPocketed && (
            <Badge variant="secondary" size="sm">
              8 IN
            </Badge>
          )}
        </div>

        {lastFoul && (
          <span className="text-[10px] text-rose-400 mt-1 font-bold tracking-tight">
            ⚠️ {lastFoul}
          </span>
        )}
      </div>

      {/* Player O Pod */}
      <div
        className={`flex items-center gap-2.5 sm:gap-3 min-w-0 transition-all duration-300 ${
          currentTurn === PlayerRole.O ? "scale-102 opacity-100" : "opacity-60"
        }`}
      >
        <div className="flex flex-col items-end min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge variant="stripes" size="sm" className="shrink-0">
              {playerOGroup === null ? t("open") : playerOGroup === BidaBallType.STRIPES ? `${t("stripes")} ${7 - stripesRemaining}/7` : `${t("solids")} ${7 - solidsRemaining}/7`}
            </Badge>
            <span className="text-xs font-bold text-foreground max-w-[90px] sm:max-w-[130px] truncate">
              {playerOProfile?.name || (myRole === PlayerRole.O ? t("you") : t("opponent"))}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-secondary/40 max-w-full overflow-hidden">
            {(playerOGroup === BidaBallType.SOLIDS ? solidBalls : stripeBalls).map((b) => (
              <ScoreboardBallItem key={b.id} ball={b} />
            ))}
          </div>
        </div>

        <div className="relative shrink-0">
          <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden bg-muted shadow-md flex items-center justify-center transition-all ${
            currentTurn === PlayerRole.O ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-background" : ""
          }`}>
            {playerOProfile?.avatarUrl ? (
              <Image
                src={playerOProfile.avatarUrl}
                alt="Player O"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-xs font-black text-sky-500">O</span>
            )}
          </div>
          {currentTurn === PlayerRole.O && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-background flex items-center justify-center text-[7px] font-black text-neutral-950">
              ✓
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
