import { GameType } from "@/shared/types/room";

export interface GameMetadata {
  id: GameType;
  title: string;
  badge: string;
  description: string;
  players: string;
  isAvailable: boolean;
  tag: string;
  iconSrc?: string;
  gradient?: string;
  playingCount?: number;
}

export interface GameRoomModalData {
  gameType: GameType;
  gameTitle: string;
}
