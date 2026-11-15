import { cn } from "@/shared/lib/utils";

export interface SpreadPingProps {
  /**
   * Color theme variant
   * - primary: Brand primary blue (#2B6CFF / #00B4FF)
   * - emerald / success: Green (#10b981) for ready / online / connect states
   * - amber / warning: Amber (#f59e0b) for waiting opponent / caution
   * - rose / destructive: Red (#ef4444) for checkmate / danger
   * - sky: Cyan/sky (#0ea5e9)
   */
  variant?: "primary" | "emerald" | "amber" | "rose" | "sky";
  /**
   * Size presets:
   * - xs: w-1.5 h-1.5 (tiny badge or inner button indicator)
   * - sm: w-2 h-2 (default, standard dialog status indicator)
   * - md: w-2.5 h-2.5
   * - lg: w-3.5 h-3.5
   */
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  pingClassName?: string;
  dotClassName?: string;
}

const COLOR_MAP = {
  primary: {
    dot: "bg-primary",
    ping: "bg-primary/75",
  },
  emerald: {
    dot: "bg-emerald-500",
    ping: "bg-emerald-400/75",
  },
  amber: {
    dot: "bg-amber-500",
    ping: "bg-amber-400/75",
  },
  rose: {
    dot: "bg-rose-500",
    ping: "bg-rose-400/75",
  },
  sky: {
    dot: "bg-sky-500",
    ping: "bg-sky-400/75",
  },
} as const;

const SIZE_MAP = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3.5 h-3.5",
} as const;

/**
 * Reusable SpreadPing component (radar pulse / spread ping effect)
 * Used when waiting for an opponent, pending rematch confirmation, or connection indicators.
 */
export function SpreadPing({
  variant = "primary",
  size = "sm",
  className,
  pingClassName,
  dotClassName,
}: SpreadPingProps) {
  const color = COLOR_MAP[variant];
  const sizeClass = SIZE_MAP[size];

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", sizeClass, className)}
      aria-hidden="true"
    >
      {/* Outer spreading radar/ping ring */}
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full animate-ping opacity-75",
          color.ping,
          pingClassName
        )}
      />
      {/* Solid center dot */}
      <span
        className={cn(
          "relative inline-flex rounded-full h-full w-full",
          color.dot,
          dotClassName
        )}
      />
    </span>
  );
}
