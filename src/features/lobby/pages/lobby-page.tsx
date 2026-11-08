"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePortal } from "@/shared/components/portal";
import { GameType } from "@/shared/types/room";
import { GameCard } from "../components/game-card";
import { RoomSelectionDialog } from "../components/room-selection-dialog";
import type { GameMetadata, GameRoomModalData } from "../types";
import { Icons } from "@/shared/icons";
import { useRipple } from "@/shared/hooks/use-ripple";
import { Button } from "@/shared/components/ui/button";
import { useSyncLocale, useSyncTheme } from "@/shared/components/providers/updater/hooks";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flagIcon: "flag-vn" },
  { code: "en", label: "English", flagIcon: "flag-us" },
  { code: "ja", label: "日本語", flagIcon: "flag-jp" },
] as const;

export function LobbyPage() {
  const tLobby = useTranslations("lobby");
  const tGames = useTranslations("games");

  const { currentLocale, changeLocale } = useSyncLocale();
  const currentLang = LANGUAGES.find((item) => item.code === currentLocale) || LANGUAGES[1];
  const { theme, toggleTheme } = useSyncTheme();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { createRipple: rippleLang, RippleContainer: RippleLangContainer } =
    useRipple<HTMLButtonElement>();
  const { createRipple: rippleTheme, RippleContainer: RippleThemeContainer } =
    useRipple<HTMLButtonElement>();

  const [presentRoomModal] = usePortal<GameRoomModalData>(RoomSelectionDialog);

  // Dynamic games catalog derived from i18n
  const games: GameMetadata[] = useMemo(
    () => [
      {
        id: GameType.CARO,
        title: tGames("caro.title"),
        badge: tGames("caro.badge"),
        description: tGames("caro.description"),
        players: tGames("caro.players"),
        isAvailable: true,
        tag: tGames("caro.tag"),
        iconSrc: "/games/caro.jpg",
        gradient: "bg-gradient-to-b from-[#2B6CFF] to-[#00B4FF]",
        playingCount: 2048,
      },
      {
        id: GameType.BIDA,
        title: tGames("bida.title"),
        badge: tGames("bida.badge"),
        description: tGames("bida.description"),
        players: tGames("bida.players"),
        isAvailable: true,
        tag: tGames("bida.tag"),
        iconSrc: "/games/bida.jpg",
        gradient: "bg-gradient-to-b from-[#7B3FF2] via-[#C03CF0] to-[#FF4D4D]",
        playingCount: 1850,
      },
    ],
    [tGames]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGameSelect = (game: GameMetadata) => {
    if (!game.isAvailable) return;
    presentRoomModal({
      gameType: game.id,
      gameTitle: game.title,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans selection:bg-muted transition-colors">
      {/* Top Header */}
      <header className="w-full bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <Icons name="logo" size={32} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-foreground uppercase">
                EzGame
              </span>
              <span className="text-xs text-text-secondary hidden sm:inline font-medium">
                {tLobby("tagline")}
              </span>
            </div>
          </div>

          {/* Right Actions: Language Dropdown & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Language Select Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="gap-1.5 h-8 px-3"
                aria-expanded={isLangOpen}
              >
                <span className="rounded-xs overflow-hidden flex items-center justify-center">
                  <Icons name={currentLang.flagIcon} size={16} />
                </span>
                <Icons
                  name="chevron-down"
                  size={12}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    isLangOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </Button>

              {/* Language Menu */}
              <div
                className={`absolute right-0 mt-2 w-44 p-1.5 rounded-2xl bg-card border-none text-card-foreground shadow-xl z-50 flex flex-col gap-1 transform origin-top-right transition-all duration-150 ease-out ${
                  isLangOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Language
                </div>

                {LANGUAGES.map((item) => {
                  const isSelected = currentLocale === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        changeLocale(item.code);
                        setIsLangOpen(false);
                      }}
                      className={`group w-full flex items-center px-2.5 py-2 text-xs text-left transition-all cursor-pointer rounded-xl select-none ${
                        isSelected
                          ? "bg-secondary text-foreground font-bold"
                          : "text-text-secondary hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="rounded-xs overflow-hidden flex items-center justify-center">
                          <Icons name={item.flagIcon} size={16} />
                        </span>
                        <span className="text-[12px]">{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={(e) => toggleTheme(e)}
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Icons name="sun" size={15} className="text-foreground" />
              ) : (
                <Icons name="moon" size={15} className="text-foreground" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Section - Centered Clean Gaming Canvas with Reduced Container Width */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Section Header */}
        <div className="mb-6 flex flex-col gap-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {tLobby("sectionTitle")}
          </h2>
          <p className="text-xs text-text-secondary font-medium tracking-wide">
            {tLobby("subtitle")}
          </p>
        </div>

        {/* Clean Responsive Cards Grid - Prominent Large Game Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onSelect={handleGameSelect} />
          ))}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-5 px-4 text-center text-xs text-text-secondary">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          {tLobby("footer")}
        </div>
      </footer>
    </div>
  );
}
