"use client";

import { useState, useCallback, useEffect, type MouseEvent } from "react";

export interface Ripple {
  x: number;
  y: number;
  id: number;
  size: number;
}

export function useRipple<T extends HTMLElement = HTMLElement>() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((event: MouseEvent<T>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate maximum radius to cover the entire element bounds
    const size = Math.max(rect.width, rect.height) * 2;
    const newRipple: Ripple = { x, y, id: Date.now() + Math.random(), size };

    setRipples((prev) => [...prev, newRipple]);
  }, []);

  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

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
