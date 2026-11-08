"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import { Icons } from "@/shared/icons";

interface CopyLinkButtonProps {
  textToCopy?: string;
  url?: string;
  label?: string;
  tooltipText?: string;
  className?: string;
}

export function CopyLinkButton({
  textToCopy,
  url,
  label,
  tooltipText,
  className,
}: CopyLinkButtonProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [copied, setCopied] = useState(false);
  const targetText = textToCopy || url || "";

  const defaultLabel = label ?? tNav("copyInviteLink");
  const defaultTooltip = tooltipText ?? (copied ? tCommon("copied") : tNav("copyInviteLinkDesc"));

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = targetText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className={`gap-2 font-mono text-xs ${className || ""}`}
          aria-label={defaultLabel}
        >
          {copied ? (
            <>
              <Icons name="check" size={14} className="text-emerald-500 animate-in zoom-in-75 duration-150" />
              <span className="text-emerald-500 font-sans font-medium">{tCommon("copied")}</span>
            </>
          ) : (
            <>
              <Icons name="copy" size={14} className="text-muted-foreground" />
              <span className="font-sans">{defaultLabel}</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        {defaultTooltip}
      </TooltipContent>
    </Tooltip>
  );
}

