"use client";

import { useEffect } from "react";

/**
 * Custom hook to lock body scrolling when a modal/dialog/sheet is open.
 * Automatically handles scrollbar width measurement to prevent layout shift (scrollbar jump).
 */
export function useLockBodyScroll(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked || typeof window === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scrolling on body
    document.body.style.overflow = "hidden";

    // Compensate for disappearing scrollbar to avoid content shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
