export const DEFAULT_ANIMAL_CHESS_CONFIG = {
  title: "Animal Chess (Cờ Thú)",
  defaultRoomCode: "ANIMAL",
  turnTimeoutSeconds: 30,
  minPlayers: 2,
  maxPlayers: 2,
  boardRows: 9,
  boardCols: 7,
  timeOptions: [20, 30, 45, 60] as const,
} as const;
