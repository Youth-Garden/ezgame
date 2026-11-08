import { PlayerRole } from "@/shared/types/room";

export enum BidaBallType {
  CUE = "CUE", // Ball 0
  SOLIDS = "SOLIDS", // Balls 1..7 (Solid colors)
  STRIPES = "STRIPES", // Balls 9..15 (Striped colors)
  EIGHT_BALL = "EIGHT_BALL", // Ball 8 (Solid black)
}

export enum BidaTurnState {
  AIMING = "AIMING",
  ROLLING = "ROLLING",
  GAME_OVER = "GAME_OVER",
}

export interface BidaBall {
  id: number; // 0 to 15
  type: BidaBallType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation?: number; // angular rotation in radians
  radius: number;
  color: string;
  isPocketed: boolean;
}

export interface BidaGameState {
  balls: BidaBall[];
  currentTurn: PlayerRole.X | PlayerRole.O;
  turnState: BidaTurnState;
  winner: PlayerRole | null;
  assignedTypes: {
    [PlayerRole.X]: BidaBallType | null;
    [PlayerRole.O]: BidaBallType | null;
  };
  lastFoulReason: string | null;
  cueAngle: number;
  cuePower: number;
}
