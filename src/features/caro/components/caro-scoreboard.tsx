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
}

export function CaroScoreboard({
  currentTurn,
  myRole,
  myProfile,
  opponentProfile,
  isOpponentOnline = false,
}: CaroScoreboardProps) {
  const isMyTurn = (currentTurn as unknown as PlayerRole) === myRole;

  // Profile mapping: Player X vs Player O
  const playerXProfile = myRole === PlayerRole.X ? myProfile : opponentProfile;
  const playerOProfile = myRole === PlayerRole.O ? myProfile : opponentProfile;

  return (
    <Card
      variant="solid"
      className="w-full flex items-center justify-between gap-3 px-5 py-3 rounded-2xl shadow-none border-none select-none transition-all"
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
      />

      {/* Turn indicator in the middle */}
      <div className="flex flex-col items-center justify-center shrink-0">
        {!isOpponentOnline ? (
          <Badge variant="warning">
            Waiting for Opponent...
          </Badge>
        ) : (
          <Badge
            variant={isMyTurn ? "success" : "secondary"}
            className={isMyTurn ? "animate-pulse" : ""}
          >
            {isMyTurn ? "Your turn" : "Opponent turn"}
          </Badge>
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
      />
    </Card>
  );
}
