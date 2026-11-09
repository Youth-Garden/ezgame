"use client";

import { useEffect, useState } from "react";
import { useNetworkState } from "@uidotdev/usehooks";

export interface NetworkState {
  online: boolean | null;
}

export function useSyncNetwork(): NetworkState {
  const network = useNetworkState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (network.online === true) {
      console.log("[NetworkSync] Internet connection restored.");
    } else if (network.online === false) {
      console.warn("[NetworkSync] Internet connection lost.");
    }
  }, [network.online, mounted]);

  // SSR-safe default to true until mounted
  return { online: mounted ? (network.online ?? true) : true };
}
