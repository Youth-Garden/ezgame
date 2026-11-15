"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Icons } from "@/shared/icons";
import { type PortalProps } from "@/shared/types/portal.types";

export interface InviteShareDialogData {
  roomCode: string;
  inviteUrl: string;
  gameTitle?: string;
}

export function InviteShareDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<InviteShareDialogData>) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const { roomCode, inviteUrl, gameTitle = "EzGame" } = data;
  const shareText = `Vào chơi ${gameTitle} cùng mình nhé! Phòng: #${roomCode}`;

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `EzGame - ${gameTitle}`,
          text: shareText,
          url: inviteUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareMessenger = () => {
    // Facebook dialog share URL
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      inviteUrl
    )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(inviteUrl)}`;
    window.open(messengerUrl, "_blank", "width=600,height=500");
  };

  const handleShareTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      inviteUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, "_blank", "width=600,height=500");
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText}\n${inviteUrl}`
    )}`;
    window.open(whatsappUrl, "_blank", "width=600,height=500");
  };

  const isNativeShareSupported = typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent className="max-w-sm sm:max-w-md p-5 sm:p-6 select-none">
        <DialogHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Icons name="share" size={22} />
          </div>
          <DialogTitle className="text-lg font-bold">
            {tNav("inviteFriendTitle", { defaultMessage: "Mời bạn bè vào phòng" })}
          </DialogTitle>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
            <span>Phòng: #{roomCode}</span>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-border/40 flex flex-col items-center">
            <QRCodeSVG
              value={inviteUrl}
              size={136}
              level="M"
              includeMargin={false}
              className="rounded-lg"
            />
            <span className="text-[10px] text-slate-500 font-medium mt-2">
              Quét mã để vào chơi ngay
            </span>
          </div>

          {/* Room Link Input & Copy Button */}
          <div className="w-full flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border/50">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent px-2.5 text-xs font-mono text-muted-foreground outline-none truncate"
            />
            <Button
              variant={copied ? "default" : "secondary"}
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0 h-8 text-xs font-medium gap-1.5 px-3"
            >
              {copied ? (
                <>
                  <Icons name="check" size={13} className="text-white" />
                  <span>{tCommon("copied")}</span>
                </>
              ) : (
                <>
                  <Icons name="copy" size={13} />
                  <span>{tCommon("copy", { defaultMessage: "Sao chép" })}</span>
                </>
              )}
            </Button>
          </div>

          {/* Social / Direct Share Actions */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground text-center">
              Chia sẻ nhanh qua
            </span>
            <div className="grid grid-cols-4 gap-2">
              {/* Native System Share (Mobile / Tablet / Windows Share) */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors cursor-pointer group"
                title="Hệ thống chia sẻ"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons name={isNativeShareSupported ? "share" : "copy"} size={16} />
                </div>
                <span className="text-[10px] font-medium text-foreground">
                  {isNativeShareSupported ? "Hệ thống" : "Sao chép"}
                </span>
              </button>

              {/* Messenger */}
              <button
                type="button"
                onClick={handleShareMessenger}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors cursor-pointer group"
                title="Facebook Messenger"
              >
                <div className="w-9 h-9 rounded-full bg-[#0084FF]/10 text-[#0084FF] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons name="message" size={16} />
                </div>
                <span className="text-[10px] font-medium text-foreground">Messenger</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleShareTelegram}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors cursor-pointer group"
                title="Telegram"
              >
                <div className="w-9 h-9 rounded-full bg-[#24A1DE]/10 text-[#24A1DE] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons name="send" size={16} />
                </div>
                <span className="text-[10px] font-medium text-foreground">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors cursor-pointer group"
                title="WhatsApp"
              >
                <div className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons name="message-circle" size={16} />
                </div>
                <span className="text-[10px] font-medium text-foreground">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
