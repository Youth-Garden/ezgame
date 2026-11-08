import { BidaBall, BidaBallType } from "../types";

export const TABLE_WIDTH = 840;
export const TABLE_HEIGHT = 440;
export const CUSHION_WIDTH = 42;
export const BALL_RADIUS = 13.5;
export const POCKET_RADIUS = 28;

export const PLAY_AREA = {
  left: CUSHION_WIDTH,
  right: TABLE_WIDTH - CUSHION_WIDTH,
  top: CUSHION_WIDTH,
  bottom: TABLE_HEIGHT - CUSHION_WIDTH,
};

// 6 Tournament Pocket Positions with realistic inset into table pockets
export const POCKETS = [
  { id: "TL", x: 42, y: 42, radius: 28 }, // Top-Left Corner
  { id: "TC", x: 420, y: 30, radius: 26 }, // Top-Center Side Pocket
  { id: "TR", x: 798, y: 42, radius: 28 }, // Top-Right Corner
  { id: "BL", x: 42, y: 398, radius: 28 }, // Bottom-Left Corner
  { id: "BC", x: 420, y: 410, radius: 26 }, // Bottom-Center Side Pocket
  { id: "BR", x: 798, y: 398, radius: 28 }, // Bottom-Right Corner
];

// Color definitions matching official billiard ball specs
export const BALL_COLORS: Record<number, string> = {
  0: "#ffffff", // Cue Ball
  1: "#fbbf24", // Yellow (Solid)
  2: "#2563eb", // Blue (Solid)
  3: "#ef4444", // Red (Solid)
  4: "#9333ea", // Purple (Solid)
  5: "#f97316", // Orange (Solid)
  6: "#16a34a", // Green (Solid)
  7: "#991b1b", // Maroon / Dark Red (Solid)
  8: "#09090b", // Eight Ball (Black)
  9: "#fbbf24", // Yellow (Stripe)
  10: "#2563eb", // Blue (Stripe)
  11: "#ef4444", // Red (Stripe)
  12: "#9333ea", // Purple (Stripe)
  13: "#f97316", // Orange (Stripe)
  14: "#16a34a", // Green (Stripe)
  15: "#991b1b", // Maroon (Stripe)
};

/**
 * Creates the full 16-ball rack:
 * 1 Cue Ball + 15 Target Balls arranged in the standard 8-ball pyramid rack
 * Row 1 (Apex): 1 ball (e.g. 1)
 * Row 2: 2 balls (e.g. 2, 9)
 * Row 3: 3 balls with 8-ball strictly in the middle
 * Row 4: 4 balls
 * Row 5: 5 balls with solid & stripe on opposing bottom corners
 */
export function createInitialRack(): BidaBall[] {
  const balls: BidaBall[] = [];

  // 1. Cue Ball placed at head string line
  balls.push({
    id: 0,
    type: BidaBallType.CUE,
    x: TABLE_WIDTH * 0.25,
    y: TABLE_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    color: BALL_COLORS[0],
    isPocketed: false,
  });

  // Standard official 8-ball rack configuration (apex at row 0)
  // Ensures 8-ball is in the center, and corners have 1 solid and 1 stripe
  const pyramidLayout: Array<{ row: number; colIndex: number; id: number }> = [
    // Row 0 (Apex - 1 ball)
    { row: 0, colIndex: 0, id: 1 },

    // Row 1 (2 balls)
    { row: 1, colIndex: 0, id: 9 },
    { row: 1, colIndex: 1, id: 2 },

    // Row 2 (3 balls - 8-ball in center)
    { row: 2, colIndex: 0, id: 3 },
    { row: 2, colIndex: 1, id: 8 }, // 8-Ball Center
    { row: 2, colIndex: 2, id: 10 },

    // Row 3 (4 balls)
    { row: 3, colIndex: 0, id: 11 },
    { row: 3, colIndex: 1, id: 4 },
    { row: 3, colIndex: 2, id: 12 },
    { row: 3, colIndex: 3, id: 5 },

    // Row 4 (Base - 5 balls)
    { row: 4, colIndex: 0, id: 7 }, // Solid corner
    { row: 4, colIndex: 1, id: 13 },
    { row: 4, colIndex: 2, id: 6 },
    { row: 4, colIndex: 3, id: 14 },
    { row: 4, colIndex: 4, id: 15 }, // Stripe corner
  ];

  const footSpotX = TABLE_WIDTH * 0.68;
  const footSpotY = TABLE_HEIGHT / 2;
  const ballDiameter = BALL_RADIUS * 2;
  const colSpacing = (ballDiameter + 0.8) * Math.cos(Math.PI / 6); // close-packed triangular lattice
  const rowSpacing = ballDiameter + 0.8;

  pyramidLayout.forEach((item) => {
    const x = footSpotX + item.row * colSpacing;
    const yOffset = (item.colIndex - item.row * 0.5) * rowSpacing;
    const y = footSpotY + yOffset;

    let ballType = BidaBallType.SOLIDS;
    if (item.id === 8) {
      ballType = BidaBallType.EIGHT_BALL;
    } else if (item.id >= 9) {
      ballType = BidaBallType.STRIPES;
    }

    balls.push({
      id: item.id,
      type: ballType,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      color: BALL_COLORS[item.id] || "#ffffff",
      isPocketed: false,
    });
  });

  return balls;
}
