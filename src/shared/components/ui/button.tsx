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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20 rounded-xl",
      secondary:
        "bg-slate-800 text-white hover:bg-slate-700 border border-white/10 rounded-xl",
      subtle:
        "bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10 rounded-xl",
      outline:
        "border border-white/15 bg-transparent text-white hover:bg-white/5 rounded-xl",
      ghost:
        "text-white/70 hover:text-white hover:bg-white/10 rounded-xl",
      destructive:
        "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 rounded-xl",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base",
      icon: "h-9 w-9 p-0",
      "icon-sm": "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
