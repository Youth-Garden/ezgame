import type { ComponentType, SVGProps } from "react";
import * as LucideIcons from "lucide-react";
import { FlagVnIcon, FlagUsIcon } from "./svgs/flag-icons";
import { EzGameLogo } from "./svgs/logo";
import { VictoryIcon3D, DefeatIcon3D, DrawIcon3D } from "./svgs/game-result-icons";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export const iconRegistry: Record<string, IconComponent> = {
  // Brand Logo
  "logo": EzGameLogo,
  "ezgame": EzGameLogo,

  // 3D Game Result Illustrations
  "victory-3d": VictoryIcon3D,
  "defeat-3d": DefeatIcon3D,
  "draw-3d": DrawIcon3D,

  // Custom SVG flags
  "flag-vn": FlagVnIcon,
  "flag-us": FlagUsIcon,

  // Common semantic aliases
  search: LucideIcons.Search,
  close: LucideIcons.X,
  plus: LucideIcons.Plus,
  check: LucideIcons.Check,
  languages: LucideIcons.Languages,
  "chevron-down": LucideIcons.ChevronDown,
  sun: LucideIcons.Sun,
  moon: LucideIcons.Moon,
  gamepad: LucideIcons.Gamepad2,
  zap: LucideIcons.Zap,
  users: LucideIcons.Users,
  "arrow-right": LucideIcons.ArrowRight,
  "arrow-left": LucideIcons.ArrowLeft,
  "arrow-left-right": LucideIcons.ArrowLeftRight,
  trophy: LucideIcons.Trophy,
  sparkles: LucideIcons.Sparkles,
  "alert-circle": LucideIcons.AlertCircle,
  "shield-alert": LucideIcons.ShieldAlert,
  flag: LucideIcons.Flag,
  volume2: LucideIcons.Volume2,
  volumex: LucideIcons.VolumeX,
  rotateccw: LucideIcons.RotateCcw,
  home: LucideIcons.Home,
  copy: LucideIcons.Copy,
  minus: LucideIcons.MinusCircle,
  frown: LucideIcons.Frown,
};
