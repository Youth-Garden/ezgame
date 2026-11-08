import { useState, useCallback, useRef, useEffect } from "react";
import { CaroPlayer, GameWinner, type CaroGameState } from "../types";
import { PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { checkWin, createEmptyBoard } from "../utils/check-win";
import { sounds } from "@/shared/lib/sound-effects";

interface UseCaroGameParams {
  myRole: PlayerRole;
  sendEvent: (event: RealtimeEvent) => Promise<void>;
  onShowResultDialog: (winner: GameWinner | null) => void;
  onDismissResultDialog: () => void;
}

export function useCaroGame({
  myRole,
  sendEvent,
  onShowResultDialog,
  onDismissResultDialog,
}: UseCaroGameParams) {
  const [gameState, setGameState] = useState<CaroGameState>({
    board: createEmptyBoard(),
    currentTurn: CaroPlayer.X,
    lastMove: null,
    winner: null,
    winningLine: null,
    moveCount: 0,
  });

  const stateRef = useRef({ gameState, myRole });
  stateRef.current = { gameState, myRole };

  const sendEventRef = useRef(sendEvent);
  sendEventRef.current = sendEvent;

  const resetGame = useCallback(
    (nextTurn: CaroPlayer = CaroPlayer.X) => {
      setGameState({
        board: createEmptyBoard(),
        currentTurn: nextTurn,
        lastMove: null,
        winner: null,
        winningLine: null,
        moveCount: 0,
      });
      onDismissResultDialog();
      sounds.playRematchSound();
    },
    [onDismissResultDialog]
  );

  const applyMove = useCallback(
    (row: number, col: number, player: CaroPlayer) => {
      setGameState((prev) => {
        if (prev.board[row][col] || prev.winner) return prev;

        const nextBoard = prev.board.map((rowCells, rowIndex) =>
          rowIndex === row
            ? rowCells.map((cellValue, colIndex) =>
                colIndex === col ? player : cellValue
              )
            : rowCells
        );

        const nextMoveCount = prev.moveCount + 1;
        const { winner, winningLine } = checkWin(
          nextBoard,
          row,
          col,
          player,
          nextMoveCount
        );

        sounds.playMoveSound(player as unknown as "X" | "O");

        if (winner) {
          if (
            (winner === GameWinner.X && myRole === PlayerRole.X) ||
            (winner === GameWinner.O && myRole === PlayerRole.O)
          ) {
            sounds.playWinFanfare();
          } else if (winner === GameWinner.DRAW) {
            sounds.playLoseTone();
          } else {
            sounds.playLoseTone();
          }
          onShowResultDialog(winner);
        }

        return {
          board: nextBoard,
          currentTurn: player === CaroPlayer.X ? CaroPlayer.O : CaroPlayer.X,
          lastMove: [row, col],
          winner,
          winningLine,
          moveCount: nextMoveCount,
        };
      });
    },
    [myRole, onShowResultDialog]
  );

  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      const { gameState: current, myRole: role } = stateRef.current;
      const isMyTurn =
        (current.currentTurn === CaroPlayer.X && role === PlayerRole.X) ||
        (current.currentTurn === CaroPlayer.O && role === PlayerRole.O);

      if (!isMyTurn || current.board[row][col] || current.winner) return;

      const player = role === PlayerRole.X ? CaroPlayer.X : CaroPlayer.O;
      applyMove(row, col, player);

      await sendEventRef.current({
        type: RealtimeEventType.GAME_MOVE,
        payload: {
          row,
          col,
          player: role as PlayerRole.X | PlayerRole.O,
          timestamp: Date.now(),
        },
      });
    },
    [applyMove]
  );

  return {
    gameState,
    setGameState,
    resetGame,
    applyMove,
    handleCellClick,
  };
}
