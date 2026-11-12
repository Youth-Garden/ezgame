import { GameType } from "@/shared/types/room";

export interface GameCatalogConfig {
  id: GameType;
  titleKey: string;
  badgeKey: string;
  descriptionKey: string;
  playersKey: string;
  isAvailable: boolean;
  tagKey: string;
  iconSrc: string;
  gradient: string;
  defaultPlayingCount: number;
}

export const GAME_CATALOG_CONFIGS: readonly GameCatalogConfig[] = [
  {
    id: GameType.CARO,
    titleKey: "caro.title",
    badgeKey: "caro.badge",
    descriptionKey: "caro.description",
    playersKey: "caro.players",
    isAvailable: true,
    tagKey: "caro.tag",
    iconSrc: "/games/caro.jpg",
    gradient: "bg-gradient-to-b from-[#2B6CFF] to-[#00B4FF]",
    defaultPlayingCount: 2048,
  },
  {
    id: GameType.BIDA,
    titleKey: "bida.title",
    badgeKey: "bida.badge",
    descriptionKey: "bida.description",
    playersKey: "bida.players",
    isAvailable: true,
    tagKey: "bida.tag",
    iconSrc: "/games/bida.jpg",
    gradient: "bg-gradient-to-b from-[#7B3FF2] via-[#C03CF0] to-[#FF4D4D]",
    defaultPlayingCount: 1850,
  },
] as const;

export interface LanguageOption {
  code: "vi" | "en" | "ja";
  label: string;
  flagIcon: "flag-vn" | "flag-us" | "flag-jp";
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: "vi", label: "Tiếng Việt", flagIcon: "flag-vn" },
  { code: "en", label: "English", flagIcon: "flag-us" },
  { code: "ja", label: "日本語", flagIcon: "flag-jp" },
] as const;
