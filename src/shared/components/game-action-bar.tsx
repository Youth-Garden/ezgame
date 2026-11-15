"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";

export interface GameActionBarProps {
  canSurrender: boolean;
  onSurrender: () => void;
  maxWidthClass?: string;
  leftContent?: React.ReactNode;
  className?: string;
}

export function GameActionBar({
  canSurrender,
  onSurrender,
  maxWidthClass = "max-w-[520px]",
  leftContent,
  className = "",
}: GameActionBarProps) {
  const t = useTranslations("game");

  return (
    <div
      className={`w-full ${maxWidthClass} h-8 flex items-center justify-between gap-2 select-none ${className}`}
    >
      <div>{leftContent}</div>

      <div className="flex items-center gap-2">
        {canSurrender && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onSurrender}
            className="text-xs gap-1.5"
          >
            <Icons name="flag" size={14} />
            <span>{t("surrender")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
