"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/shared/store/player.store";
import {
  generateRandomName,
  generateRandomSeed,
  getAvatarUrl,
  type AvatarStyle,
} from "@/shared/lib/avatar";

/**
 * Headless Hook: Synchronizes and initializes the player's guest profile
 * on the client side without causing SSR hydration mismatches.
 */
export function useSyncPlayerProfile() {
  useEffect(() => {
    const current = usePlayerStore.getState().profile;
    if (!current || current.id === "guest_player") {
      const seed = generateRandomSeed();
      const style: AvatarStyle = "bottts-neutral";
      usePlayerStore.setState({
        profile: {
          id: `guest_${Math.random().toString(36).substring(2, 9)}`,
          name: generateRandomName(),
          avatarSeed: seed,
          avatarStyle: style,
          isGuest: true,
          avatarUrl: getAvatarUrl(style, seed),
        },
      });
    }
  }, []);
}
