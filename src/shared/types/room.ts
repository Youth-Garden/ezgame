export enum PlayerRole {
  X = "X",
  O = "O",
  SPECTATOR = "SPECTATOR",
}

export enum RoomStatus {
  WAITING = "WAITING",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export enum GameType {
  CARO = "caro",
  TICTACTOE = "tictactoe",
}

export interface RoomData {
  id: string;
  code: string;
  gameType: GameType;
  status: RoomStatus;
  createdAt: string;
}

export interface PlayerPresence {
  id: string;
  role: PlayerRole;
  joinedAt: number;
  name?: string;
}

export enum RealtimeEventType {
  GAME_MOVE = "GAME_MOVE",
  GAME_RESET = "GAME_RESET",
  REMATCH_REQUEST = "REMATCH_REQUEST",
  REMATCH_ACCEPT = "REMATCH_ACCEPT",
  PLAYER_SURRENDER = "PLAYER_SURRENDER",
}

export type RealtimeEvent =
  | {
      type: RealtimeEventType.GAME_MOVE;
      payload: {
        row: number;
        col: number;
        player: PlayerRole.X | PlayerRole.O;
        timestamp: number;
      };
    }
  | {
      type: RealtimeEventType.GAME_RESET;
      payload: {
        startingPlayer: PlayerRole.X | PlayerRole.O;
      };
    }
  | {
      type: RealtimeEventType.REMATCH_REQUEST;
      payload: {
        from: PlayerRole;
      };
    }
  | {
      type: RealtimeEventType.REMATCH_ACCEPT;
      payload: {
        acceptedBy: PlayerRole;
      };
    }
  | {
      type: RealtimeEventType.PLAYER_SURRENDER;
      payload: {
        player: PlayerRole;
      };
    };
