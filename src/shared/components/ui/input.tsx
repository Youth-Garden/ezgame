import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-secondary/80 dark:bg-secondary text-foreground placeholder:text-muted-foreground font-mono tracking-wider text-sm outline-none border-none focus:ring-2 focus:ring-primary/40 transition-all shadow-xs",
          error && "focus:ring-2 focus:ring-destructive/50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
