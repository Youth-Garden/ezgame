import { BaseGameConfig } from "@/shared/constants/game-config";
import { GameType } from "@/shared/types/room";

/**
 * Caro (Gomoku) game configuration inheriting from BaseGameConfig.
 */
export interface CaroGameConfig extends BaseGameConfig {
  boardSize: number;
  winConsecutiveCount: number;
}

export const DEFAULT_CARO_CONFIG: CaroGameConfig = {
  gameType: GameType.CARO,
  title: "Caro 15x15",
  defaultRoomCode: "CR-DEMO",
  turnTimeLimitSeconds: 30, // 30s per move
  warningThresholdSeconds: 10,
  boardSize: 15,
  winConsecutiveCount: 5,
};
