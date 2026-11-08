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
  BIDA = "bida",
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
  avatarSeed?: string;
  avatarStyle?: string;
}

export enum RealtimeEventType {
  GAME_MOVE = "GAME_MOVE",
  GAME_RESET = "GAME_RESET",
  REMATCH_REQUEST = "REMATCH_REQUEST",
  REMATCH_ACCEPT = "REMATCH_ACCEPT",
  PLAYER_SURRENDER = "PLAYER_SURRENDER",
  BIDA_SHOT = "BIDA_SHOT",
  BIDA_STATE_SYNC = "BIDA_STATE_SYNC",
  REQUEST_ROOM_SYNC = "REQUEST_ROOM_SYNC",
  RESPONSE_CARO_SYNC = "RESPONSE_CARO_SYNC",
  RESPONSE_BIDA_SYNC = "RESPONSE_BIDA_SYNC",
}

export type RealtimeEvent =
  | {
      type: RealtimeEventType.REQUEST_ROOM_SYNC;
      payload: {
        from: PlayerRole;
        clientId: string;
      };
    }
  | {
      type: RealtimeEventType.RESPONSE_CARO_SYNC;
      payload: {
        board: (string | null)[][];
        currentTurn: string;
        lastMove: [number, number] | null;
        winner: string | null;
        winningLine: [number, number][] | null;
        moveCount: number;
        timestamp: number;
      };
    }
  | {
      type: RealtimeEventType.RESPONSE_BIDA_SYNC;
      payload: {
        balls: Array<{
          id: number;
          x: number;
          y: number;
          isPocketed: boolean;
        }>;
        currentTurn: PlayerRole.X | PlayerRole.O;
        assignedGroups?: {
          [PlayerRole.X]: string | null;
          [PlayerRole.O]: string | null;
        };
        winner?: PlayerRole | null;
        foulMessage?: string | null;
        timestamp: number;
      };
    }
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
    }
  | {
      type: RealtimeEventType.BIDA_SHOT;
      payload: {
        player: PlayerRole.X | PlayerRole.O;
        cueAngle: number;
        power: number;
        cueBallX: number;
        cueBallY: number;
        englishX?: number;
        englishY?: number;
        timestamp: number;
      };
    }
  | {
      type: RealtimeEventType.BIDA_STATE_SYNC;
      payload: {
        balls: Array<{
          id: number;
          x: number;
          y: number;
          isPocketed: boolean;
        }>;
        currentTurn: PlayerRole.X | PlayerRole.O;
        assignedGroups?: {
          [PlayerRole.X]: string | null;
          [PlayerRole.O]: string | null;
        };
        winner?: PlayerRole | null;
        foulMessage?: string | null;
        timestamp: number;
      };
    };
