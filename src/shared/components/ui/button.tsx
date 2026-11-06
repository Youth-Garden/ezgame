"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "subtle"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = { x, y, id: Date.now() };
      setRipples((prev) => [...prev, newRipple]);

      onClick?.(event);
    };

    React.useEffect(() => {
      if (ripples.length === 0) return;
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }, [ripples]);

    const baseStyles =
      "relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm rounded-lg",
      secondary:
        "bg-neutral-800 text-neutral-100 hover:bg-neutral-750 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg",
      subtle:
        "bg-muted text-foreground hover:bg-muted/80 rounded-lg",
      outline:
        "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg shadow-2xs",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg",
      destructive:
        "bg-destructive/15 text-destructive hover:bg-destructive/25 rounded-lg",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-5 text-sm",
      icon: "h-9 w-9 p-0",
      "icon-sm": "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/25 pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </button>
    );
  }
);

Button.displayName = "Button";
