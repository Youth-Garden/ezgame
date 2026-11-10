import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "subtle"
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
    // Subtle modern tones without any borders
    default: "bg-primary/15 text-primary font-semibold",
    secondary: "bg-muted text-muted-foreground font-medium",
    subtle: "bg-muted/80 text-foreground font-medium",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold",
    destructive: "bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold",
    solids: "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold",
    stripes: "bg-sky-500/15 text-sky-700 dark:text-sky-400 font-bold",
    ghost: "bg-transparent text-foreground",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[10px]",
    default: "px-3.5 py-1 text-[11px]",
    lg: "px-4.5 py-1.5 text-xs",
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
