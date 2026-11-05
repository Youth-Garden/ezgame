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
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm duration-200 animate-in fade-in-0",
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
        "relative z-50 w-full max-w-md gap-4 rounded-3xl border border-white/15 bg-slate-900/95 backdrop-blur-2xl p-6 text-white shadow-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}

      {showCloseButton && (
        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 rounded-full p-1 text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Đóng"
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
      className={cn("text-xl font-bold tracking-tight text-white", className)}
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
      className={cn("text-sm text-white/70 leading-relaxed", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-4",
        className
      )}
      {...props}
    />
  );
}

export function DialogClose({
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDialog();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      onOpenChange?.(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
