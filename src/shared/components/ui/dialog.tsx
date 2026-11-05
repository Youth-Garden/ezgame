"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
});

export function useDialog() {
  return React.useContext(DialogContext);
}

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
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

  const value = React.useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function DialogOverlay({ className, onClick, ...props }: DialogOverlayProps) {
  const { onOpenChange } = useDialog();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      onOpenChange?.(false);
    }
  };

  return (
    <div
      data-slot="dialog-overlay"
      onClick={handleClick}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs duration-150 animate-in fade-in-0",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  onClick,
  ...props
}: DialogContentProps) {
  const { onOpenChange } = useDialog();

  const handleStopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <div
      data-slot="dialog-content"
      onClick={handleStopPropagation}
      className={cn(
        "relative z-50 w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl transition-all duration-150 animate-in fade-in-0 zoom-in-98",
        className
      )}
      {...props}
    >
      {children}

      {showCloseButton && (
        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="dialog-title"
      className={cn("text-lg font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-xs text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}
