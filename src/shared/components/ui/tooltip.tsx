"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  delayDuration: number;
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  setOpen: () => {},
  delayDuration: 0,
});

interface TooltipProviderContextValue {
  delayDuration: number;
}

const TooltipProviderContext = React.createContext<TooltipProviderContextValue>({
  delayDuration: 150,
});

export function TooltipProvider({
  delayDuration = 150,
  children,
}: {
  delayDuration?: number;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ delayDuration }), [delayDuration]);
  return (
    <TooltipProviderContext.Provider value={value}>
      {children}
    </TooltipProviderContext.Provider>
  );
}

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children: React.ReactNode;
}

export function Tooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration: localDelay,
  children,
}: TooltipProps) {
  const providerContext = React.useContext(TooltipProviderContext);
  const delayDuration = localDelay ?? providerContext.delayDuration;

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(
    () => ({ open, setOpen, delayDuration }),
    [open, setOpen, delayDuration]
  );

  return (
    <TooltipContext.Provider value={value}>
      <div className="relative inline-flex items-center justify-center">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  TooltipTriggerProps
>(({ asChild, children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
  const { setOpen, delayDuration } = React.useContext(TooltipContext);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(event);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), delayDuration);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    onMouseLeave?.(event);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), delayDuration);
  };

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{
      onMouseEnter?: React.MouseEventHandler;
      onMouseLeave?: React.MouseEventHandler;
      onFocus?: React.FocusEventHandler;
      onBlur?: React.FocusEventHandler;
      ref?: React.Ref<unknown>;
    }>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ref,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      data-slot="tooltip-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </button>
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  collisionPadding?: number;
}

export function TooltipContent({
  className,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  collisionPadding = 8,
  children,
  ...props
}: TooltipContentProps) {
  const { open } = React.useContext(TooltipContext);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [adjustedOffset, setAdjustedOffset] = React.useState<number>(0);

  // Auto collision boundary detection against window viewport edges
  React.useEffect(() => {
    if (!open || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.left < collisionPadding) {
      // Clamped to left window edge
      setAdjustedOffset(collisionPadding - rect.left);
    } else if (rect.right > viewportWidth - collisionPadding) {
      // Clamped to right window edge
      setAdjustedOffset(viewportWidth - collisionPadding - rect.right);
    } else {
      setAdjustedOffset(0);
    }
  }, [open, collisionPadding]);

  if (!open) return null;

  const alignStyles = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const sideStyles = {
    top: `bottom-full ${alignStyles[align]}`,
    bottom: `top-full ${alignStyles[align]}`,
    left: "right-full top-1/2 -translate-y-1/2",
    right: "left-full top-1/2 -translate-y-1/2",
  };

  const offsetMargin = {
    top: { marginBottom: `${sideOffset}px`, transform: adjustedOffset ? `translateX(${adjustedOffset}px)` : undefined },
    bottom: { marginTop: `${sideOffset}px`, transform: adjustedOffset ? `translateX(${adjustedOffset}px)` : undefined },
    left: { marginRight: `${sideOffset}px` },
    right: { marginLeft: `${sideOffset}px` },
  };

  return (
    <div
      ref={contentRef}
      role="tooltip"
      data-slot="tooltip-content"
      style={offsetMargin[side]}
      className={cn(
        "absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-xs font-medium leading-none rounded-lg",
        "bg-foreground text-background shadow-lg backdrop-blur-sm select-none",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        sideStyles[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
