"use client";

import { useEffect, useState, useCallback } from "react";

const THEME_KEY = "ezgame_theme";

export function useSyncTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
      const initial = stored || "dark";
      setThemeState(initial);
      const root = document.documentElement;
      if (initial === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch {
      // Ignore
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: "dark" | "light", clickCoordinates?: { clientX: number; clientY: number }) => {
      const applyTheme = () => {
        try {
          localStorage.setItem(THEME_KEY, newTheme);
          const root = document.documentElement;
          if (newTheme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        } catch {
          // Ignore
        }
        setThemeState(newTheme);
      };

      // Native circular ripple reveal using View Transitions API if supported
      const doc = document as unknown as {
        startViewTransition?: (callback: () => void) => { ready: Promise<void> };
      };

      if (
        typeof document !== "undefined" &&
        doc.startViewTransition &&
        clickCoordinates
      ) {
        const { clientX, clientY } = clickCoordinates;
        const right = window.innerWidth - clientX;
        const bottom = window.innerHeight - clientY;
        const maxRadius = Math.hypot(
          Math.max(clientX, right),
          Math.max(clientY, bottom)
        );

        const transition = doc.startViewTransition(() => {
          applyTheme();
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${clientX}px ${clientY}px)`,
                `circle(${maxRadius}px at ${clientX}px ${clientY}px)`,
              ],
            },
            {
              duration: 500,
              easing: "ease-in-out",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        });
        return;
      }

      applyTheme();
    },
    []
  );

  const toggleTheme = useCallback(
    (event?: React.MouseEvent) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      const coords = event
        ? { clientX: event.clientX, clientY: event.clientY }
        : undefined;
      setTheme(nextTheme, coords);
    },
    [theme, setTheme]
  );

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}
