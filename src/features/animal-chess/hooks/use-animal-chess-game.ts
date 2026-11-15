"use client";

import { useState, useCallback } from "react";
import { sounds } from "@/shared/lib/sound-effects";
import { GameWinner, PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { AnimalBoardState, AnimalColor, AnimalType, type Position } from "../types";
import { createInitialAnimalBoard, getValidMoves, isDen } from "../utils/animal-chess-rules";

interface UseAnimalChessGameProps {
  myRole: PlayerRole;
  sendEvent: (event: RealtimeEvent) => Promise<void>;
  onShowResultDialog: (winner: GameWinner) => void;
  onDismissResultDialog?: () => void;
}

export function useAnimalChessGame({
  myRole,
  sendEvent,
  onShowResultDialog,
  onDismissResultDialog,
}: UseAnimalChessGameProps) {
  const [board, setBoard] = useState<AnimalBoardState>(() => createInitialAnimalBoard());
  const [currentTurn, setCurrentTurn] = useState<PlayerRole.X | PlayerRole.O>(PlayerRole.X);
  const [winner, setWinner] = useState<GameWinner | null>(null);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [capturedByBlue, setCapturedByBlue] = useState<AnimalType[]>([]);
  const [capturedByRed, setCapturedByRed] = useState<AnimalType[]>([]);

  // Player X is Blue (Top), Player O is Red (Bottom)
  const myColor = myRole === PlayerRole.X ? AnimalColor.BLUE : AnimalColor.RED;
  const isMyTurn = currentTurn === myRole && !winner;

  const validMoves = selectedPos ? getValidMoves(board, selectedPos.row, selectedPos.col) : [];

  // Check victory condition
  const checkGameOver = useCallback(
    (nextBoard: AnimalBoardState, toRow: number, toCol: number, movedColor: AnimalColor) => {
      // 1. Captured opponent Den!
      const denInfo = isDen(toRow, toCol);
      if (denInfo.isDen && denInfo.owner !== movedColor) {
        const winningRole = movedColor === AnimalColor.BLUE ? GameWinner.X : GameWinner.O;
        setWinner(winningRole);
        onShowResultDialog(winningRole);
        sounds.playWinFanfare();
        return true;
      }

      // 2. Extinct all opponent animals
      const opponentColor = movedColor === AnimalColor.BLUE ? AnimalColor.RED : AnimalColor.BLUE;
      let hasOpponentPiece = false;

      for (const row of nextBoard) {
        for (const cell of row) {
          if (cell && cell.color === opponentColor) {
            hasOpponentPiece = true;
            break;
          }
        }
        if (hasOpponentPiece) break;
      }

      if (!hasOpponentPiece) {
        const winningRole = movedColor === AnimalColor.BLUE ? GameWinner.X : GameWinner.O;
        setWinner(winningRole);
        onShowResultDialog(winningRole);
        sounds.playWinFanfare();
        return true;
      }

      return false;
    },
    [onShowResultDialog]
  );

  // Apply move logic
  const executeMove = useCallback(
    async (from: Position, to: Position, isLocal: boolean) => {
      const movingPiece = board[from.row][from.col];
      if (!movingPiece) return false;

      const targetPiece = board[to.row][to.col];

      // Clone board
      const nextBoard = board.map((r) => [...r]);
      nextBoard[to.row][to.col] = movingPiece;
      nextBoard[from.row][from.col] = null;

      setBoard(nextBoard);
      setLastMove({ from, to });
      setSelectedPos(null);

      // Captured piece handling & sounds
      if (targetPiece) {
        if (movingPiece.color === AnimalColor.BLUE) {
          setCapturedByBlue((prev) => [...prev, targetPiece.type]);
        } else {
          setCapturedByRed((prev) => [...prev, targetPiece.type]);
        }
        sounds.playPieceCaptureSound();
      } else {
        sounds.playPieceDropSound();
      }

      const nextTurn = currentTurn === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
      setCurrentTurn(nextTurn);

      // Check win
      const isOver = checkGameOver(nextBoard, to.row, to.col, movingPiece.color);

      // Send realtime event
      if (isLocal) {
        await sendEvent({
          type: RealtimeEventType.ANIMAL_CHESS_MOVE,
          payload: {
            fromRow: from.row,
            fromCol: from.col,
            toRow: to.row,
            toCol: to.col,
            player: myRole as PlayerRole.X | PlayerRole.O,
            timestamp: Date.now(),
          },
        });
      }

      return true;
    },
    [board, checkGameOver, currentTurn, myRole, sendEvent]
  );

  // Cell click interaction
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!isMyTurn || winner) return;

      const piece = board[row][col];

      // Already selected a piece
      if (selectedPos) {
        // Click same cell to deselect
        if (selectedPos.row === row && selectedPos.col === col) {
          setSelectedPos(null);
          return;
        }

        // Click another of own pieces: reselect
        if (piece && piece.color === myColor) {
          setSelectedPos({ row, col });
          sounds.playClick();
          return;
        }

        // Move to valid destination
        const isValid = validMoves.some((m) => m.row === row && m.col === col);
        if (isValid) {
          executeMove(selectedPos, { row, col }, true);
          return;
        }

        setSelectedPos(null);
        return;
      }

      // No piece selected yet: only select own color
      if (piece && piece.color === myColor) {
        setSelectedPos({ row, col });
        sounds.playClick();
      }
    },
    [isMyTurn, winner, board, selectedPos, myColor, validMoves, executeMove]
  );

  // Pass turn timeout
  const passTurnTimeout = useCallback(
    async (timedOutPlayer: PlayerRole) => {
      if (winner) return;
      const nextTurn = timedOutPlayer === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
      setCurrentTurn(nextTurn);
      sounds.playTimerWarning();

      if (timedOutPlayer === myRole) {
        await sendEvent({
          type: RealtimeEventType.GAME_TIMEOUT_PASS_TURN,
          payload: {
            player: timedOutPlayer,
            nextTurn,
            timestamp: Date.now(),
          },
        });
      }
    },
    [winner, myRole, sendEvent]
  );

  // Reset game for rematch
  const resetGame = useCallback(
    (startingPlayer: PlayerRole.X | PlayerRole.O = PlayerRole.X) => {
      setBoard(createInitialAnimalBoard());
      setWinner(null);
      setCurrentTurn(startingPlayer);
      setSelectedPos(null);
      setLastMove(null);
      setCapturedByBlue([]);
      setCapturedByRed([]);
      onDismissResultDialog?.();
      sounds.playRematchSound();
    },
    [onDismissResultDialog]
  );

  return {
    board,
    setBoard,
    currentTurn,
    winner,
    setGameWinner: setWinner,
    myColor,
    isMyTurn,
    selectedPos,
    validMoves,
    lastMove,
    capturedByBlue,
    capturedByRed,
    handleCellClick,
    executeMove,
    resetGame,
    passTurnTimeout,
  };
}
