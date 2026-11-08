"use client";

import { useEffect, useState } from "react";

export interface NetworkState {
  online: boolean | null;
}

export function useSyncNetwork(): NetworkState {
  const [isOnline, setIsOnline] = useState<boolean | null>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      console.log("[NetworkSync] Internet connection restored.");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.warn("[NetworkSync] Internet connection lost.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { online: isOnline };
}
