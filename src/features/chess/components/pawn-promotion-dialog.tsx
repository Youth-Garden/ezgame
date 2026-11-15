"use client";

import { useTranslations } from "next-intl";
import { type PortalProps } from "@/shared/types/portal.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { ChessPieceColor, ChessPieceType } from "../types";
import { ChessPieceView } from "./chess-piece";

export interface PawnPromotionDialogData {
  color: ChessPieceColor;
  onSelect: (promotion: ChessPieceType) => void;
}

export function PawnPromotionDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<PawnPromotionDialogData>) {
  const t = useTranslations("game");

  if (!isOpen || !data) return null;

  const choices: Array<{ type: ChessPieceType; label: string }> = [
    { type: ChessPieceType.QUEEN, label: t("queen") },
    { type: ChessPieceType.ROOK, label: t("rook") },
    { type: ChessPieceType.BISHOP, label: t("bishop") },
    { type: ChessPieceType.KNIGHT, label: t("knight") },
  ];

  const handleSelect = (pieceType: ChessPieceType) => {
    data.onSelect(pieceType);
    onDismiss?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-foreground">
            {t("promotePawnTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("promotePawnDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 py-4">
          {choices.map((choice) => (
            <button
              key={choice.type}
              type="button"
              onClick={() => handleSelect(choice.type)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all transform hover:scale-105 active:scale-95 border border-border/50 shadow-sm group"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
                <ChessPieceView type={choice.type} color={data.color} />
              </div>
              <span className="text-xs font-bold text-foreground">
                {choice.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
