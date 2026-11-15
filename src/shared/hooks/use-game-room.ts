'use client';

import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '@/shared/components/confirm-dialog';
import {
  MatchStartVsDialog,
  type MatchStartVsDialogData,
} from '@/shared/components/match-start-vs-dialog';
import { usePortal } from '@/shared/components/portal';
import {
  ResultDialog,
  type ResultDialogData,
} from '@/shared/components/result-dialog';
import { usePlayerProfile } from '@/shared/hooks/use-player-profile';
import { useRoomRealtime } from '@/shared/hooks/use-room-realtime';
import {
  GameWinner,
  PlayerRole,
  RealtimeEventType,
  type RealtimeEvent,
} from '@/shared/types/room';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseGameRoomParams {
  gameTitle: string;
  gameType?: "caro" | "bida" | "tictactoe" | "xiangqi";
  defaultRoomCode?: string;
  onEventReceived?: (event: RealtimeEvent) => void;
  onSurrenderConfirmed?: () => Promise<void> | void;
}

export function useGameRoom({
  gameTitle,
  gameType = "caro",
  defaultRoomCode = 'ROOM-DEMO',
  onEventReceived,
  onSurrenderConfirmed,
}: UseGameRoomParams) {
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const { profile: myProfile, randomizeAvatar } = usePlayerProfile();

  const rawCode = (routeParams?.code as string) || defaultRoomCode;
  const roomCode = rawCode.toUpperCase();

  const roleParam = searchParams?.get('role')?.toUpperCase();
  const getInitialRole = (): PlayerRole => {
    if (roleParam === 'O') return PlayerRole.O;
    if (roleParam === 'X') return PlayerRole.X;
    if (roleParam === 'SPECTATOR') return PlayerRole.SPECTATOR;

    // Check if player role was saved in sessionStorage for this room (prevents random flip on F5)
    if (typeof window !== 'undefined') {
      const savedRole = window.sessionStorage.getItem(
        `ezgame_role_${roomCode}`,
      );
      if (savedRole === PlayerRole.X || savedRole === PlayerRole.O) {
        return savedRole as PlayerRole;
      }
    }

    return Math.random() < 0.5 ? PlayerRole.X : PlayerRole.O;
  };

  const [myRole, setMyRoleState] = useState<PlayerRole>(getInitialRole);

  const setMyRole = useCallback(
    (newRole: PlayerRole) => {
      setMyRoleState(newRole);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`ezgame_role_${roomCode}`, newRole);
      }
    },
    [roomCode],
  );

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (myRole === PlayerRole.X || myRole === PlayerRole.O)
    ) {
      window.sessionStorage.setItem(`ezgame_role_${roomCode}`, myRole);
    }
  }, [myRole, roomCode]);

  // Modal / Dialog Portal hooks
  const [presentResultDialog, dismissResultDialog] =
    usePortal<ResultDialogData>(ResultDialog);
  const [presentVsDialog] =
    usePortal<MatchStartVsDialogData>(MatchStartVsDialog);
  const [presentConfirmDialog] = usePortal<ConfirmDialogData>(ConfirmDialog);

  const hasShownVsModalRef = useRef(false);
  const hasOpponentEverJoinedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const sendEventRef = useRef<(event: RealtimeEvent) => Promise<void>>(
    async () => {},
  );

  const showResultDialog = useCallback(
    (
      currentWinner: GameWinner | null,
      isRequestedByMe: boolean = false,
      isRequestedByOpponent: boolean = false,
      onRequestRematch?: () => void,
      onAcceptRematch?: () => void,
      reason?: "normal" | "opponent_left",
    ) => {
      if (currentWinner) {
        isGameOverRef.current = true;
      }
      presentResultDialog({
        winner: currentWinner,
        myRole,
        reason: reason || "normal",
        isRematchRequestedByMe: isRequestedByMe,
        isRematchRequestedByOpponent: isRequestedByOpponent,
        onRequestRematch,
        onAcceptRematch,
      });
    },
    [presentResultDialog, myRole],
  );

  // Hook into Realtime (Supabase Broadcast + Presence)
  const {
    isOpponentOnline,
    opponentProfile,
    sendEvent,
    isSupabaseConfigured,
    expectedOpponentRole,
  } = useRoomRealtime({
    roomCode,
    myRole,
    profile: myProfile,
    onRoleAssigned: (newRole) => setMyRole(newRole),
    onEventReceived,
  });

  useEffect(() => {
    sendEventRef.current = sendEvent;
  }, [sendEvent]);

  // Unified Request Room Sync side-effect whenever opponent comes online or page enters/reloads (F5)
  useEffect(() => {
    if (isOpponentOnline) {
      sendEvent({
        type: RealtimeEventType.REQUEST_ROOM_SYNC,
        payload: {
          from: myRole,
          clientId:
            typeof window !== 'undefined'
              ? window.sessionStorage.getItem('ezgame_client_id') || ''
              : '',
        },
      }).catch((err) =>
        console.error('[GameRoom] Failed to request room sync:', err),
      );
    }
  }, [isOpponentOnline, myRole, sendEvent]);

  // Auto trigger Match VS Dialog when opponent connects to room
  useEffect(() => {
    if (isOpponentOnline && opponentProfile) {
      hasOpponentEverJoinedRef.current = true;
    }

    if (isOpponentOnline && opponentProfile && !hasShownVsModalRef.current) {
      hasShownVsModalRef.current = true;

      const playerXProfile =
        myRole === PlayerRole.X ? myProfile : opponentProfile;
      const playerOProfile =
        myRole === PlayerRole.O ? myProfile : opponentProfile;

      presentVsDialog({
        playerXName: playerXProfile?.name || 'Player 1',
        playerXAvatar: playerXProfile?.avatarUrl || '',
        playerOName: playerOProfile?.name || 'Player 2',
        playerOAvatar: playerOProfile?.avatarUrl || '',
        gameTitle,
        gameType,
      });
    }
  }, [
    isOpponentOnline,
    opponentProfile,
    myRole,
    myProfile,
    presentVsDialog,
    gameTitle,
  ]);

  // When opponent leaves / disconnects during an active game:
  // Award immediate win to the remaining player and pop up victory dialog!
  useEffect(() => {
    if (
      !isOpponentOnline &&
      hasOpponentEverJoinedRef.current &&
      !isGameOverRef.current &&
      myRole !== PlayerRole.SPECTATOR
    ) {
      // Current player wins automatically
      const winRole: GameWinner =
        myRole === PlayerRole.X ? GameWinner.X : GameWinner.O;
      isGameOverRef.current = true;
      showResultDialog(
        winRole,
        false,
        false,
        undefined,
        undefined,
        "opponent_left",
      );
    }
  }, [isOpponentOnline, myRole, showResultDialog]);

  // Unified Surrender Confirmation Dialog
  const promptSurrender = useCallback(() => {
    if (myRole === PlayerRole.SPECTATOR) return;

    presentConfirmDialog({
      title: 'Surrender Match?',
      description:
        'Are you sure you want to surrender this match? Your opponent will be awarded the win.',
      confirmText: 'Surrender',
      variant: 'destructive',
      icon3D: 'defeat-3d',
      onConfirm: async () => {
        await onSurrenderConfirmed?.();
      },
    });
  }, [myRole, presentConfirmDialog, onSurrenderConfirmed]);

  return {
    roomCode,
    myRole,
    setMyRole,
    myProfile,
    randomizeAvatar,
    isOpponentOnline,
    opponentProfile,
    expectedOpponentRole,
    isSupabaseConfigured,
    sendEvent,
    sendEventRef,
    showResultDialog,
    dismissResultDialog,
    promptSurrender,
  };
}
