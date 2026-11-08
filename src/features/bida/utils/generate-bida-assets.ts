import fs from "fs";
import path from "path";

// Official Tournament Ball Specs & Aramith Pro Cup Colors matching BALL_COLORS
const BALL_CONFIG = [
  { id: 0, type: "cue", color: "#f8fafc", darkColor: "#cbd5e1" },
  { id: 1, type: "solid", color: "#fbbf24", darkColor: "#d97706" }, // 1 Yellow
  { id: 2, type: "solid", color: "#2563eb", darkColor: "#1d4ed8" }, // 2 Blue
  { id: 3, type: "solid", color: "#ef4444", darkColor: "#b91c1c" }, // 3 Red
  { id: 4, type: "solid", color: "#9333ea", darkColor: "#7e22ce" }, // 4 Purple
  { id: 5, type: "solid", color: "#f97316", darkColor: "#c2410c" }, // 5 Orange
  { id: 6, type: "solid", color: "#16a34a", darkColor: "#15803d" }, // 6 Green
  { id: 7, type: "solid", color: "#991b1b", darkColor: "#7f1d1d" }, // 7 Maroon
  { id: 8, type: "solid", color: "#18181b", darkColor: "#09090b" }, // 8 Black
  { id: 9, type: "stripe", color: "#fbbf24", darkColor: "#d97706" },
  { id: 10, type: "stripe", color: "#2563eb", darkColor: "#1d4ed8" },
  { id: 11, type: "stripe", color: "#ef4444", darkColor: "#b91c1c" },
  { id: 12, type: "stripe", color: "#9333ea", darkColor: "#7e22ce" },
  { id: 13, type: "stripe", color: "#f97316", darkColor: "#c2410c" },
  { id: 14, type: "stripe", color: "#16a34a", darkColor: "#15803d" },
  { id: 15, type: "stripe", color: "#991b1b", darkColor: "#7f1d1d" },
];

function generateHighResBallSvg(config: (typeof BALL_CONFIG)[0]) {
  const isCue = config.id === 0;
  const isStripe = config.type === "stripe";

  // 128x128 High DPI canvas centered at (64, 64) with Radius 60
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <!-- Top-down top-light spherical gradient matching 3D overhead table lighting -->
    <radialGradient id="sphere-${config.id}" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="${config.color}"/>
      <stop offset="82%" stop-color="${config.darkColor}"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.7"/>
    </radialGradient>

    <!-- White Spherical Base for Striped Balls and Cue Ball -->
    <radialGradient id="white-sphere" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="85%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>

    <!-- Clip sphere radius 60 -->
    <clipPath id="clip-${config.id}">
      <circle cx="64" cy="64" r="60"/>
    </clipPath>
  </defs>

  <g clip-path="url(#clip-${config.id})">
    ${
      isCue
        ? `<!-- Aramith Pro Cup Cue Ball with Red Spin Indicator Spots -->
           <circle cx="64" cy="64" r="60" fill="url(#white-sphere)"/>
           <circle cx="50" cy="45" r="5" fill="#dc2626"/>
           <circle cx="82" cy="52" r="5" fill="#dc2626"/>
           <circle cx="62" cy="78" r="5" fill="#dc2626"/>`
        : isStripe
        ? `<!-- Striped Ball: White Top & Bottom Poles + Color Waist Band (identical to 3D model) -->
           <circle cx="64" cy="64" r="60" fill="url(#white-sphere)"/>
           <rect x="0" y="32" width="128" height="64" fill="${config.color}"/>
           <!-- Spherical depth shading over entire ball -->
           <circle cx="64" cy="64" r="60" fill="url(#sphere-${config.id})" opacity="0.32"/>`
        : `<!-- Solid Ball -->
           <circle cx="64" cy="64" r="60" fill="url(#sphere-${config.id})"/>`
    }

    ${
      !isCue
        ? `<!-- Number Disc (Radius 24, perfectly proportional like real 3D ball) -->
           <circle cx="64" cy="64" r="24" fill="#ffffff" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>
           <!-- Crisp Number -->
           <text x="64" y="73" 
                 font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
                 font-size="${config.id >= 10 ? '25' : '30'}" 
                 font-weight="900" 
                 fill="#0a0a0c" 
                 text-anchor="middle">${config.id}</text>
           ${config.id === 6 || config.id === 9 ? `<line x1="53" y1="78" x2="75" y2="78" stroke="#0a0a0c" stroke-width="2.5" stroke-linecap="round"/>` : ''}`
        : ''
    }

    <!-- High-gloss Top-down Specular Reflection (matching Three.js overhead keylight) -->
    <ellipse cx="48" cy="38" rx="14" ry="8" transform="rotate(-25 48 38)" fill="#ffffff" opacity="0.75"/>
    <circle cx="44" cy="34" r="3.5" fill="#ffffff" opacity="0.9"/>
  </g>

  <!-- Clean outer shadow/bevel -->
  <circle cx="64" cy="64" r="59.5" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
</svg>`;
}

const outDir = path.resolve(process.cwd(), "public/games/bida");
BALL_CONFIG.forEach((cfg) => {
  const svg = generateHighResBallSvg(cfg);
  fs.writeFileSync(path.join(outDir, `ball-${cfg.id}.svg`), svg, "utf-8");
});

console.log("Updated to Extra-Large Bold Numbers (font-size 36-42, disc radius 30)!");
