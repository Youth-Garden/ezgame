"use client";

import { ReactNode } from "react";
import { PortalRenderer } from "@/shared/components/portal";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

interface UIProviderProps {
  children: ReactNode;
}

/**
 * UIProvider centralizes all UI-level layers, floating portal renderers,
 * tooltip provider contexts, and interactive dialog contexts across EzGame.
 */
export function UIProvider({ children }: UIProviderProps) {
  return (
    <TooltipProvider delayDuration={150}>
      {children}
      <PortalRenderer />
    </TooltipProvider>
  );
}
