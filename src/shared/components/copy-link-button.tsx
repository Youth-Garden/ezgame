"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CopyLinkButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
}

export function CopyLinkButton({
  textToCopy,
  label = "Sao chép link mời",
  className,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-sm",
        copied
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 hover:border-white/20",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in-75 duration-150" />
          <span>Đã sao chép!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-cyan-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
