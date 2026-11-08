"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { PortalProps } from "@/shared/types/portal.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export interface BidaSpinDialogData {
  initialEnglish: { x: number; y: number };
  onApply: (english: { x: number; y: number }) => void;
}

export function BidaSpinDialog({
  isOpen = false,
  onDismiss,
  data,
}: PortalProps<BidaSpinDialogData>) {
  const t = useTranslations("game");
  const [spin, setSpin] = useState<{ x: number; y: number }>(() => data?.initialEnglish ?? { x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const discRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePointer = (clientX: number, clientY: number) => {
    if (!discRef.current) return;
    const rect = discRef.current.getBoundingClientRect();
    const radius = rect.width / 2;
    const clickX = (clientX - rect.left - radius) / radius;
    const clickY = -(clientY - rect.top - radius) / radius;
    const dist = Math.hypot(clickX, clickY);

    if (dist <= 1) {
      setSpin({ x: clickX, y: clickY });
    } else {
      setSpin({ x: clickX / dist, y: clickY / dist });
    }
  };

  const getSpinDescription = () => {
    const parts: string[] = [];
    if (spin.y > 0.25) parts.push(t("follow"));
    else if (spin.y < -0.25) parts.push(t("draw"));
    else parts.push(t("center"));

    if (spin.x > 0.25) parts.push(t("englishRight"));
    else if (spin.x < -0.25) parts.push(t("englishLeft"));

    return parts.join(" • ");
  };

  const handleConfirm = () => {
    data?.onApply(spin);
    onDismiss?.();
  };

  const handleReset = () => {
    setSpin({ x: 0, y: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={true} className="w-full max-w-sm rounded-[28px] p-6 flex flex-col items-center gap-5">
        <DialogHeader className="w-full text-center sm:text-center items-center justify-center">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-foreground text-center w-full">
            {t("cueBallSpin")}
          </DialogTitle>
        </DialogHeader>

        {/* 8-Ball Pool Style Realistic Cue Ball */}
        <div className="relative flex flex-col items-center justify-center">
          <div
            ref={discRef}
            className="relative w-52 h-52 rounded-full bg-radial from-white via-slate-100 to-slate-300 dark:from-neutral-100 dark:via-neutral-200 dark:to-neutral-400 border-none shadow-[0_16px_40px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] cursor-crosshair flex items-center justify-center overflow-hidden hover:scale-102 transition-transform"
            onPointerDown={(e) => {
              isDraggingRef.current = true;
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              handlePointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (isDraggingRef.current) {
                handlePointer(e.clientX, e.clientY);
              }
            }}
            onPointerUp={(e) => {
              isDraggingRef.current = false;
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            }}
          >
            {/* Fine Hairline Reticle */}
            <div className="absolute w-full h-[1px] bg-neutral-400/40 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-neutral-400/40 pointer-events-none" />
            <div className="absolute w-32 h-32 rounded-full border border-neutral-400/30 pointer-events-none" />

            {/* Cue Tip Strike Indicator */}
            <div
              className="absolute w-7 h-7 rounded-full bg-destructive shadow-md pointer-events-none transition-transform duration-75 flex items-center justify-center"
              style={{
                transform: `translate(${spin.x * 88}px, ${-spin.y * 88}px)`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { label: t("follow"), x: 0, y: 0.8 },
              { label: t("draw"), x: 0, y: -0.8 },
              { label: t("englishLeft"), x: -0.8, y: 0 },
              { label: t("englishRight"), x: 0.8, y: 0 },
            ].map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSpin({ x: preset.x, y: preset.y })}
                className="text-xs font-semibold"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current State Info */}
        <div className="w-full text-center py-2.5 px-4 rounded-xl bg-secondary/60 border-none shadow-none">
          <span className="text-xs font-bold tracking-wide text-foreground uppercase">{getSpinDescription()}</span>
          <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
            X: {Math.round(spin.x * 100)}% • Y: {Math.round(spin.y * 100)}%
          </span>
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between pt-1">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            {t("resetCenter")}
          </Button>
          <Button variant="default" size="sm" onClick={handleConfirm} className="font-bold px-6">
            {t("apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
