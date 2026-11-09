import Image from "next/image";
import { cn } from "@/shared/lib/utils";

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
  contentBelow?: React.ReactNode;
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
  contentBelow,
}: PlayerAvatarProps) {
  const isRight = align === "right";

  const ringClasses = {
    primary: "ring-primary",
    amber: "ring-amber-400",
    sky: "ring-sky-400",
    destructive: "ring-destructive",
  };

  const checkBadgeBg = {
    primary: "bg-primary",
    amber: "bg-amber-400",
    sky: "bg-sky-400",
    destructive: "bg-destructive",
  };

  const avatarDimensions = size === "sm" ? "w-8 h-8" : "w-9 h-9 sm:w-10 sm:h-10";
  const imageSize = size === "sm" ? 32 : 40;

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 min-w-0 transition-all duration-300 select-none",
        isRight && "flex-row-reverse",
        isActiveTurn ? "scale-102 opacity-100" : "opacity-60"
      )}
    >
      {/* Avatar with dynamic turn ring & status tick */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "relative rounded-2xl overflow-hidden bg-muted flex items-center justify-center transition-all",
            avatarDimensions,
            isActiveTurn && cn("ring-2 ring-offset-2 ring-offset-background", ringClasses[activeColor])
          )}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name || fallbackText}
              width={imageSize}
              height={imageSize}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xs font-black text-foreground">{fallbackText}</span>
          )}
        </div>

        {isActiveTurn && (
          <span
            className={cn(
              "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-neutral-950",
              checkBadgeBg[activeColor]
            )}
          >
            ✓
          </span>
        )}
      </div>

      {/* Info Pod */}
      <div className={cn("flex flex-col min-w-0", isRight ? "items-end text-right" : "items-start text-left")}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isRight && subBadge}
          <span className="text-xs font-bold text-foreground max-w-[90px] sm:max-w-[130px] truncate">
            {name || fallbackText}
          </span>
          {!isRight && subBadge}
        </div>

        {roleText && (
          <span className="text-[10px] font-bold uppercase text-text-secondary mt-0.5">
            {roleText}
          </span>
        )}

        {contentBelow}
      </div>
    </div>
  );
}
