"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
});

export function useSheet() {
  return React.useContext(SheetContext);
}

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const [mounted, setMounted] = React.useState(open);

  if (open && !mounted) {
    setMounted(true);
  }

  React.useEffect(() => {
    if (!open && mounted) {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open, mounted]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange?.(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  showCloseButton?: boolean;
}

export function SheetContent({
  className,
  children,
  side = "bottom",
  showCloseButton = true,
  onClick,
  ...props
}: SheetContentProps) {
  const { open, onOpenChange } = useSheet();

  const handleStopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  const sideClasses = {
    bottom: "inset-x-0 bottom-0 rounded-t-3xl",
    top: "inset-x-0 top-0 rounded-b-3xl",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-3xl",
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-3xl",
  };

  return (
    <div
      data-slot="sheet-content"
      data-side={side}
      onClick={handleStopPropagation}
      className={cn(
        "relative z-50 w-full bg-popover p-6 text-popover-foreground shadow-2xl border-none transition-all duration-200 ease-out select-none",
        sideClasses[side],
        open ? "animate-modal-in" : "animate-modal-out pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Pull Indicator Pill for bottom sheet */}
      {side === "bottom" && (
        <div className="w-10 h-1.5 rounded-full bg-muted mx-auto -mt-2 mb-4 shrink-0" />
      )}

      {children}

      {showCloseButton && (
        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="sheet-title"
      className={cn("text-base font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col sm:flex-row gap-2 pt-4", className)}
      {...props}
    />
  );
}
