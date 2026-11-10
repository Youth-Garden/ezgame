import { BaseGameConfig } from "@/shared/constants/game-config";
import { GameType } from "@/shared/types/room";

/**
 * 8-Ball Pocket Billiards configuration inheriting from BaseGameConfig.
 */
export interface BidaGameConfig extends BaseGameConfig {
  tableWidth: number;
  tableHeight: number;
  cushionWidth: number;
  ballRadius: number;
  pocketRadius: number;
  solidsBallCount: number;
  stripesBallCount: number;
}

export const DEFAULT_BIDA_CONFIG: BidaGameConfig = {
  gameType: GameType.BIDA,
  title: "Pocket Billiards (8-Ball)",
  defaultRoomCode: "BD-DEMO",
  turnTimeLimitSeconds: 45, // 45s to aim and shoot
  warningThresholdSeconds: 15,
  tableWidth: 840,
  tableHeight: 440,
  cushionWidth: 42,
  ballRadius: 13.5,
  pocketRadius: 28,
  solidsBallCount: 7,
  stripesBallCount: 7,
};
