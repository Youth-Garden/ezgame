"use client";

import { cn } from "@/shared/lib/utils";

interface BackdropProps {
  isOpen?: boolean;
  onPress?: () => void;
  className?: string;
}

export const Backdrop = ({ isOpen, onPress, className }: BackdropProps) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onPress}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-200 animate-in fade-in-0",
        className
      )}
      aria-hidden="true"
    />
  );
};
