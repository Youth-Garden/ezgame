"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Icons } from "@/shared/icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { usePlayerProfile } from "@/shared/hooks/use-player-profile";
import { usePortal } from "@/shared/components/portal";
import { ProfileDialog } from "./profile-dialog";

export function UserProfileMenu() {
  const t = useTranslations("profile");
  const { profile } = usePlayerProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [presentProfileModal] = usePortal<void>(ProfileDialog);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenEdit = () => {
    setIsOpen(false);
    presentProfileModal();
  };

  const displayName = mounted ? profile.name : "Player";
  const displayAvatar = mounted ? profile.avatarUrl : "";
  const displayId = mounted ? profile.id : "guest_player";
  const displayIsGuest = mounted ? profile.isGuest : true;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        className="gap-1.5 h-8 pl-1.5 pr-2.5 overflow-hidden"
        aria-expanded={isOpen}
        aria-label="User Profile Menu"
      >
        <Avatar size="sm" className="!w-5 !h-5 rounded-full overflow-hidden shrink-0">
          {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} className="rounded-full" />}
          <AvatarFallback className="text-[10px]">
            <Icons name="user" size={12} className="text-foreground" />
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline text-xs font-semibold text-foreground truncate max-w-[85px] lg:max-w-[110px]">
          {displayName}
        </span>
        <Icons
          name="chevron-down"
          size={12}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </Button>

      {/* Profile Dropdown Menu: Không shadow, không border */}
      <div
        className={`absolute right-0 mt-2 w-52 p-1.5 rounded-2xl bg-popover border-none text-popover-foreground shadow-none z-50 flex flex-col gap-1 transform origin-top-right transition-all duration-150 ease-out ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header Profile Identity */}
        <div className="p-2 rounded-xl bg-muted/60 flex items-center gap-2.5">
          <Avatar size="sm" className="w-8 h-8 rounded-full bg-background">
            {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
            <AvatarFallback>
              <Icons name="user" size={14} className="text-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-foreground truncate">
                {displayName}
              </span>
              <Badge variant="subtle" size="sm" className="text-[9px] px-1.5 py-0 h-4">
                {displayIsGuest ? t("guest") : "PRO"}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono truncate">
              {displayId}
            </span>
          </div>
        </div>

        {/* Menu Option */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-xl text-foreground hover:bg-muted/60 transition-colors cursor-pointer select-none"
          >
            <Icons name="edit" size={14} className="text-muted-foreground" />
            <span className="font-medium">{t("editProfile")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
