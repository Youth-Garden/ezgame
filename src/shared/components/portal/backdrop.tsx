"use client";

import { cn } from "@/shared/lib/utils";

interface BackdropProps {
  isOpen?: boolean;
  onPress?: () => void;
  className?: string;
}

export const Backdrop = ({ isOpen, onPress, className }: BackdropProps) => {
  return (
    <div
      onClick={onPress}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 ease-out",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className
      )}
      aria-hidden="true"
    />
  );
};
