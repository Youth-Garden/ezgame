export const DEFAULT_CHESS_CONFIG = {
  title: "Chess (Cờ Vua)",
  defaultRoomCode: "CHESS",
  turnTimeoutSeconds: 45,
  minPlayers: 2,
  maxPlayers: 2,
  boardSize: 8,
  timeOptions: [30, 45, 60, 90] as const,
} as const;
