import * as THREE from "three";
import { BALL_COLORS } from "./bida-physics";

/**
 * Generates an optimized equirectangular (2:1 ratio) UV canvas texture for a pool ball.
 * 512x256 resolution is pristine for 13.5px sphere radius while cutting GPU memory by 75%
 * ensuring smooth 60fps on mobile devices and integrated GPUs.
 */
export function createPoolBallTexture(id: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const isCue = id === 0;
  const isStripe = id >= 9 && id <= 15;
  const color = BALL_COLORS[id] || "#ffffff";

  if (isCue) {
    // Pure White Cue Ball with Aramith Pro Cup 6-Red-Dot layout
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#dc2626";
    // Authentic red dots for spin visualization
    const drawDot = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
    };

    drawDot(128, 128);
    drawDot(384, 128);
    drawDot(256, 64);
    drawDot(256, 192);
    drawDot(0, 128);
    drawDot(512, 128);
  } else if (isStripe) {
    // Striped Ball: Ivory white caps top & bottom, thick vibrant color waist belt in middle
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    // Central waist stripe
    ctx.fillRect(0, 48, canvas.width, 160);

    const drawBadge = (cx: number) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, 128, 41, 0, Math.PI * 2);
      ctx.fill();

      // Thin inner outline
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#0a0a0c";
      ctx.font = "900 35px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(id), cx, 128);

      // Underline for 9 to prevent confusion with 6
      if (id === 9) {
        ctx.strokeStyle = "#0a0a0c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 15, 149);
        ctx.lineTo(cx + 15, 149);
        ctx.stroke();
      }
    };

    drawBadge(128);
    drawBadge(384);
  } else {
    // Solid Ball (1-8): Pure rich body color + two opposite white number discs
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawBadge = (cx: number) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, 128, 43, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#0a0a0c";
      ctx.font = "900 37px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(id), cx, 128);

      // Underline for 6
      if (id === 6) {
        ctx.strokeStyle = "#0a0a0c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 15, 149);
        ctx.lineTo(cx + 15, 149);
        ctx.stroke();
      }
    };

    drawBadge(128);
    drawBadge(384);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export function createPoolBallMaterial(id: number): THREE.MeshStandardMaterial {
  const texture = createPoolBallTexture(id);
  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.08, // High-gloss Aramith resin polish
    metalness: 0.04,
  });
}

/**
 * Creates a canvas texture containing a clean prohibited / ban icon (circle with diagonal slash)
 * for rendering over illegal target balls.
 */
export function createBanIconTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 64;
  const cy = 64;
  const r = 44;
  const lw = 12;

  ctx.clearRect(0, 0, 128, 128);

  // Outer red circle
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Diagonal slash from top-left to bottom-right
  ctx.beginPath();
  const angle = Math.PI / 4;
  const offset = r - lw / 2;
  ctx.moveTo(cx - offset * Math.cos(angle), cy - offset * Math.sin(angle));
  ctx.lineTo(cx + offset * Math.cos(angle), cy + offset * Math.sin(angle));
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
