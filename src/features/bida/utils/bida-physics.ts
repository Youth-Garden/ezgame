import { BidaBall, BidaBallType } from "../types";

export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 420;
export const CUSHION_WIDTH = 26;
export const BALL_RADIUS = 12;
export const POCKET_RADIUS = 22;
export const FRICTION = 0.988;
export const RESTITUTION = 0.92; // bounce elasticity

export const PLAY_AREA = {
  left: CUSHION_WIDTH,
  right: TABLE_WIDTH - CUSHION_WIDTH,
  top: CUSHION_WIDTH,
  bottom: TABLE_HEIGHT - CUSHION_WIDTH,
};

// 6 standard pocket locations
export const POCKETS = [
  { x: CUSHION_WIDTH + 4, y: CUSHION_WIDTH + 4 }, // Top-Left
  { x: TABLE_WIDTH / 2, y: CUSHION_WIDTH - 2 }, // Top-Center
  { x: TABLE_WIDTH - CUSHION_WIDTH - 4, y: CUSHION_WIDTH + 4 }, // Top-Right
  { x: CUSHION_WIDTH + 4, y: TABLE_HEIGHT - CUSHION_WIDTH - 4 }, // Bottom-Left
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - CUSHION_WIDTH + 2 }, // Bottom-Center
  { x: TABLE_WIDTH - CUSHION_WIDTH - 4, y: TABLE_HEIGHT - CUSHION_WIDTH - 4 }, // Bottom-Right
];

export function createInitialRack(): BidaBall[] {
  const balls: BidaBall[] = [];

  // Cue ball (white) on left head string
  balls.push({
    id: 0,
    type: BidaBallType.CUE,
    x: TABLE_WIDTH * 0.25,
    y: TABLE_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    color: "#ffffff",
    isPocketed: false,
  });

  // Simplified 8-Ball Rack (7 balls: 3 solids, 3 stripes, 1 eight-ball) for fast-paced, responsive web duels
  // Row 1 (1 ball)
  // Row 2 (2 balls)
  // Row 3 (3 balls)
  const startX = TABLE_WIDTH * 0.7;
  const startY = TABLE_HEIGHT / 2;
  const spacing = BALL_RADIUS * 2 + 1;

  const rackConfig: Array<{ id: number; type: BidaBallType; color: string; col: number; rowOffset: number }> = [
    // Column 0
    { id: 1, type: BidaBallType.SOLIDS, color: "#eab308", col: 0, rowOffset: 0 },
    // Column 1
    { id: 2, type: BidaBallType.STRIPES, color: "#3b82f6", col: 1, rowOffset: -0.5 },
    { id: 8, type: BidaBallType.EIGHT_BALL, color: "#18181b", col: 1, rowOffset: 0.5 }, // 8-ball in center
    // Column 2
    { id: 3, type: BidaBallType.SOLIDS, color: "#ef4444", col: 2, rowOffset: -1 },
    { id: 4, type: BidaBallType.STRIPES, color: "#a855f7", col: 2, rowOffset: 0 },
    { id: 5, type: BidaBallType.SOLIDS, color: "#f97316", col: 2, rowOffset: 1 },
    // Column 3
    { id: 6, type: BidaBallType.STRIPES, color: "#10b981", col: 3, rowOffset: -0.5 },
  ];

  rackConfig.forEach((item) => {
    const colX = startX + item.col * (spacing * 0.866);
    const rowY = startY + item.rowOffset * spacing;
    balls.push({
      id: item.id,
      type: item.type,
      x: colX,
      y: rowY,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      color: item.color,
      isPocketed: false,
    });
  });

  return balls;
}
