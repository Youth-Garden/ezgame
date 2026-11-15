import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";

interface PlayerAvatarProps {
  name?: string;
  avatarUrl?: string;
  roleText?: string;
  fallbackText: string;
  isActiveTurn?: boolean;
  activeColor?: "amber" | "sky" | "primary" | "destructive";
  size?: "default" | "sm";
  align?: "left" | "right";
  subBadge?: React.ReactNode;
  badgePosition?: "beside" | "below";
  contentBelow?: React.ReactNode;
  timeLeft?: number;
  timeFraction?: number;
  totalTime?: number;
  isTimerWarning?: boolean;
}

/**
 * Interpolate RGB color between Green (#22c55e) -> Amber (#eab308) -> Red (#ef4444)
 * based on remaining time fraction (1.0 = full green, 0.0 = red).
 */
function getCountdownColor(fraction: number): string {
  if (fraction > 0.5) {
    // 1.0 (Green #22c55e: 34, 197, 94) to 0.5 (Yellow #eab308: 234, 179, 8)
    const factor = (1 - fraction) * 2; // 0 to 1
    const r = Math.round(34 + (234 - 34) * factor);
    const g = Math.round(197 + (179 - 197) * factor);
    const b = Math.round(94 + (8 - 94) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // 0.5 (Yellow #eab308: 234, 179, 8) to 0.0 (Red #ef4444: 239, 68, 68)
    const factor = (0.5 - fraction) * 2; // 0 to 1
    const r = Math.round(234 + (239 - 234) * factor);
    const g = Math.round(179 + (68 - 179) * factor);
    const b = Math.round(8 + (68 - 8) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function PlayerAvatar({
  name,
  avatarUrl,
  roleText,
  fallbackText,
  isActiveTurn = false,
  activeColor = "primary",
  size = "default",
  align = "left",
  subBadge,
  badgePosition = "below",
  contentBelow,
  timeLeft,
  timeFraction,
  totalTime = 45,
  isTimerWarning = false,
}: PlayerAvatarProps) {
  const isRight = align === "right";

  // SVG Progress Ring Parameters:
  // sm avatar: 32px (w-8 h-8), ringSize: 42px (container 44px) -> avatar sits comfortably inside
  // default avatar: 40px (w-10 h-10), ringSize: 50px (container 52px) -> avatar sits comfortably inside
  const ringSize = size === "sm" ? 42 : 50;
  const strokeWidth = 3;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate timer fraction (1.0 down to 0) continuously
  const fraction =
    typeof timeFraction === "number"
      ? Math.max(0, Math.min(1, timeFraction))
      : typeof timeLeft === "number" && totalTime > 0
      ? Math.max(0, Math.min(1, timeLeft / totalTime))
      : 1;
  const strokeDashoffset = circumference * (1 - fraction);
  const ringStrokeColor = getCountdownColor(fraction);

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 transition-all duration-300 select-none",
        isRight && "flex-row-reverse",
        isActiveTurn ? "scale-102 opacity-100" : "opacity-60"
      )}
    >
      {/* Avatar Container with Animated Circular Countdown Ring around Avatar */}
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center",
          size === "sm" ? "w-[42px] h-[42px]" : "w-[50px] h-[50px]"
        )}
      >
        {/* Animated Countdown SVG Ring */}
        {isActiveTurn && typeof timeLeft === "number" && (
          <svg
            className="absolute inset-0 m-auto pointer-events-none transition-all z-10"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            style={{
              filter: isTimerWarning
                ? "drop-shadow(0 0 6px rgba(239,68,68,0.7))"
                : `drop-shadow(0 0 5px ${ringStrokeColor}66)`,
            }}
          >
            {/* Background Track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {/* Active Countdown Progress: Green -> Amber -> Red */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={ringStrokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </svg>
        )}

        <Avatar
          size={size}
          src={avatarUrl}
          fallback={fallbackText}
          className="transition-all z-0"
        />
      </div>

      {/* Info Pod */}
      <div
        className={cn(
          "flex flex-col min-w-0 justify-center",
          isRight ? "items-end text-right" : "items-start text-left"
        )}
      >
        {/* Name and optional beside badge */}
        <div className="flex items-center gap-1 max-w-[70px] xs:max-w-[95px] sm:max-w-[150px] min-w-0">
          {isRight && badgePosition === "beside" && subBadge}
          <span className="text-[11px] sm:text-xs font-bold text-foreground truncate min-w-0">
            {name || fallbackText}
          </span>
          {!isRight && badgePosition === "beside" && subBadge}
        </div>

        {/* SubBadge placed below the name or along with contentBelow */}
        {(badgePosition === "below" && subBadge || contentBelow) && (
          <div
            className={cn(
              "mt-0.5 flex items-center gap-1.5 min-w-0 h-5",
              isRight && "flex-row-reverse"
            )}
          >
            {badgePosition === "below" && subBadge && (
              <div className="shrink-0 flex items-center">{subBadge}</div>
            )}
            {contentBelow}
          </div>
        )}

        {roleText && (
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground mt-0.5 truncate w-full">
            {roleText}
          </span>
        )}
      </div>
    </div>
  );
}
