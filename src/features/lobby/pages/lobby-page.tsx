"use client";

import { usePortal } from "@/shared/components/portal";
import { GameType } from "@/shared/types/room";
import { GameCard } from "../components/game-card";
import { RoomSelectionModal } from "../components/room-selection-modal";
import type { GameMetadata, GameRoomModalData, LobbyLocale } from "../types";
import { Icons } from "@/shared/icons";
import { useRipple } from "@/shared/hooks/use-ripple";
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
        iconSrc: "/games/caro.jpg",
      },
      {
        id: GameType.BIDA,
        title: "Bida",
        badge: "Vật lý 2D 60FPS",
        description: "Đấu cơ bida 2 người theo lượt. Ngắm cơ, kéo lực và đưa bóng vào lỗ trong thời gian thực.",
        players: "2 Người",
        isAvailable: true,
        tag: "Thể Thao",
        iconSrc: "/games/bida.jpg",
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
        iconSrc: "/games/caro.jpg",
      },
      {
        id: GameType.BIDA,
        title: "Bida",
        badge: "60FPS 2D Physics",
        description: "Turn-based 2-player billiards. Aim, adjust cue power, and sink your balls in real-time.",
        players: "2 Players",
        isAvailable: true,
        tag: "Sports Physics",
        iconSrc: "/games/bida.jpg",
      },
    ],
  },
};

const LANGUAGES: { code: LobbyLocale; label: string; flagIcon: string }[] = [
  { code: "vi", label: "Tiếng Việt", flagIcon: "flag-vn" },
  { code: "en", label: "English", flagIcon: "flag-us" },
];

export function LobbyPage() {
  const [locale, setLocale] = useState<LobbyLocale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const { createRipple: rippleLang, RippleContainer: RippleLangContainer } = useRipple<HTMLButtonElement>();
  const { createRipple: rippleTheme, RippleContainer: RippleThemeContainer } = useRipple<HTMLButtonElement>();

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
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-xs">
              <Icons name="logo" size={32} />
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
          <div className="flex items-center gap-1.5">
            {/* Language Select Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  rippleLang(e);
                  setIsLangOpen((prev) => !prev);
                }}
                className={`relative overflow-hidden flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                  isLangOpen
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300"
                }`}
                aria-expanded={isLangOpen}
              >
                <RippleLangContainer />
                <Icons name="languages" size={13} className="text-neutral-500 dark:text-neutral-400" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {locale}
                </span>
                <Icons
                  name="chevron-down"
                  size={12}
                  className={`text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                    isLangOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Modern Professional Popover Menu */}
              <div
                className={`absolute right-0 mt-2 w-44 p-1 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl z-50 flex flex-col gap-0.5 transform origin-top-right transition-all duration-150 ease-out ${
                  isLangOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Select Language
                </div>

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
                      className={`group w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-all cursor-pointer rounded-lg select-none ${
                        isSelected
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="shadow-2xs rounded-xs overflow-hidden flex items-center justify-center">
                          <Icons name={item.flagIcon} size={16} />
                        </span>
                        <span className="text-[12px]">{item.label}</span>
                      </span>
                      {isSelected ? (
                        <Icons name="check" size={13} className="text-primary shrink-0" />
                      ) : (
                        <span className="text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                rippleTheme(e);
                toggleTheme();
              }}
              className="relative overflow-hidden h-8 w-8 rounded-lg bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <RippleThemeContainer />
              {theme === "dark" ? (
                <Icons name="sun" size={15} className="text-amber-400" />
              ) : (
                <Icons name="moon" size={15} className="text-neutral-700" />
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

        {/* Active Games: Display in Row */}
        <div className="flex flex-row flex-wrap sm:flex-nowrap gap-4 mb-10 w-full">
          {current.games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={handleGameSelect}
            />
          ))}
        </div>

        {/* Clean Micro Stats */}
        <div className="mt-auto pt-6 grid grid-cols-3 gap-3 text-center">
          <div className="py-2.5 px-3 rounded-xl bg-neutral-200/40 dark:bg-neutral-900/40">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5">
              <Icons name="zap" size={13} className="text-primary" />
              <span>{current.realtime}</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{current.realtimeDesc}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-neutral-200/40 dark:bg-neutral-900/40">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{current.noAuth}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{current.noAuthDesc}</div>
          </div>
          <div className="py-2.5 px-3 rounded-xl bg-neutral-200/40 dark:bg-neutral-900/40">
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
