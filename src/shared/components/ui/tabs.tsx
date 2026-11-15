"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
  orientation: "horizontal" | "vertical";
  registerTrigger: (value: string, element: HTMLButtonElement | null) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be rendered inside <Tabs />");
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "");
  const triggersMapRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  const registerTrigger = React.useCallback(
    (val: string, element: HTMLButtonElement | null) => {
      if (element) {
        triggersMapRef.current.set(val, element);
      } else {
        triggersMapRef.current.delete(val);
      }
    },
    []
  );

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        orientation,
        registerTrigger,
      }}
    >
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "flex flex-col gap-2",
          orientation === "vertical" && "flex-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "line";
}

export function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsListProps) {
  const { orientation, value } = useTabsContext();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });

  // Update sliding indicator pill whenever active value or children change
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const activeTrigger = list.querySelector<HTMLButtonElement>(
      `[data-slot="tabs-trigger"][data-state="active"]`
    );

    if (activeTrigger) {
      setIndicatorStyle({
        left: activeTrigger.offsetLeft,
        top: activeTrigger.offsetTop,
        width: activeTrigger.offsetWidth,
        height: activeTrigger.offsetHeight,
        opacity: 1,
      });
    }
  }, [value, children]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "relative inline-flex w-full items-center justify-center rounded-xl p-1 bg-secondary text-muted-foreground select-none",
        variant === "line" && "bg-transparent gap-1 rounded-none",
        orientation === "vertical" && "flex-col w-auto",
        className
      )}
      {...props}
    >
      {/* Sliding Active Pill Indicator */}
      {variant === "default" && (
        <div
          data-slot="tabs-indicator"
          className="absolute rounded-lg bg-card shadow-xs transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          style={{
            transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
            width: indicatorStyle.width ? `${indicatorStyle.width}px` : "auto",
            height: indicatorStyle.height ? `${indicatorStyle.height}px` : "auto",
            opacity: indicatorStyle.opacity,
            left: 0,
            top: 0,
          }}
        />
      )}

      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  onClick,
  ...props
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, registerTrigger } = useTabsContext();
  const isActive = selectedValue === value;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    registerTrigger(value, triggerRef.current);
    return () => registerTrigger(value, null);
  }, [value, registerTrigger]);

  return (
    <button
      ref={triggerRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      onClick={(event) => {
        onValueChange(value);
        onClick?.(event);
      }}
      className={cn(
        "relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer outline-none select-none",
        isActive
          ? "text-foreground font-bold"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  if (selectedValue !== value) return null;

  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      data-state={selectedValue === value ? "active" : "inactive"}
      className={cn("flex-1 outline-none animate-in fade-in-50 duration-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}
