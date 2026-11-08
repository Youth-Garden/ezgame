import { useTranslations } from "next-intl";
import { BidaTurnState } from "../types";
import { Icons } from "@/shared/icons";
import { Card } from "@/shared/components/ui/card";

interface BidaActionBarProps {
  isOpponentOnline: boolean;
  isMyTurn: boolean;
  turnState: BidaTurnState;
  isDragging: boolean;
  power: number;
  english: { x: number; y: number };
  onOpenSpinModal: () => void;
  onCancelShot?: () => void;
}

export function BidaActionBar({
  isOpponentOnline,
  isMyTurn,
  turnState,
  isDragging,
  power,
  english,
  onOpenSpinModal,
  onCancelShot,
}: BidaActionBarProps) {
  const t = useTranslations("game");

  // Fixed container height (h-14 / 56px) with flex centering ensures zero layout shift when states alternate
  return (
    <Card
      variant="solid"
      className="mt-3.5 flex items-center justify-between gap-4 w-full h-14 px-5 sm:px-6 rounded-2xl text-xs text-foreground shadow-none border-none select-none transition-all"
    >
      {!isOpponentOnline ? (
        <div className="flex items-center justify-center gap-2 w-full text-amber-400">
          <Icons name="loader" size={14} className="animate-spin text-amber-400" />
          <span className="font-semibold tracking-wide">{t("waitingForOpponentToJoin")}</span>
        </div>
      ) : !isMyTurn ? (
        <div className="flex items-center justify-center gap-2 w-full text-neutral-400">
          <span className="font-medium tracking-wide">{t("opponentAiming")}</span>
        </div>
      ) : turnState !== BidaTurnState.AIMING ? (
        <div className="flex items-center justify-center gap-2 w-full text-emerald-400">
          <Icons name="loader" size={14} className="animate-spin text-emerald-400" />
          <span className="font-semibold tracking-wide">{t("ballsRolling")}</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {isDragging ? (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-extrabold tracking-wide text-[11px]">
                  {t("releaseToShoot")}
                </span>
                <button
                  type="button"
                  onClick={onCancelShot}
                  className="ml-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold text-[10px] tracking-wide cursor-pointer transition-colors"
                  title="Click or press Esc / Right-click to cancel"
                >
                  [ESC / Right Click] CANCEL
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <span className="font-extrabold tracking-wide text-foreground">
                  DRAG & PULL
                </span>
                <span>
                  or HOLD{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-bold font-mono text-[10px]">
                    SPACE
                  </kbd>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            {/* 8-Ball Pool Style Power Meter */}
            <div className="flex items-center gap-2.5">
              <span className="font-black text-[10px] uppercase tracking-wider text-muted-foreground">{t("power")}</span>
              <div className="w-28 sm:w-36 h-3 bg-muted rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all duration-75 shadow-sm"
                  style={{ width: `${power}%` }}
                />
              </div>
              <span className="font-black text-xs text-foreground w-8 text-right font-mono">{Math.round(power)}%</span>
            </div>

            {/* Seamless Spin Capsule Button */}
            <button
              type="button"
              onClick={onOpenSpinModal}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={t("cueBallSpin")}
            >
              <div className="relative w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
                <div
                  className="absolute w-2 h-2 rounded-full bg-rose-600 transition-transform duration-75"
                  style={{
                    transform: `translate(${english.x * 7}px, ${-english.y * 7}px)`,
                  }}
                />
              </div>
              <span className="text-[11px] font-black tracking-wide uppercase text-amber-400">
                {english.y > 0.25 ? t("follow") : english.y < -0.25 ? t("draw") : english.x !== 0 ? t("spin") : t("spin")}
              </span>
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
