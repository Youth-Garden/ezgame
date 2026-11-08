"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { CopyLinkButton } from "./copy-link-button";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import { sounds } from "@/shared/lib/sound-effects";
import { RouteEnum, formatUrl, getGamePlayRoute } from "@/shared/constants/routes";
import { PlayerRole } from "@/shared/types/room";
import { type PlayerProfile } from "@/shared/hooks/use-player-profile";
import { Icons } from "@/shared/icons";
import { usePortal } from "@/shared/components/portal";
import { ConfirmDialog, type ConfirmDialogData } from "./confirm-dialog";

interface RoomHeaderProps {
  roomCode: string;
  gameTitle: string;
  gameType?: "caro" | "bida" | "tictactoe";
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
  isGameActive?: boolean;
}

export function RoomHeader({
  roomCode,
  gameTitle,
  gameType = "caro",
  expectedOpponentRole,
  isSupabaseConfigured,
  isOpponentOnline = false,
  isGameActive = false,
}: RoomHeaderProps) {
  const router = useRouter();
  const [presentConfirmDialog] = usePortal<ConfirmDialogData>(ConfirmDialog);
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [, copyToClipboard] = useCopyToClipboard();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleBack = () => {
    if (isOpponentOnline || isGameActive) {
      presentConfirmDialog({
        title: "Leave Current Match?",
        description: "A match is currently in progress. Leaving now will count as a surrender and your opponent will win.",
        confirmText: "Leave Match",
        cancelText: "Stay in Match",
        variant: "destructive",
        icon3D: "leave-match-3d",
        showCloseButton: true,
        onConfirm: () => {
          router.push(RouteEnum.LOBBY);
        },
      });
    } else {
      router.push(RouteEnum.LOBBY);
    }
  };

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
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

  const invitePath = formatUrl(
    getGamePlayRoute(gameType),
    { code: roomCode }
  );

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${invitePath}`
      : "";

  return (
    <header className="w-full bg-background/80 backdrop-blur-md px-4 py-2.5 sticky top-0 z-30 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={handleBack}
                aria-label="Back to Lobby"
              >
                <Icons name="arrow-left" size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">Back to Lobby</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-foreground tracking-tight">
              {gameTitle}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8 px-3 font-mono text-[11px] gap-1.5 font-medium"
                >
                  <span>#{roomCode}</span>
                  {copiedCode ? (
                    <Icons name="check" size={12} className="text-emerald-500 animate-in zoom-in-75 duration-150" />
                  ) : (
                    <Icons name="copy" size={12} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Click to copy room code</TooltipContent>
            </Tooltip>
            {!isSupabaseConfigured && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
                Offline Mode
              </span>
            )}
          </div>
        </div>

        {/* Right: Sound & Invite Link */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={toggleSound}
              >
                {soundOn ? (
                  <Icons name="volume2" size={16} className="text-foreground" />
                ) : (
                  <Icons name="volumex" size={16} className="text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{soundOn ? "Mute audio" : "Enable audio"}</TooltipContent>
          </Tooltip>

          <CopyLinkButton url={inviteUrl} />
        </div>
      </div>
    </header>
  );
}
