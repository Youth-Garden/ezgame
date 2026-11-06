"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX, Users } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";
import { Button } from "@/shared/components/ui/button";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole } from "@/shared/types/room";

interface RoomHeaderProps {
  roomCode: string;
  gameTitle: string;
  myRole: PlayerRole;
  isOpponentOnline: boolean;
  expectedOpponentRole: PlayerRole;
  isSupabaseConfigured: boolean;
}

export function RoomHeader({
  roomCode,
  gameTitle,
  myRole,
  isOpponentOnline,
  expectedOpponentRole,
  isSupabaseConfigured,
}: RoomHeaderProps) {
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());

  const toggleSound = () => {
    const nextState = !soundOn;
    sounds.setEnabled(nextState);
    setSoundOn(nextState);
  };

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/caro/${roomCode}?role=${expectedOpponentRole}`
      : "";

  return (
    <header className="w-full bg-secondary/80 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back to lobby & Title */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="secondary"
              size="icon-sm"
              title="Back to Lobby"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                {gameTitle}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 dark:bg-neutral-800 text-[11px] font-mono font-medium text-neutral-300">
                #{roomCode}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>
                You are:{" "}
                <strong
                  className={
                    myRole === PlayerRole.X
                      ? "text-primary font-semibold"
                      : myRole === PlayerRole.O
                      ? "text-destructive font-semibold"
                      : "text-muted-foreground"
                  }
                >
                  Piece {myRole}
                </strong>
              </span>
              {!isSupabaseConfigured && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-destructive/15 text-destructive">
                  Offline Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Opponent status & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Opponent Status Indicator (Borderless pill) */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900/60 dark:bg-neutral-800/80 text-xs font-medium text-foreground">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground hidden sm:inline">
              Opponent ({expectedOpponentRole}):
            </span>
            {isOpponentOnline ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                Waiting...
              </span>
            )}
          </div>

          {/* Sound Toggle Button */}
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={toggleSound}
            title={soundOn ? "Mute audio" : "Enable audio"}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>

          {/* Copy Match Link Action */}
          <CopyLinkButton url={inviteUrl} />
        </div>
      </div>
    </header>
  );
}
