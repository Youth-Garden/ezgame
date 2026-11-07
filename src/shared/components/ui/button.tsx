"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { useRipple } from "@/shared/hooks/use-ripple";

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
  enableRipple?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      enableRipple = true,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const { createRipple, RippleContainer } = useRipple<HTMLButtonElement>();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (enableRipple) {
        createRipple(event);
      }
      onClick?.(event);
    };

    const baseStyles =
      "relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer";

    const variantStyles = {
      default:
        "bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm rounded-lg",
      secondary:
        "bg-neutral-800 text-neutral-100 hover:bg-neutral-750 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg",
      subtle:
        "bg-muted text-foreground hover:bg-muted/80 rounded-lg",
      outline:
        "bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-foreground rounded-lg shadow-2xs",
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
        {enableRipple && <RippleContainer />}
      </button>
    );
  }
);

Button.displayName = "Button";
