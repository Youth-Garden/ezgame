"use client";

import {
  useSyncLocale,
  useSyncTheme,
  useSyncNetwork,
  useSyncPlayerProfile,
  useSyncAudioGesture,
} from "./hooks";

/**
 * Headless Updater Component
 *
 * Centralizes all global synchronization, network detection,
 * theme management, player profile initialization, Web Audio gesture unlocking,
 * and lifecycle events without cluttering UI.
 */
export function Updater() {
  useSyncLocale();
  useSyncTheme();
  useSyncNetwork();
  useSyncPlayerProfile();
  useSyncAudioGesture();

  return null;
}


