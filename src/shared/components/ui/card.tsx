"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "outline";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "solid", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200 select-none",
          variant === "solid" && "bg-card text-card-foreground border-none",
          variant === "outline" && "bg-transparent text-card-foreground border border-border/80",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
