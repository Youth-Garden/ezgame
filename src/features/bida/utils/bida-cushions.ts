import Matter from "matter-js";
import { CUSHION_WIDTH, TABLE_HEIGHT, TABLE_WIDTH } from "./bida-physics";

/**
 * Helper to build a chamfered polygon cushion body with Matter.js
 * and align its bounding box exactly with the input polygon vertices.
 */
function createChamferedCushion(
  verts: Array<{ x: number; y: number }>,
  label: string = "cushion"
): Matter.Body {
  const { Bodies, Body } = Matter;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < verts.length; i++) {
    const p = verts[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const body = Bodies.fromVertices(cx, cy, [verts], {
    isStatic: true,
    restitution: 0.94,
    friction: 0.04,
    label,
  });

  // Re-align body position after Matter.js computes center of mass offset
  const shiftX = minX - body.bounds.min.x;
  const shiftY = minY - body.bounds.min.y;
  Body.setPosition(body, {
    x: body.position.x + shiftX,
    y: body.position.y + shiftY,
  });

  return body;
}

export function createTableCushions(): Matter.Body[] {
  // Chamfered / trapezoidal tournament cushions matching the 3D model:
  // Play felt inner edge is strictly at CUSHION_WIDTH (42px).
  // 1. Top-Left Rail: from corner pocket TL to center pocket TC
  const topRailLeft = createChamferedCushion([
    { x: 48, y: 0 },
    { x: 408, y: 0 },
    { x: 394, y: CUSHION_WIDTH },
    { x: 74, y: CUSHION_WIDTH },
  ]);

  // 2. Top-Right Rail: from center pocket TC to corner pocket TR
  const topRailRight = createChamferedCushion([
    { x: 432, y: 0 },
    { x: 792, y: 0 },
    { x: 766, y: CUSHION_WIDTH },
    { x: 446, y: CUSHION_WIDTH },
  ]);

  // 3. Bottom-Left Rail: from corner pocket BL to center pocket BC
  const botRailLeft = createChamferedCushion([
    { x: 74, y: TABLE_HEIGHT - CUSHION_WIDTH },
    { x: 394, y: TABLE_HEIGHT - CUSHION_WIDTH },
    { x: 408, y: TABLE_HEIGHT },
    { x: 48, y: TABLE_HEIGHT },
  ]);

  // 4. Bottom-Right Rail: from center pocket BC to corner pocket BR
  const botRailRight = createChamferedCushion([
    { x: 446, y: TABLE_HEIGHT - CUSHION_WIDTH },
    { x: 766, y: TABLE_HEIGHT - CUSHION_WIDTH },
    { x: 792, y: TABLE_HEIGHT },
    { x: 432, y: TABLE_HEIGHT },
  ]);

  // 5. Left Rail: from corner pocket TL to corner pocket BL
  const leftRail = createChamferedCushion([
    { x: 0, y: 48 },
    { x: CUSHION_WIDTH, y: 74 },
    { x: CUSHION_WIDTH, y: TABLE_HEIGHT - 74 },
    { x: 0, y: TABLE_HEIGHT - 48 },
  ]);

  // 6. Right Rail: from corner pocket TR to corner pocket BR
  const rightRail = createChamferedCushion([
    { x: TABLE_WIDTH - CUSHION_WIDTH, y: 74 },
    { x: TABLE_WIDTH, y: 48 },
    { x: TABLE_WIDTH, y: TABLE_HEIGHT - 48 },
    { x: TABLE_WIDTH - CUSHION_WIDTH, y: TABLE_HEIGHT - 74 },
  ]);

  return [topRailLeft, topRailRight, botRailLeft, botRailRight, leftRail, rightRail];
}
