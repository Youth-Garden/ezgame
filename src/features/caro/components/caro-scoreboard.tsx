"use client";

import { PlayerRole } from "@/shared/types/room";
import { CaroPlayer } from "../types";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PlayerAvatar } from "@/shared/components/player-avatar";

interface CaroScoreboardProps {
  currentTurn: CaroPlayer;
  myRole: PlayerRole;
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

export function CaroScoreboard({
  currentTurn,
  myRole,
  myProfile,
  opponentProfile,
  isOpponentOnline = false,
  timeLeft,
  isTimerWarning = false,
}: CaroScoreboardProps) {
  const isMyTurn = (currentTurn as unknown as PlayerRole) === myRole;

  // Profile mapping: Player X vs Player O
  const playerXProfile = myRole === PlayerRole.X ? myProfile : opponentProfile;
  const playerOProfile = myRole === PlayerRole.O ? myProfile : opponentProfile;

  return (
    <Card
      variant="solid"
      className="w-full flex items-center justify-between gap-1 sm:gap-3 px-2 sm:px-5 py-2 sm:py-3 transition-all"
    >
      {/* Player X (Blue) */}
      <PlayerAvatar
        name={playerXProfile?.name}
        avatarUrl={playerXProfile?.avatarUrl}
        roleText="Player X"
        fallbackText="X"
        isActiveTurn={currentTurn === CaroPlayer.X}
        activeColor="primary"
        align="left"
        size="sm"
      />

      {/* Turn indicator & Countdown Timer in the middle */}
      <div className="flex flex-col items-center justify-center shrink-0 gap-1 px-1">
        {!isOpponentOnline ? (
          <Badge variant="warning" size="sm" className="whitespace-nowrap text-[9px] sm:text-[11px] px-2 sm:px-3">
            Waiting...
          </Badge>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge
              variant={isMyTurn ? "success" : "secondary"}
              size="sm"
              className={`whitespace-nowrap text-[9px] sm:text-[11px] px-2 sm:px-3 ${isMyTurn ? "animate-pulse" : ""}`}
            >
              {isMyTurn ? "Your turn" : "Opponent"}
            </Badge>

            {typeof timeLeft === "number" && (
              <Badge
                variant={isTimerWarning ? "destructive" : "secondary"}
                size="sm"
                className={`font-mono font-bold tracking-normal transition-all text-[9px] sm:text-[11px] px-1.5 sm:px-2 ${
                  isTimerWarning ? "animate-bounce" : ""
                }`}
              >
                ⏱️ {timeLeft}s
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Player O (Red) */}
      <PlayerAvatar
        name={playerOProfile?.name}
        avatarUrl={playerOProfile?.avatarUrl}
        roleText="Player O"
        fallbackText="O"
        isActiveTurn={currentTurn === CaroPlayer.O}
        activeColor="destructive"
        align="right"
        size="sm"
      />
    </Card>
  );
}
