"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface AvatarContextValue {
  hasImage: boolean;
  setHasImage: (value: boolean) => void;
  hasError: boolean;
  setHasError: (value: boolean) => void;
  isLoaded: boolean;
  setIsLoaded: (value: boolean) => void;
  size: "default" | "sm" | "lg";
}

const AvatarContext = React.createContext<AvatarContextValue>({
  hasImage: false,
  setHasImage: () => {},
  hasError: false,
  setHasError: () => {},
  isLoaded: false,
  setIsLoaded: () => {},
  size: "default",
});

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg";
}

export function Avatar({
  className,
  size = "default",
  children,
  ...props
}: AvatarProps) {
  const [hasImage, setHasImage] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 sm:w-8 sm:h-8 text-xs",
    default: "w-9 h-9 sm:w-10 sm:h-10 text-sm",
    lg: "w-12 h-12 sm:w-14 sm:h-14 text-base",
  };

  return (
    <AvatarContext.Provider
      value={{
        hasImage,
        setHasImage,
        hasError,
        setHasError,
        isLoaded,
        setIsLoaded,
        size,
      }}
    >
      <div
        data-slot="avatar"
        data-size={size}
        className={cn(
          "group/avatar relative flex shrink-0 rounded-full overflow-hidden select-none bg-muted items-center justify-center transition-all",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, "alt"> {
  alt?: string;
}

export function AvatarImage({
  src,
  alt = "Avatar",
  className,
  ...props
}: AvatarImageProps) {
  const { setHasImage, hasError, setHasError, setIsLoaded, size } =
    React.useContext(AvatarContext);

  React.useEffect(() => {
    setHasImage(Boolean(src));
  }, [src, setHasImage]);

  if (!src || hasError) return null;

  const pixelDimensions = size === "sm" ? 32 : size === "lg" ? 56 : 40;

  return (
    <Image
      src={src}
      alt={alt}
      width={pixelDimensions}
      height={pixelDimensions}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        setHasError(true);
        setIsLoaded(false);
      }}
      className={cn("aspect-square h-full w-full object-cover rounded-2xl", className)}
      unoptimized
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  const { hasImage, hasError, isLoaded } = React.useContext(AvatarContext);

  // If image is provided and loaded without error, hide fallback
  if (hasImage && !hasError && isLoaded) {
    return null;
  }

  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center font-bold text-foreground uppercase select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AvatarBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function AvatarBadge({ className, ...props }: AvatarBadgeProps) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:w-2 group-data-[size=sm]/avatar:h-2",
        "group-data-[size=default]/avatar:w-2.5 group-data-[size=default]/avatar:h-2.5",
        "group-data-[size=lg]/avatar:w-3.5 group-data-[size=lg]/avatar:h-3.5",
        className
      )}
      {...props}
    />
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  );
}
