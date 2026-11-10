"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Icons } from "@/shared/icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { usePlayerProfile } from "@/shared/hooks/use-player-profile";
import {
  AvatarStyles,
  type AvatarStyle,
  generateRandomName,
  generateRandomSeed,
  getAvatarUrl,
} from "@/shared/lib/avatar";
import type { PortalProps } from "@/shared/types/portal.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function ProfileDialog({ isOpen, onDismiss }: PortalProps<void>) {
  const t = useTranslations("profile");
  const { profile, updateProfile } = usePlayerProfile();

  const [name, setDraftName] = useState(profile.name);
  const [style, setDraftStyle] = useState<AvatarStyle>(profile.avatarStyle);
  const [seed, setDraftSeed] = useState(profile.avatarSeed);

  if (!isOpen) return null;

  const previewAvatarUrl = getAvatarUrl(style, seed);

  const handleRandomizeName = () => {
    setDraftName(generateRandomName());
  };

  const handleRandomizeSeed = () => {
    setDraftSeed(generateRandomSeed());
  };

  const handleSave = () => {
    updateProfile({
      name,
      avatarStyle: style,
      avatarSeed: seed,
    });
    onDismiss?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="mb-4 text-center items-center">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              {t("title")}
            </DialogTitle>
            <Badge variant="subtle" size="sm" className="text-[11px] px-2 py-0.5">
              {profile.isGuest ? t("guest") : "Member"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile.isGuest ? t("guestDesc") : ""}
          </p>
        </DialogHeader>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto px-0.5 py-1">
          {/* Avatar Preview Card: Rộng rãi, avatar lớn và thông tin rõ nét */}
          <Card variant="subtle" className="flex items-center gap-4 p-4">
            <Avatar size="lg" className="w-20 h-20 rounded-2xl bg-background shrink-0">
              <AvatarImage src={previewAvatarUrl} alt="Avatar Preview" />
              <AvatarFallback>{name?.[0] || "P"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base font-bold text-foreground truncate">
                {name || profile.name}
              </span>
              <span className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                {t("playerId")}: {profile.id}
              </span>
            </div>
          </Card>

          {/* Nickname Input - Nền secondary, bo góc rounded-2xl đồng bộ Card */}
          <Input
            label={t("nickname")}
            value={name}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={t("nicknamePlaceholder")}
            maxLength={24}
            className="bg-secondary text-foreground placeholder:text-muted-foreground text-sm"
            rightElement={
              <button
                type="button"
                onClick={handleRandomizeName}
                title={t("randomName")}
                aria-label={t("randomName")}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Icons name="dices" size={16} />
              </button>
            }
          />

          {/* Avatar Style Grid: Lưới 4 cột rộng rãi, item to rõ và không bị cắt chữ */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground tracking-tight select-none">
              {t("avatarStyle")}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {AvatarStyles.map((itemStyle) => {
                const isSelected = style === itemStyle;
                const sampleUrl = getAvatarUrl(itemStyle, seed);
                return (
                  <Card
                    key={itemStyle}
                    variant={isSelected ? "primary" : "subtle"}
                    onClick={() => setDraftStyle(itemStyle)}
                    className="relative flex flex-col items-center p-2.5 rounded-2xl transition-all cursor-pointer select-none"
                  >
                    <Avatar size="sm" className="w-12 h-12 rounded-xl bg-background mb-1.5 pointer-events-none">
                      <AvatarImage src={sampleUrl} alt={itemStyle} />
                      <AvatarFallback>{itemStyle[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium truncate w-full text-center capitalize pointer-events-none">
                      {itemStyle.replace("-", " ")}
                    </span>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Avatar Seed Input - Nền secondary, bo góc rounded-2xl đồng bộ Card */}
          <Input
            label={t("avatarSeed")}
            value={seed}
            onChange={(event) => setDraftSeed(event.target.value)}
            placeholder={t("avatarSeedPlaceholder")}
            className="font-mono bg-secondary text-foreground placeholder:text-muted-foreground text-sm"
            rightElement={
              <button
                type="button"
                onClick={handleRandomizeSeed}
                title={t("randomSeed")}
                aria-label={t("randomSeed")}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Icons name="refresh" size={15} />
              </button>
            }
          />
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-3 flex items-center justify-end">
          <Button
            variant="default"
            size="default"
            onClick={handleSave}
            className="px-6 font-semibold"
          >
            {t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
