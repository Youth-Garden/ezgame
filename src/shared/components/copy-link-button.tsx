"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

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
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = targetText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
          <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-75 duration-150" />
          <span className="text-emerald-500 font-sans font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-sans">{label}</span>
        </>
      )}
    </Button>
  );
}
