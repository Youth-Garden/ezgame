"use client";

import React, { type SVGProps } from "react";
import * as LucideIcons from "lucide-react";
import { iconRegistry, type IconComponent } from "./registry";

export interface IconsProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  name: string;
  size?: number | string;
  className?: string;
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function Icons({ name, size = 16, className, ...props }: IconsProps) {
  // 1. Registry lookup
  let Component: IconComponent | undefined = iconRegistry[name];

  // 2. Dynamic Lucide fallback via PascalCase conversion
  if (!Component) {
    const pascalName = toPascalCase(name);
    const LucideComp = (LucideIcons as unknown as Record<string, IconComponent>)[pascalName];
    if (LucideComp) {
      Component = LucideComp;
    }
  }

  // 3. Safety warning if not found
  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Icons: Icon "${name}" not found in registry or lucide-react.`);
    }
    return null;
  }

  return (
    <Component
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

export { iconRegistry };
export { FlagVnIcon, FlagUsIcon } from "./svgs/flag-icons";
export { EzGameLogo } from "./svgs/logo";
export { VictoryIcon3D, DefeatIcon3D, DrawIcon3D } from "./svgs/game-result-icons";
