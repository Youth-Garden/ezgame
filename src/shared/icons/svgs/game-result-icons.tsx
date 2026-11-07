import type { SVGProps } from "react";

/**
 * 3D / Claymorphic Victory Trophy SVG Icon
 */
export function VictoryIcon3D({
  size = 72,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <defs>
        {/* Gold 3D Gradients */}
        <linearGradient id="gold-cup" x1="25" y1="20" x2="75" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <linearGradient id="gold-handle" x1="15" y1="25" x2="35" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="gold-base" x1="30" y1="65" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        <linearGradient id="star-glow" x1="40" y1="28" x2="60" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Soft 3D Dropshadow */}
        <filter id="trophy-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#ca8a04" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#trophy-shadow)">
        {/* Left Handle */}
        <path
          d="M32 28 C16 28 14 52 34 50"
          stroke="url(#gold-handle)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Right Handle */}
        <path
          d="M68 28 C84 28 86 52 66 50"
          stroke="url(#gold-handle)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Trophy Cup Body */}
        <path
          d="M26 22 H74 C74 46 64 58 50 60 C36 58 26 46 26 22 Z"
          fill="url(#gold-cup)"
        />

        {/* Cup Inner Depth Ellipse */}
        <ellipse cx="50" cy="22" rx="24" ry="5.5" fill="#ca8a04" />
        <ellipse cx="50" cy="21" rx="22" ry="4" fill="#fef08a" />

        {/* Trophy Stem */}
        <path d="M44 60 H56 V72 H44 Z" fill="url(#gold-cup)" />

        {/* Trophy Pedestal Base */}
        <rect x="32" y="72" width="36" height="8" rx="4" fill="url(#gold-cup)" />
        <path d="M28 80 H72 L76 90 H24 L28 80 Z" fill="url(#gold-base)" rx="3" />

        {/* 3D Embossed Star Badge on Cup */}
        <polygon
          points="50,30 53,38 61,38 54,43 57,51 50,46 43,51 46,43 39,38 47,38"
          fill="url(#star-glow)"
        />

        {/* Glossy Curved Highlight */}
        <path
          d="M32 26 C32 44 40 52 48 54 C40 50 35 40 35 26 Z"
          fill="#ffffff"
          opacity="0.4"
        />

        {/* Sparkles */}
        <circle cx="75" cy="18" r="2.5" fill="#fef08a" />
        <circle cx="25" cy="16" r="1.8" fill="#fef08a" />
      </g>
    </svg>
  );
}

/**
 * 3D / Cartoon Defeat Skull/Shield SVG Icon
 */
export function DefeatIcon3D({
  size = 72,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <defs>
        {/* Moody Rose/Crimson Gradient */}
        <linearGradient id="shield-bg" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        <linearGradient id="skull-face" x1="30" y1="28" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        <filter id="defeat-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#be123c" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#defeat-shadow)">
        {/* Soft 3D Bubble Crest/Shield */}
        <path
          d="M50 12 C72 12 84 22 84 46 C84 68 50 88 50 88 C50 88 16 68 16 46 C16 22 28 12 50 12 Z"
          fill="url(#shield-bg)"
        />

        {/* 3D Gloss reflection on shield */}
        <path
          d="M50 16 C68 16 78 24 78 44 C78 52 70 62 60 70 C70 58 72 40 60 26 C54 20 45 18 36 18 C41 16 46 16 50 16 Z"
          fill="#ffffff"
          opacity="0.3"
        />

        {/* Cute Cartoon Ghost/Skull Face */}
        <ellipse cx="50" cy="46" rx="20" ry="18" fill="url(#skull-face)" />
        <rect x="42" y="56" width="16" height="9" rx="3" fill="url(#skull-face)" />

        {/* Cartoon "X" Eyes */}
        <path d="M38 40 L44 46 M44 40 L38 46" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <path d="M56 40 L62 46 M62 40 L56 46" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

        {/* Sad Droop Mouth */}
        <path
          d="M44 56 C47 53 53 53 56 56"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Little sweat drop */}
        <path
          d="M70 32 C70 36 67 39 65 39 C63 39 62 36 65 30 C66 30 70 30 70 32 Z"
          fill="#38bdf8"
        />
      </g>
    </svg>
  );
}

/**
 * 3D / Cartoon Draw / Handshake SVG Icon
 */
export function DrawIcon3D({
  size = 72,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="draw-badge" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <filter id="draw-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#draw-shadow)">
        {/* Soft 3D Squircle */}
        <rect x="18" y="18" width="64" height="64" rx="22" fill="url(#draw-badge)" />

        {/* 3D Gloss Highlight */}
        <path
          d="M26 24 H74 C60 34 36 34 26 50 V24 Z"
          fill="#ffffff"
          opacity="0.3"
        />

        {/* Equals Sign in 3D Cartoon style */}
        <rect x="32" y="38" width="36" height="8" rx="4" fill="#ffffff" />
        <rect x="32" y="54" width="36" height="8" rx="4" fill="#ffffff" />
      </g>
    </svg>
  );
}
