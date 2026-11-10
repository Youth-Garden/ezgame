/**
 * Standard Tailwind CSS Breakpoints in pixels
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  // Semantic Aliases
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
