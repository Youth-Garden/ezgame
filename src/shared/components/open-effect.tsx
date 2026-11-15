"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface OpenEffectProps {
  children: ReactNode;
  activeKey?: string | number;
  className?: string;
  duration?: number;
}

/**
 * OpenEffect Component
 * Smoothly animates content transitions with height auto-growth/shrink (grow)
 * using an inner container measurement and pure CSS height transition.
 */
export function OpenEffect({
  children,
  activeKey,
  className,
  duration = 260,
}: OpenEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isInitial = useRef(true);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateHeight = () => {
      // scrollHeight measures the full unclipped height of the content including margins/elements
      const h = Math.max(content.scrollHeight, content.offsetHeight);
      if (h > 0) {
        setHeight(h);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [activeKey, children]);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: height !== undefined ? `${height}px` : "auto",
        transitionDuration: isInitial.current ? "0ms" : `${duration}ms`,
      }}
      className={cn(
        "relative w-full overflow-hidden transition-[height] ease-[cubic-bezier(0.16,1,0.3,1)]",
        className
      )}
    >
      <div
        key={activeKey}
        ref={contentRef}
        className="w-full pb-1 animate-in fade-in-60 zoom-in-98 duration-200 ease-out"
      >
        {children}
      </div>
    </div>
  );
}

