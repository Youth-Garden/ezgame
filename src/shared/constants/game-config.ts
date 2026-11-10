import { GameType } from "@/shared/types/room";

/**
 * Common configuration shared by all realtime turn-based PvP games.
 */
export interface BaseGameConfig {
  gameType: GameType;
  title: string;
  defaultRoomCode: string;
  /**
   * Turn timer countdown in seconds (0 = unlimited / no timer).
   */
  turnTimeLimitSeconds: number;
  /**
   * Warning threshold in seconds to trigger pulsing timer animation or urgent sound.
   */
  warningThresholdSeconds: number;
}
