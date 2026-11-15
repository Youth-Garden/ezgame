import { useCallback, useState } from "react";
import {
  XiangqiBoardState,
  XiangqiColor,
  XiangqiMove,
  XiangqiPiece,
  XiangqiPosition,
} from "../types";
import {
  applyMoveToBoard,
  createInitialXiangqiBoard,
  getLegalMovesForPosition,
  hasAnyLegalMoves,
  isGeneralInCheck,
} from "../utils/xiangqi-rules";
import { GameWinner, PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { sounds } from "@/shared/lib/sound-effects";

interface UseXiangqiGameProps {
  myRole: PlayerRole;
  sendEvent: (event: RealtimeEvent) => Promise<unknown>;
  onShowResultDialog: (winner: GameWinner) => void;
  onDismissResultDialog: () => void;
}

export function useXiangqiGame({
  myRole,
  sendEvent,
  onShowResultDialog,
  onDismissResultDialog,
}: UseXiangqiGameProps) {
  const [board, setBoard] = useState<XiangqiBoardState>(createInitialXiangqiBoard);
  const [currentTurn, setCurrentTurn] = useState<XiangqiColor>(XiangqiColor.RED);
  const [selectedPos, setSelectedPos] = useState<XiangqiPosition | null>(null);
  const [validMoves, setValidMoves] = useState<XiangqiPosition[]>([]);
  const [lastMove, setLastMove] = useState<XiangqiMove | null>(null);
  const [capturedByRed, setCapturedByRed] = useState<XiangqiPiece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<XiangqiPiece[]>([]);
  const [winner, setWinner] = useState<GameWinner | null>(null);

  const setGameWinner = useCallback((win: GameWinner | null) => {
    setWinner(win);
  }, []);

  // Red is PlayerRole.X, Black is PlayerRole.O
  const myColor: XiangqiColor | null =
    myRole === PlayerRole.X
      ? XiangqiColor.RED
      : myRole === PlayerRole.O
      ? XiangqiColor.BLACK
      : null;

  const isInCheckColor = isGeneralInCheck(board, XiangqiColor.RED)
    ? XiangqiColor.RED
    : isGeneralInCheck(board, XiangqiColor.BLACK)
    ? XiangqiColor.BLACK
    : null;

  const resetGame = useCallback(() => {
    setBoard(createInitialXiangqiBoard());
    setCurrentTurn(XiangqiColor.RED);
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setCapturedByRed([]);
    setCapturedByBlack([]);
    setWinner(null);
    onDismissResultDialog();
    sounds.playRematchSound();
  }, [onDismissResultDialog]);

  // Execute an authenticated move on board
  const executeMove = useCallback(
    (move: XiangqiMove) => {
      const newBoard = applyMoveToBoard(board, move);
      setBoard(newBoard);
      setLastMove(move);
      setSelectedPos(null);
      setValidMoves([]);

      if (move.captured) {
        sounds.playPieceCaptureSound();
        if (move.piece.color === XiangqiColor.RED) {
          setCapturedByRed((prev) => [...prev, move.captured!]);
        } else {
          setCapturedByBlack((prev) => [...prev, move.captured!]);
        }
      } else {
        sounds.playPieceDropSound();
      }

      const nextTurn =
        move.piece.color === XiangqiColor.RED ? XiangqiColor.BLACK : XiangqiColor.RED;
      setCurrentTurn(nextTurn);

      // Check win condition (Checkmate / Stalemate: opponent has no legal moves)
      const hasMovesLeft = hasAnyLegalMoves(newBoard, nextTurn);
      if (!hasMovesLeft) {
        const gameWinner =
          nextTurn === XiangqiColor.RED ? GameWinner.O : GameWinner.X;
        setWinner(gameWinner);
        const isMeWinner =
          (gameWinner === GameWinner.X && myRole === PlayerRole.X) ||
          (gameWinner === GameWinner.O && myRole === PlayerRole.O);
        if (isMeWinner) {
          sounds.playWinFanfare();
        } else {
          sounds.playLoseTone();
        }
        onShowResultDialog(gameWinner);
      } else {
        // If next player's general is in check, play check alert sound
        if (isGeneralInCheck(newBoard, nextTurn)) {
          sounds.playCheckAlertSound();
        }
      }
    },
    [board, myRole, onShowResultDialog]
  );

  // Handle cell selection by user
  const handleSelectPosition = useCallback(
    (pos: XiangqiPosition) => {
      if (winner || !myColor || currentTurn !== myColor) return;

      const piece = board[pos.row][pos.col];

      // If already selected a piece, check if target position is a legal move
      if (selectedPos) {
        const isLegal = validMoves.some((m) => m.row === pos.row && m.col === pos.col);
        if (isLegal) {
          const selectedPiece = board[selectedPos.row][selectedPos.col]!;
          const move: XiangqiMove = {
            from: selectedPos,
            to: pos,
            piece: selectedPiece,
            captured: piece,
          };

          executeMove(move);

          // Broadcast move to opponent
          const movePlayer = myRole === PlayerRole.O ? PlayerRole.O : PlayerRole.X;
          sendEvent({
            type: RealtimeEventType.GAME_MOVE,
            payload: {
              row: pos.row,
              col: pos.col,
              fromRow: selectedPos.row,
              fromCol: selectedPos.col,
              player: movePlayer,
              timestamp: Date.now(),
            },
          });
          return;
        }
      }

      // Select piece of own color
      if (piece && piece.color === myColor) {
        setSelectedPos(pos);
        const moves = getLegalMovesForPosition(board, pos);
        setValidMoves(moves);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    },
    [board, currentTurn, executeMove, myColor, selectedPos, sendEvent, validMoves, winner]
  );

  // Pass turn on timeout
  const passTurnTimeout = useCallback(() => {
    setCurrentTurn((prev) => (prev === XiangqiColor.RED ? XiangqiColor.BLACK : XiangqiColor.RED));
    setSelectedPos(null);
    setValidMoves([]);
  }, []);

  return {
    board,
    currentTurn,
    selectedPos,
    validMoves,
    lastMove,
    capturedByRed,
    capturedByBlack,
    winner,
    setGameWinner,
    myColor,
    isInCheckColor,
    handleSelectPosition,
    executeMove,
    resetGame,
    passTurnTimeout,
  };
}
