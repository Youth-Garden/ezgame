"use client";

import { useState, useCallback, useRef, type MouseEvent } from "react";

export interface Ripple {
  x: number;
  y: number;
  id: number;
  size: number;
}

export function useRipple<T extends HTMLElement = HTMLElement>() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastRippleTimeRef = useRef(0);

  const createRipple = useCallback((event: MouseEvent<T>) => {
    const now = Date.now();
    // Throttle ripple trigger to at most once every 180ms to prevent spamming
    if (now - lastRippleTimeRef.current < 180) {
      return;
    }
    lastRippleTimeRef.current = now;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate maximum radius to cover the entire element bounds
    const size = Math.max(rect.width, rect.height) * 2;
    const rippleId = now + Math.random();
    const newRipple: Ripple = { x, y, id: rippleId, size };

    // Keep at most 2 active ripples concurrently
    setRipples((prev) => [...prev.slice(-1), newRipple]);

    // Automatically remove after animation finishes (500ms)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 500);
  }, []);

  const RippleContainer = useCallback(
    ({ className }: { className?: string } = {}) => {
      if (ripples.length === 0) return null;
      return (
        <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className={`absolute rounded-full bg-white/20 dark:bg-white/15 pointer-events-none animate-ripple ${
                className || ""
              }`}
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </span>
      );
    },
    [ripples]
  );

  return {
    createRipple,
    RippleContainer,
  };
}
