"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Chess, type Square } from "chess.js";
import { sounds } from "@/shared/lib/sound-effects";
import { GameWinner, PlayerRole, RealtimeEventType, type RealtimeEvent } from "@/shared/types/room";
import { usePortal } from "@/shared/components/portal";
import { ChessPieceColor, ChessPieceType, type ChessMovePayload } from "../types";
import { PawnPromotionDialog, type PawnPromotionDialogData } from "../components/pawn-promotion-dialog";

interface UseChessGameProps {
  myRole: PlayerRole;
  sendEvent: (event: RealtimeEvent) => Promise<void>;
  onShowResultDialog: (winner: GameWinner) => void;
  onDismissResultDialog?: () => void;
}

export function useChessGame({
  myRole,
  sendEvent,
  onShowResultDialog,
  onDismissResultDialog,
}: UseChessGameProps) {
  const [chess] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const [currentTurn, setCurrentTurn] = useState<PlayerRole.X | PlayerRole.O>(PlayerRole.X);
  const [winner, setWinner] = useState<GameWinner | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedWhite, setCapturedWhite] = useState<ChessPieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<ChessPieceType[]>([]);

  const [presentPromotionDialog] = usePortal<PawnPromotionDialogData>(PawnPromotionDialog);

  // My chess color: X is White (first to move), O is Black
  const myColor = myRole === PlayerRole.X ? ChessPieceColor.WHITE : ChessPieceColor.BLACK;
  const isMyTurn = currentTurn === myRole && !winner;

  // Board representation from chess.js
  const board = chess.board();

  // Valid moves for currently selected square
  const validMoves = selectedSquare
    ? chess.moves({ square: selectedSquare, verbose: true })
    : [];
  const validTargetSquares = validMoves.map((m) => m.to as Square);

  // Check state
  const isInCheck = chess.inCheck();
  const isInCheckColor = isInCheck
    ? chess.turn() === "w"
      ? ChessPieceColor.WHITE
      : ChessPieceColor.BLACK
    : null;

  // Find king position if in check for visual red highlight
  const isCheckSquare: Square | null = (() => {
    if (!isInCheck) return null;
    const turnColor = chess.turn();
    for (const row of board) {
      for (const piece of row) {
        if (piece && piece.type === "k" && piece.color === turnColor) {
          return piece.square;
        }
      }
    }
    return null;
  })();

  // Calculate captured pieces by counting pieces missing from initial set
  const updateCapturedPieces = useCallback(() => {
    const initialCounts: Record<ChessPieceColor, Record<ChessPieceType, number>> = {
      [ChessPieceColor.WHITE]: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      [ChessPieceColor.BLACK]: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    for (const row of chess.board()) {
      for (const piece of row) {
        if (piece) {
          initialCounts[piece.color as ChessPieceColor][piece.type as ChessPieceType]--;
        }
      }
    }

    const whiteCap: ChessPieceType[] = [];
    const blackCap: ChessPieceType[] = [];

    (Object.keys(initialCounts[ChessPieceColor.WHITE]) as ChessPieceType[]).forEach((type) => {
      const missing = initialCounts[ChessPieceColor.WHITE][type];
      for (let i = 0; i < missing; i++) whiteCap.push(type);
    });

    (Object.keys(initialCounts[ChessPieceColor.BLACK]) as ChessPieceType[]).forEach((type) => {
      const missing = initialCounts[ChessPieceColor.BLACK][type];
      for (let i = 0; i < missing; i++) blackCap.push(type);
    });

    setCapturedWhite(whiteCap);
    setCapturedBlack(blackCap);
  }, [chess]);

  // Check game over condition
  const checkGameOver = useCallback(() => {
    if (chess.isCheckmate()) {
      // The side whose turn it is has been checkmated
      const losingRole = chess.turn() === "w" ? PlayerRole.X : PlayerRole.O;
      const winningRole = losingRole === PlayerRole.X ? GameWinner.O : GameWinner.X;
      setWinner(winningRole);
      onShowResultDialog(winningRole);
      sounds.playWinFanfare();
      return true;
    }

    if (chess.isDraw()) {
      setWinner(GameWinner.DRAW);
      onShowResultDialog(GameWinner.DRAW);
      sounds.playClick();
      return true;
    }

    return false;
  }, [chess, onShowResultDialog]);

  // Execute a verified move
  const executeMove = useCallback(
    async (movePayload: ChessMovePayload, isLocal: boolean) => {
      try {
        const moveResult = chess.move({
          from: movePayload.from,
          to: movePayload.to,
          promotion: movePayload.promotion || "q",
        });

        if (!moveResult) return false;

        setLastMove({
          from: movePayload.from as Square,
          to: movePayload.to as Square,
        });
        setSelectedSquare(null);
        updateCapturedPieces();

        // Sound effect
        if (moveResult.captured) {
          sounds.playBidaPocket();
        } else {
          sounds.playMove();
        }

        const nextTurn = chess.turn() === "w" ? PlayerRole.X : PlayerRole.O;
        setCurrentTurn(nextTurn);
        rerender();

        // Broadcast if local move
        if (isLocal) {
          await sendEvent({
            type: RealtimeEventType.CHESS_MOVE,
            payload: {
              from: movePayload.from,
              to: movePayload.to,
              promotion: movePayload.promotion,
              fen: chess.fen(),
              player: myRole as PlayerRole.X | PlayerRole.O,
              timestamp: Date.now(),
            },
          });
        }

        checkGameOver();
        return true;
      } catch (err) {
        console.error("Failed to execute chess move:", err);
        return false;
      }
    },
    [chess, updateCapturedPieces, rerender, sendEvent, myRole, checkGameOver]
  );

  // Handle square clicks on the board
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!isMyTurn || winner) return;

      const pieceAtSquare = chess.get(square);

      // If already selected a piece
      if (selectedSquare) {
        // If clicking the same square, deselect
        if (selectedSquare === square) {
          setSelectedSquare(null);
          return;
        }

        // If clicking another piece of my own color, re-select that piece
        if (pieceAtSquare && pieceAtSquare.color === myColor) {
          setSelectedSquare(square);
          sounds.playClick();
          return;
        }

        // Check if destination is valid
        const moveCandidates = chess.moves({ square: selectedSquare, verbose: true });
        const targetMove = moveCandidates.find((m) => m.to === square);

        if (targetMove) {
          // Check for pawn promotion
          const selectedPiece = chess.get(selectedSquare);
          const isPawn = selectedPiece?.type === "p";
          const isPromotionRank =
            (myColor === ChessPieceColor.WHITE && square.endsWith("8")) ||
            (myColor === ChessPieceColor.BLACK && square.endsWith("1"));

          if (isPawn && isPromotionRank) {
            presentPromotionDialog({
              color: myColor,
              onSelect: (promotionPiece) => {
                executeMove(
                  { from: selectedSquare, to: square, promotion: promotionPiece },
                  true
                );
              },
            });
            return;
          }

          executeMove({ from: selectedSquare, to: square }, true);
          return;
        }

        // Clicked invalid square, clear selection
        setSelectedSquare(null);
        return;
      }

      // No piece selected yet: only allow selecting pieces of my color
      if (pieceAtSquare && pieceAtSquare.color === myColor) {
        setSelectedSquare(square);
        sounds.playClick();
      }
    },
    [isMyTurn, winner, chess, selectedSquare, myColor, executeMove, presentPromotionDialog]
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
      chess.reset();
      setWinner(null);
      setCurrentTurn(startingPlayer);
      setSelectedSquare(null);
      setLastMove(null);
      setCapturedWhite([]);
      setCapturedBlack([]);
      onDismissResultDialog?.();
      rerender();
    },
    [chess, onDismissResultDialog, rerender]
  );

  return {
    chess,
    board,
    currentTurn,
    winner,
    setGameWinner: setWinner,
    myColor,
    isMyTurn,
    selectedSquare,
    validTargetSquares,
    lastMove,
    isInCheckColor,
    isCheckSquare,
    capturedWhite,
    capturedBlack,
    handleSquareClick,
    executeMove,
    resetGame,
    passTurnTimeout,
  };
}
