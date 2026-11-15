"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PlayerAvatar } from "@/shared/components/player-avatar";

/* -------------------------------------------------------------------------- */
/* Root Component                                                             */
/* -------------------------------------------------------------------------- */

export interface ScoreboardRootProps {
  children: ReactNode;
  className?: string;
}

function ScoreboardRoot({ children, className }: ScoreboardRootProps) {
  return (
    <Card
      variant="solid"
      className={`w-full flex items-center justify-between gap-1 sm:gap-4 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-none border-none select-none overflow-hidden min-h-[58px] sm:min-h-[66px] ${
        className || ""
      }`}
    >
      {children}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Player Slot (Left / Right)                                                 */
/* -------------------------------------------------------------------------- */

export interface ScoreboardPlayerProps {
  name?: string;
  avatarUrl?: string;
  roleText?: string;
  fallbackText?: string;
  isActiveTurn?: boolean;
  activeColor?: "amber" | "sky" | "primary" | "destructive";
  badge?: ReactNode;
  timer?: {
    timeLeft?: number;
    timeFraction?: number;
    totalTime?: number;
    isWarning?: boolean;
  };
  size?: "default" | "sm";
  children?: ReactNode; // Custom content below (e.g. captured pieces, balls)
}

function ScoreboardLeft({
  name,
  avatarUrl,
  roleText,
  fallbackText = "P",
  isActiveTurn = false,
  activeColor = "amber",
  badge,
  timer,
  size = "default",
  children,
}: ScoreboardPlayerProps) {
  const t = useTranslations("game");
  const displayName = name || t("you");

  return (
    <PlayerAvatar
      name={displayName}
      avatarUrl={avatarUrl}
      roleText={roleText}
      fallbackText={fallbackText || displayName.slice(0, 1).toUpperCase()}
      isActiveTurn={isActiveTurn}
      activeColor={activeColor}
      align="left"
      badgePosition="below"
      size={size}
      subBadge={badge}
      contentBelow={children}
      timeLeft={isActiveTurn ? timer?.timeLeft : undefined}
      timeFraction={isActiveTurn ? timer?.timeFraction : undefined}
      totalTime={timer?.totalTime || 45}
      isTimerWarning={isActiveTurn && timer?.isWarning}
    />
  );
}

function ScoreboardRight({
  name,
  avatarUrl,
  roleText,
  fallbackText = "O",
  isActiveTurn = false,
  activeColor = "sky",
  badge,
  timer,
  size = "default",
  children,
}: ScoreboardPlayerProps) {
  const t = useTranslations("game");
  const displayName = name || t("opponent");

  return (
    <PlayerAvatar
      name={displayName}
      avatarUrl={avatarUrl}
      roleText={roleText}
      fallbackText={fallbackText || displayName.slice(0, 1).toUpperCase()}
      isActiveTurn={isActiveTurn}
      activeColor={activeColor}
      align="right"
      badgePosition="below"
      size={size}
      subBadge={badge}
      contentBelow={children}
      timeLeft={isActiveTurn ? timer?.timeLeft : undefined}
      timeFraction={isActiveTurn ? timer?.timeFraction : undefined}
      totalTime={timer?.totalTime || 45}
      isTimerWarning={isActiveTurn && timer?.isWarning}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Center Status Slot                                                         */
/* -------------------------------------------------------------------------- */

export interface ScoreboardCenterProps {
  isWaiting?: boolean;
  waitingText?: string;
  turnText?: ReactNode;
  notice?: ReactNode;
  children?: ReactNode;
}

function ScoreboardCenter({
  isWaiting = false,
  waitingText,
  turnText,
  notice,
  children,
}: ScoreboardCenterProps) {
  const t = useTranslations("game");

  return (
    <div className="flex-1 flex flex-col items-center justify-center shrink min-w-0 px-1 sm:px-4 text-center">
      {children ? (
        children
      ) : isWaiting ? (
        <Badge variant="warning" className="truncate max-w-[130px] sm:max-w-none text-[10px] sm:text-xs">
          {waitingText || t("waitingForOpponent")}
        </Badge>
      ) : (
        <div className="text-[11px] sm:text-sm font-bold text-foreground tracking-tight text-center animate-in fade-in duration-200 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
          {turnText}
        </div>
      )}

      {notice && (
        <div className="mt-0.5 flex items-center justify-center truncate max-w-full">
          {notice}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Compound Component Export                                                  */
/* -------------------------------------------------------------------------- */

export const GameScoreboard = {
  Root: ScoreboardRoot,
  Left: ScoreboardLeft,
  Right: ScoreboardRight,
  Center: ScoreboardCenter,
};
