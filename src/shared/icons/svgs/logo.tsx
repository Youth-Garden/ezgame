import Image from "next/image";
import type { SVGProps } from "react";

export function EzGameLogo({
  size = 32,
  className = "",
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  const numericSize = typeof size === "number" ? size : parseInt(String(size), 10) || 32;

  return (
    <Image
      src="/logo.png"
      alt="EzGame Logo"
      width={numericSize}
      height={numericSize}
      className={`object-contain select-none pointer-events-none ${className}`}
      priority
    />
  );
}
