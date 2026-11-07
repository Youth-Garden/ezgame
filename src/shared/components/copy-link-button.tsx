"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";

interface CopyLinkButtonProps {
  textToCopy?: string;
  url?: string;
  label?: string;
  className?: string;
}

export function CopyLinkButton({
  textToCopy,
  url,
  label = "Copy invite link",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const targetText = textToCopy || url || "";

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
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2 font-mono text-xs"
    >
      {copied ? (
        <>
          <Icons name="check" size={14} className="text-emerald-500 animate-in zoom-in-75 duration-150" />
          <span className="text-emerald-500 font-sans font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Icons name="copy" size={14} className="text-muted-foreground" />
          <span className="font-sans">{label}</span>
        </>
      )}
    </Button>
  );
}
