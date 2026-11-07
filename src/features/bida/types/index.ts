import { PlayerRole } from "@/shared/types/room";

export enum BidaBallType {
  CUE = "CUE",
  SOLIDS = "SOLIDS", // Player X typically (balls 1..7)
  STRIPES = "STRIPES", // Player O typically (balls 9..15)
  EIGHT_BALL = "EIGHT_BALL", // Ball 8
}

export enum BidaTurnState {
  AIMING = "AIMING",
  BALLS_MOVING = "BALLS_MOVING",
  TURN_SWITCHING = "TURN_SWITCHING",
  GAME_OVER = "GAME_OVER",
}

export interface BidaBall {
  id: number;
  type: BidaBallType;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
  cueAngle: number; // in radians
  cuePower: number; // 0 to 100
}
