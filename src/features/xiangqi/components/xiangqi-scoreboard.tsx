import { useTranslations } from "next-intl";
import { XiangqiColor, XiangqiPiece } from "../types";
import { PlayerRole } from "@/shared/types/room";
import { PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PlayerAvatar } from "@/shared/components/player-avatar";
import { getPieceDisplay } from "../utils/xiangqi-display";

interface XiangqiScoreboardProps {
  currentTurn: XiangqiColor;
  myRole: PlayerRole;
  myColor: XiangqiColor | null;
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

export function XiangqiScoreboard({
  currentTurn,
  myRole,
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

  // Player X is RED (goes first), Player O is BLACK
  const redPlayerName = myRole === PlayerRole.X ? myProfile?.name : opponentProfile?.name || "Player Red";
  const blackPlayerName = myRole === PlayerRole.O ? myProfile?.name : opponentProfile?.name || "Player Black";

  return (
    <Card
      variant="solid"
      className="w-full flex items-center justify-between gap-1 sm:gap-4 px-3 sm:px-6 py-2.5 rounded-2xl shadow-none border-none select-none overflow-hidden"
    >
      {/* Red Player Avatar (Left) */}
      <PlayerAvatar
        name={redPlayerName}
        avatarUrl={myRole === PlayerRole.X ? myProfile?.avatarUrl : opponentProfile?.avatarUrl}
        fallbackText="R"
        isActiveTurn={currentTurn === XiangqiColor.RED}
        activeColor="amber"
        align="left"
        badgePosition="below"
        timeLeft={currentTurn === XiangqiColor.RED ? timeLeft : undefined}
        timeFraction={currentTurn === XiangqiColor.RED ? timeFraction : undefined}
        totalTime={45}
        isTimerWarning={currentTurn === XiangqiColor.RED && isTimerWarning}
        subBadge={
          <Badge variant="subtle" size="sm" className="shrink-0 text-red-600 dark:text-red-400 font-bold">
            {t("red")} (先)
          </Badge>
        }
        contentBelow={
          <div className="flex items-center gap-0.5 mt-1 max-w-[120px] overflow-hidden">
            {capturedByRed.slice(-6).map((piece) => (
              <span
                key={piece.id}
                className="text-xs opacity-75 font-serif font-bold text-slate-700 dark:text-slate-300"
                title={getPieceDisplay(piece.type, piece.color).vietnameseName}
              >
                {getPieceDisplay(piece.type, piece.color).char}
              </span>
            ))}
          </div>
        }
      />

      {/* Center Message Only - fixed height to prevent vertical board shift */}
      <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4 min-h-[44px]">
        {!isOpponentOnline ? (
          <Badge variant="warning">{t("waitingForOpponent")}</Badge>
        ) : (
          <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight text-center animate-in fade-in duration-200">
            {currentTurn === XiangqiColor.RED ? `${redPlayerName} đi` : `${blackPlayerName} đi`}
          </span>
        )}

        <div className="h-4 flex items-center justify-center">
          {isInCheckColor && (
            <span className="text-[11px] text-rose-500 dark:text-rose-400 font-extrabold tracking-wide text-center animate-pulse">
              ⚡ CHIẾU TƯỚNG! ({isInCheckColor === XiangqiColor.RED ? "ĐỎ" : "ĐEN"})
            </span>
          )}
        </div>
      </div>

      {/* Black Player Avatar (Right) */}
      <PlayerAvatar
        name={blackPlayerName}
        avatarUrl={myRole === PlayerRole.O ? myProfile?.avatarUrl : opponentProfile?.avatarUrl}
        fallbackText="B"
        isActiveTurn={currentTurn === XiangqiColor.BLACK}
        activeColor="sky"
        align="right"
        badgePosition="below"
        timeLeft={currentTurn === XiangqiColor.BLACK ? timeLeft : undefined}
        timeFraction={currentTurn === XiangqiColor.BLACK ? timeFraction : undefined}
        totalTime={45}
        isTimerWarning={currentTurn === XiangqiColor.BLACK && isTimerWarning}
        subBadge={
          <Badge variant="subtle" size="sm" className="shrink-0 text-slate-800 dark:text-slate-200 font-bold">
            {t("black")} (後)
          </Badge>
        }
        contentBelow={
          <div className="flex items-center gap-0.5 mt-1 max-w-[120px] overflow-hidden justify-end">
            {capturedByBlack.slice(-6).map((piece) => (
              <span
                key={piece.id}
                className="text-xs opacity-75 font-serif font-bold text-red-600 dark:text-red-400"
                title={getPieceDisplay(piece.type, piece.color).vietnameseName}
              >
                {getPieceDisplay(piece.type, piece.color).char}
              </span>
            ))}
          </div>
        }
      />
    </Card>
  );
}
