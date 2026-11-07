"use client";

import { useMemo, useCallback, useState } from "react";
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

interface StoredProfile {
  id: string;
  name: string;
  avatarSeed: string;
  avatarStyle: AvatarStyle;
  isGuest: boolean;
}

const STORAGE_KEY = "ezgame_session_profile";

function createFreshProfile(): StoredProfile {
  return {
    id: `guest_${Math.random().toString(36).substring(2, 9)}`,
    name: generateRandomName(),
    avatarSeed: generateRandomSeed(),
    avatarStyle: "bottts-neutral",
    isGuest: true,
  };
}

export function usePlayerProfile() {
  const [storedProfile, setStoredProfile] = useState<StoredProfile>(() => {
    if (typeof window === "undefined") {
      return createFreshProfile();
    }

    try {
      const existing = window.sessionStorage.getItem(STORAGE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.name && parsed.avatarSeed) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }

    const fresh = createFreshProfile();
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore
    }
    return fresh;
  });

  const saveProfile = useCallback((updater: (prev: StoredProfile) => StoredProfile) => {
    setStoredProfile((prev) => {
      const updated = updater(prev);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const profile: PlayerProfile = useMemo(() => {
    const style = storedProfile?.avatarStyle || "bottts-neutral";
    const seed = storedProfile?.avatarSeed || "default_seed";
    return {
      ...storedProfile,
      avatarUrl: getAvatarUrl(style, seed),
    };
  }, [storedProfile]);

  const updateName = useCallback(
    (name: string) => {
      saveProfile((prev) => ({
        ...prev,
        name: name.trim() || prev.name,
      }));
    },
    [saveProfile]
  );

  const randomizeAvatar = useCallback(() => {
    saveProfile((prev) => ({
      ...prev,
      name: generateRandomName(),
      avatarSeed: generateRandomSeed(),
    }));
  }, [saveProfile]);

  const setAvatarStyle = useCallback(
    (style: AvatarStyle) => {
      saveProfile((prev) => ({
        ...prev,
        avatarStyle: style,
      }));
    },
    [saveProfile]
  );

  return {
    profile,
    updateName,
    randomizeAvatar,
    setAvatarStyle,
  };
}
