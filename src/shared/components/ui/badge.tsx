import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "warning"
    | "success"
    | "destructive"
    | "solids"
    | "stripes"
    | "ghost";
  size?: "default" | "sm" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    // Subtle, modern tones - not harsh, highly legible
    default: "bg-primary/10 text-primary",
    secondary: "bg-muted text-muted-foreground",
    warning: "bg-amber-400/10 text-amber-300",
    success: "bg-emerald-400/10 text-emerald-300",
    destructive: "bg-rose-400/10 text-rose-300",
    solids: "bg-amber-400/10 text-amber-300",
    stripes: "bg-sky-400/10 text-sky-300",
    ghost: "bg-transparent text-foreground",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    default: "px-3 py-1 text-[11px]",
    lg: "px-4 py-1.5 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-wide uppercase rounded-full select-none transition-colors border-none shadow-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
