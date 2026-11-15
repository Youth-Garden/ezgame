"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { MobileRoomActionsSheet, type MobileRoomActionsSheetData } from "./mobile-room-actions-sheet";
import { GameRulesDialog, type GameRulesDialogData } from "./game-rules-dialog";
import { InviteShareDialog, type InviteShareDialogData } from "./invite-share-dialog";

interface RoomHeaderProps {
  roomCode: string;
  gameTitle: string;
  gameType?: "caro" | "bida" | "tictactoe" | "xiangqi" | "chess" | "animal-chess";
  myRole?: PlayerRole;
  myProfile?: PlayerProfile;
  opponentProfile?: {
    name: string;
    avatarUrl: string;
    role: PlayerRole;
  } | null;
  onRandomizeAvatar?: () => void;
  isOpponentOnline?: boolean;
  expectedOpponentRole?: PlayerRole;
  isSupabaseConfigured?: boolean;
  isGameActive?: boolean;
  onSurrender?: () => void;
}

export function RoomHeader({
  roomCode,
  gameTitle,
  gameType = "caro",
  isSupabaseConfigured = true,
  isOpponentOnline = false,
  isGameActive = false,
  onSurrender,
}: RoomHeaderProps) {
  const router = useRouter();
  const tGame = useTranslations("game");
  const tNav = useTranslations("nav");
  const [presentConfirmDialog] = usePortal<ConfirmDialogData>(ConfirmDialog);
  const [presentMobileSheet] = usePortal<MobileRoomActionsSheetData>(MobileRoomActionsSheet);
  const [presentRulesDialog] = usePortal<GameRulesDialogData>(GameRulesDialog);
  const [presentInviteDialog] = usePortal<InviteShareDialogData>(InviteShareDialog);
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [, copyToClipboard] = useCopyToClipboard();
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked by user/browser permissions
    }
  };

  const handleBack = () => {
    if (isOpponentOnline || isGameActive) {
      presentConfirmDialog({
        title: "Leave Current Match?",
        description: "A match is currently in progress. Leaving now will count as a surrender and your opponent will win.",
        confirmText: "Leave Match",
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

  const handleOpenMobileSheet = () => {
    presentMobileSheet({
      roomCode,
      inviteUrl,
      soundOn,
      isFullscreen,
      onToggleSound: toggleSound,
      onToggleFullscreen: toggleFullscreen,
      onOpenRules: () => presentRulesDialog({ gameType, gameTitle }),
      onOpenShare: () => presentInviteDialog({ roomCode, inviteUrl, gameTitle }),
      onSurrender,
      canSurrender: isGameActive,
    });
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-30 select-none border-b border-border/20">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={handleBack}
                aria-label={tNav("backToLobby")}
                className="shrink-0"
              >
                <Icons name="arrow-left" size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">{tNav("backToLobby")}</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-bold text-xs sm:text-base text-foreground tracking-tight truncate max-w-[110px] sm:max-w-none">
              {gameTitle}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-7 sm:h-8 px-2 sm:px-3 font-mono text-[10px] sm:text-[11px] gap-1 sm:gap-1.5 font-medium shrink-0"
                >
                  <span>#{roomCode}</span>
                  {copiedCode ? (
                    <Icons name="check" size={12} className="text-emerald-500 animate-in zoom-in-75 duration-150" />
                  ) : (
                    <Icons name="copy" size={12} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{tGame("clickToCopyCode")}</TooltipContent>
            </Tooltip>

            {!isSupabaseConfigured && (
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium shrink-0">
                {tGame("offline")}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile: Compact 3-dots sheet trigger (visible on mobile, hidden on sm+) */}
          <div className="block sm:hidden">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={handleOpenMobileSheet}
              aria-label="Room actions"
            >
              <Icons name="more-horizontal" size={18} />
            </Button>
          </div>

          {/* Desktop & Tablet: Full action buttons (hidden on mobile, flex on sm+) */}
          <div className="hidden sm:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={() => presentRulesDialog({ gameType, gameTitle })}
                  aria-label="Game Rules & Guide"
                >
                  <Icons name="book" size={16} className="text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{tGame("gameRules")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  <Icons
                    name={isFullscreen ? "minimize" : "maximize"}
                    size={16}
                    className="text-foreground"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </TooltipContent>
            </Tooltip>

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

            {/* Invite / Share Dialog Trigger Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                presentInviteDialog({
                  roomCode,
                  inviteUrl,
                  gameTitle,
                })
              }
              className="gap-2 text-xs font-semibold"
            >
              <Icons name="share" size={14} />
              <span>{tNav("inviteFriends", { defaultMessage: "Mời bạn" })}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
