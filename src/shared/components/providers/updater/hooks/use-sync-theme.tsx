"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { cookieUtils } from "@/shared/utils/cookie";

export type ThemeMode = "dark" | "light";

export const THEME_COOKIE_KEY = "ezgame_theme";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode, clickCoordinates?: { clientX: number; clientY: number }) => void;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({
  children,
  initialTheme = "dark",
}: {
  children: ReactNode;
  initialTheme?: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);

  // Sync to cookie and DOM on mount if different or missing
  useEffect(() => {
    try {
      const stored = (cookieUtils.get(THEME_COOKIE_KEY) || localStorage.getItem(THEME_COOKIE_KEY)) as ThemeMode | null;
      if (stored && (stored === "dark" || stored === "light")) {
        setThemeState(stored);
        const root = document.documentElement;
        if (stored === "dark") {
          root.classList.add("dark");
          root.style.colorScheme = "dark";
          root.style.backgroundColor = "#09090b";
        } else {
          root.classList.remove("dark");
          root.style.colorScheme = "light";
          root.style.backgroundColor = "#edf1f7";
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeMode, clickCoordinates?: { clientX: number; clientY: number }) => {
      const applyTheme = () => {
        try {
          cookieUtils.set(THEME_COOKIE_KEY, newTheme);
          localStorage.setItem(THEME_COOKIE_KEY, newTheme);
          const root = document.documentElement;
          if (newTheme === "dark") {
            root.classList.add("dark");
            root.style.colorScheme = "dark";
            root.style.backgroundColor = "#09090b";
          } else {
            root.classList.remove("dark");
            root.style.colorScheme = "light";
            root.style.backgroundColor = "#edf1f7";
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSyncTheme() {
  return useContext(ThemeContext);
}
