"use client";

import { useTranslations } from "next-intl";
import { type PortalProps } from "@/shared/types/portal.types";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";
import { CopyLinkButton } from "@/shared/components/copy-link-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

export interface MobileRoomActionsSheetData {
  roomCode: string;
  inviteUrl: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onSurrender?: () => void;
  canSurrender?: boolean;
}

export function MobileRoomActionsSheet({
  isOpen,
  onDismiss,
  data,
}: PortalProps<MobileRoomActionsSheetData>) {
  const t = useTranslations("game");
  const tNav = useTranslations("nav");

  if (!data) return null;

  const {
    roomCode,
    inviteUrl,
    soundOn,
    onToggleSound,
    onSurrender,
    canSurrender = true,
  } = data;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <SheetContent side="bottom" showCloseButton={true} className="space-y-4">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>Room Actions</SheetTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
              #{roomCode}
            </span>
          </div>
        </SheetHeader>

        {/* Action List */}
        <div className="space-y-2">
          {/* Audio Toggle */}
          <Button
            variant="secondary"
            size="default"
            className="w-full justify-between h-11 px-4 text-xs font-semibold"
            onClick={onToggleSound}
          >
            <span className="flex items-center gap-2.5">
              <Icons name={soundOn ? "volume-2" : "volume-x"} size={16} />
              <span>{tNav("toggleSound")}</span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground uppercase">
              {soundOn ? "ON" : "OFF"}
            </span>
          </Button>

          {/* Copy Invite Link */}
          <CopyLinkButton
            url={inviteUrl}
            className="w-full h-11 text-xs font-semibold justify-center"
          />

          {/* Surrender Action (if game is active) */}
          {canSurrender && onSurrender && (
            <Button
              variant="destructive"
              size="default"
              className="w-full justify-center h-11 px-4 text-xs font-semibold gap-2 mt-2"
              onClick={() => {
                onDismiss?.();
                onSurrender();
              }}
            >
              <Icons name="flag" size={15} />
              <span>{t("surrender")}</span>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
