"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export interface NetworkState {
  online: boolean | null;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

export function useSyncNetwork(): NetworkState {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOnline) {
      console.log("[NetworkSync] Internet connection restored.");
    } else {
      console.warn("[NetworkSync] Internet connection lost.");
    }
  }, [isOnline, mounted]);

  return { online: isOnline };
}
