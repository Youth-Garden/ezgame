"use client";

import { usePortal } from "@/shared/components/portal";
import { GameType } from "@/shared/types/room";
import { GameCard } from "../components/game-card";
import { RoomSelectionModal } from "../components/room-selection-modal";
import type { GameMetadata, GameRoomModalData, LobbyLocale } from "../types";
import { Gamepad2, Languages, Moon, Sun, ChevronDown, Check, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type Theme = "dark" | "light";

const CONTENT: Record<
  LobbyLocale,
  {
    tagline: string;
    title: string;
    subtitle: string;
    play: string;
    realtime: string;
    realtimeDesc: string;
    noAuth: string;
    noAuthDesc: string;
    share: string;
    shareDesc: string;
    footer: string;
    games: GameMetadata[];
  }
> = {
  vi: {
    tagline: "Đấu Trí Trực Tuyến",
    title: "Chọn trò chơi",
    subtitle: "Không cần đăng ký tài khoản. Tạo phòng hoặc nhập mã phòng để chiến ngay với bạn bè.",
    play: "Chơi ngay",
    realtime: "Thời gian thực",
    realtimeDesc: "Đồng bộ WebSocket",
    noAuth: "Không cần đăng nhập",
    noAuthDesc: "Vào chơi tức thì",
    share: "Chia sẻ 1 chạm",
    shareDesc: "Gửi link mời nhanh",
    footer: "EzGame • Nền tảng game đối kháng tối giản",
    games: [
      {
        id: GameType.CARO,
        title: "Cờ Caro (Gomoku)",
        badge: "Bàn cờ 15x15",
        description: "Luật 5 ô liên tiếp truyền thống trên bàn cờ 15x15. Đấu trí thời gian thực đỉnh cao.",
        players: "2 Người",
        isAvailable: true,
        tag: "Chiến Thuật",
        iconSrc: "/games/caro.svg",
      },
    ],
  },
  en: {
    tagline: "Instant Multiplayer",
    title: "Choose a game to duel",
    subtitle: "No registration or setup needed. Create or join with a room code in seconds.",
    play: "Play Game",
    realtime: "Realtime",
    realtimeDesc: "WebSocket sync",
    noAuth: "0 Login",
    noAuthDesc: "Instant guest access",
    share: "1-Click Share",
    shareDesc: "Invite via link",
    footer: "EzGame • Minimalist multiplayer arena",
    games: [
      {
        id: GameType.CARO,
        title: "Caro (Gomoku)",
        badge: "15x15 Classic",
        description: "5-in-a-row Gomoku on a 15x15 board. Real-time tactical duel with live opponent tracking and move sync.",
        players: "2 Players",
        isAvailable: true,
        tag: "Tactical Board",
        iconSrc: "/games/caro.svg",
      },
    ],
  },
};

const LANGUAGES: { code: LobbyLocale; label: string; flag: string }[] = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export function LobbyPage() {
  const [locale, setLocale] = useState<LobbyLocale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const [presentRoomModal] = usePortal<GameRoomModalData>(RoomSelectionModal);
  const current = CONTENT[locale];

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

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
      locale,
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-50 dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 transition-colors">
      {/* Top Header */}
      <header className="bg-neutral-50/80 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold">
              <Gamepad2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                EzGame
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                {current.tagline}
              </span>
            </div>
          </div>

          {/* Right Actions: Language Dropdown & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Language Select Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                aria-expanded={isLangOpen}
              >
                <Languages className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span className="font-semibold uppercase tracking-wider">
                  {locale}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${
                    isLangOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-1.5 w-40 py-1.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-xl z-50 transform origin-top-right transition-all duration-150 ease-out border border-neutral-100 dark:border-transparent ${
                  isLangOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {LANGUAGES.map((item) => {
                  const isSelected = locale === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLocale(item.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer rounded-lg mx-auto ${
                        isSelected
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                          : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
        {/* Pitch */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1.5">
            {current.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {current.subtitle}
          </p>
        </div>

        {/* Active Games Only */}
        <div className="flex flex-col gap-4 mb-10">
          {current.games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={handleGameSelect}
              playText={current.play}
            />
          ))}
        </div>

        {/* Clean Micro Stats */}
        <div className="mt-auto pt-6 grid grid-cols-3 gap-3 text-center">
          <div className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" /> {current.realtime}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{current.realtimeDesc}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{current.noAuth}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{current.noAuthDesc}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{current.share}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{current.shareDesc}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        {current.footer}
      </footer>
    </div>
  );
}
