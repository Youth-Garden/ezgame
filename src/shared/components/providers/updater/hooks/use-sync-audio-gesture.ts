"use client";

import { useEffect } from "react";
import { sounds } from "@/shared/lib/sound-effects";

/**
 * Headless Hook: Syncs browser user-gesture unlock for Web Audio API.
 * Browsers block AudioContext autoplay until the first click/touch interaction.
 */
export function useSyncAudioGesture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFirstGesture = () => {
      // Accessing sound context triggers ctx.resume() on valid user gesture
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const dummy = new AudioCtx();
          if (dummy.state === "suspended") {
            dummy.resume().catch(() => {});
          }
        }
      } catch {
        // Ignore gesture audio errors
      }

      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };

    window.addEventListener("pointerdown", handleFirstGesture, { passive: true });
    window.addEventListener("keydown", handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, []);
}
