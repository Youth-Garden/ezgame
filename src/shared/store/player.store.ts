import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type AvatarStyle,
  generateRandomName,
  generateRandomSeed,
  getAvatarUrl,
} from "@/shared/lib/avatar";

export interface PlayerProfile {
  id: string;
  name: string;
  avatarSeed: string;
  avatarStyle: AvatarStyle;
  isGuest: boolean;
  avatarUrl: string;
}

interface PlayerStoreState {
  profile: PlayerProfile;
  randomizeAvatar: () => void;
  setName: (name: string) => void;
  setAvatarStyle: (style: AvatarStyle) => void;
}

const STORAGE_KEY = "ezgame_player_profile";

// Stable initial fallback for SSR matching
const DEFAULT_FALLBACK_PROFILE: PlayerProfile = {
  id: "guest_player",
  name: "Player",
  avatarSeed: "ezgame_default",
  avatarStyle: "bottts-neutral",
  isGuest: true,
  avatarUrl: getAvatarUrl("bottts-neutral", "ezgame_default"),
};

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set) => ({
      profile: DEFAULT_FALLBACKProfileSafe(),

      randomizeAvatar: () =>
        set((state) => {
          const newSeed = generateRandomSeed();
          const currentStyle: AvatarStyle = state.profile.avatarStyle || "bottts-neutral";
          return {
            profile: {
              ...state.profile,
              avatarSeed: newSeed,
              avatarUrl: getAvatarUrl(currentStyle, newSeed),
            },
          };
        }),

      setName: (name: string) =>
        set((state) => ({
          profile: {
            ...state.profile,
            name: name.trim() || state.profile.name,
          },
        })),

      setAvatarStyle: (style: AvatarStyle) =>
        set((state) => ({
          profile: {
            ...state.profile,
            avatarStyle: style,
            avatarUrl: getAvatarUrl(style, state.profile.avatarSeed),
          },
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

function DEFAULT_FALLBACKProfileSafe(): PlayerProfile {
  return DEFAULT_FALLBACK_PROFILE;
}
