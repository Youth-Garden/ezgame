"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { CopyLinkButton } from "./copy-link-button";
import { Button } from "@/shared/components/ui/button";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Icons } from "@/shared/icons";

interface RoomHeaderProps {
  roomCode: string;
  gameTitle: string;
  myRole: PlayerRole;
  myProfile?: PlayerProfile;
  opponentProfile?: {
    name: string;
    avatarUrl: string;
    role: PlayerRole;
  } | null;
  onRandomizeAvatar?: () => void;
  isOpponentOnline: boolean;
  expectedOpponentRole: PlayerRole;
  isSupabaseConfigured: boolean;
}

export function RoomHeader({
  roomCode,
  gameTitle,
  myRole,
  myProfile,
  opponentProfile,
  onRandomizeAvatar,
  isOpponentOnline,
  expectedOpponentRole,
  isSupabaseConfigured,
}: RoomHeaderProps) {
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [, copyToClipboard] = useCopyToClipboard();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
      navigator.clipboard?.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

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
    <header className="w-full bg-secondary/80 backdrop-blur-md px-4 py-2.5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="secondary"
              size="icon-sm"
              title="Back to Lobby"
            >
              <Icons name="arrow-left" size={16} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                {gameTitle}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Click to copy room code"
                className="group relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[11px] font-mono font-medium text-neutral-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95"
              >
                <span>#{roomCode}</span>
                {copiedCode ? (
                  <Icons name="check" size={12} className="text-emerald-400 animate-in zoom-in-75 duration-150" />
                ) : (
                  <Icons name="copy" size={12} className="text-neutral-400 group-hover:text-neutral-200 transition-colors" />
                )}
                {copiedCode && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-sans font-bold whitespace-nowrap shadow-md animate-in fade-in zoom-in-95 duration-100">
                    Copied!
                  </span>
                )}
              </button>
            </div>
            {!isSupabaseConfigured && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-destructive/15 text-destructive font-medium">
                Offline Mode
              </span>
            )}
          </div>
        </div>

        {/* Center: Both Players Avatars & Roles */}
        <div className="flex items-center gap-4 sm:gap-6 bg-neutral-900/60 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl">
          {/* Me */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div
                className={`w-8 h-8 rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center ring-2 ${
                  myRole === PlayerRole.X
                    ? "ring-primary"
                    : "ring-destructive"
                }`}
              >
                {myProfile?.avatarUrl && (
                  <Image
                    src={myProfile.avatarUrl}
                    alt={myProfile.name || "Avatar"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                )}
              </div>
              {onRandomizeAvatar && (
                <button
                  type="button"
                  onClick={onRandomizeAvatar}
                  title="Randomize your avatar"
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                >
                  <Icons name="sparkles" size={10} />
                </button>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground truncate max-w-[80px] sm:max-w-[110px]">
                {myProfile?.name || `You (${myRole})`}
              </span>
              <span
                className={`text-[10px] font-bold uppercase ${
                  myRole === PlayerRole.X ? "text-primary" : "text-destructive"
                }`}
              >
                Piece {myRole} (You)
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-muted-foreground/60 italic">VS</span>

          {/* Opponent */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center ring-2 ${
                expectedOpponentRole === PlayerRole.X
                  ? "ring-primary"
                  : "ring-destructive"
              } ${!isOpponentOnline ? "opacity-50 grayscale" : ""}`}
            >
              {opponentProfile?.avatarUrl ? (
                <Image
                  src={opponentProfile.avatarUrl}
                  alt={opponentProfile.name || "Opponent"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {expectedOpponentRole}
                </div>
              )}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground truncate max-w-[80px] sm:max-w-[110px]">
                  {opponentProfile?.name || `Waiting...`}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpponentOnline
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-muted-foreground/50"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-bold uppercase ${
                  expectedOpponentRole === PlayerRole.X
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                Piece {expectedOpponentRole}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sound & Invite Link */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={toggleSound}
            title={soundOn ? "Mute audio" : "Enable audio"}
          >
            {soundOn ? (
              <Icons name="volume2" size={16} className="text-primary" />
            ) : (
              <Icons name="volumex" size={16} className="text-muted-foreground" />
            )}
          </Button>

          <CopyLinkButton url={inviteUrl} />
        </div>
      </div>
    </header>
  );
}
