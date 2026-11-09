"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePortal } from "@/shared/components/portal";
import { ResultDialog, type ResultDialogData } from "@/shared/components/result-dialog";
import { MatchStartVsDialog, type MatchStartVsDialogData } from "@/shared/components/match-start-vs-dialog";
import { ConfirmDialog, type ConfirmDialogData } from "@/shared/components/confirm-dialog";
import { usePlayerProfile } from "@/shared/hooks/use-player-profile";
import { useRoomRealtime } from "@/shared/hooks/use-room-realtime";
import { PlayerRole, RealtimeEventType, GameWinner, type RealtimeEvent } from "@/shared/types/room";

interface UseGameRoomParams {
  gameTitle: string;
  defaultRoomCode?: string;
  onEventReceived?: (event: RealtimeEvent) => void;
  onSurrenderConfirmed?: () => Promise<void> | void;
}

export function useGameRoom({
  gameTitle,
  defaultRoomCode = "ROOM-DEMO",
  onEventReceived,
  onSurrenderConfirmed,
}: UseGameRoomParams) {
  const routeParams = useParams();
  const searchParams = useSearchParams();

  const { profile: myProfile, randomizeAvatar } = usePlayerProfile();

  const rawCode = (routeParams?.code as string) || defaultRoomCode;
  const roomCode = rawCode.toUpperCase();

  const roleParam = searchParams?.get("role")?.toUpperCase();
  const getInitialRole = (): PlayerRole => {
    if (roleParam === "O") return PlayerRole.O;
    if (roleParam === "X") return PlayerRole.X;
    if (roleParam === "SPECTATOR") return PlayerRole.SPECTATOR;

    // Check if player role was saved in sessionStorage for this room (prevents random flip on F5)
    if (typeof window !== "undefined") {
      const savedRole = window.sessionStorage.getItem(`ezgame_role_${roomCode}`);
      if (savedRole === PlayerRole.X || savedRole === PlayerRole.O) {
        return savedRole as PlayerRole;
      }
    }

    return Math.random() < 0.5 ? PlayerRole.X : PlayerRole.O;
  };

  const [myRole, setMyRoleState] = useState<PlayerRole>(getInitialRole);

  const setMyRole = useCallback((newRole: PlayerRole) => {
    setMyRoleState(newRole);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`ezgame_role_${roomCode}`, newRole);
    }
  }, [roomCode]);

  useEffect(() => {
    if (typeof window !== "undefined" && (myRole === PlayerRole.X || myRole === PlayerRole.O)) {
      window.sessionStorage.setItem(`ezgame_role_${roomCode}`, myRole);
    }
  }, [myRole, roomCode]);

  // Modal / Dialog Portal hooks
  const [presentResultDialog, dismissResultDialog] = usePortal<ResultDialogData>(ResultDialog);
  const [presentVsDialog] = usePortal<MatchStartVsDialogData>(MatchStartVsDialog);
  const [presentConfirmDialog] = usePortal<ConfirmDialogData>(ConfirmDialog);

  const hasShownVsModalRef = useRef(false);
  const sendEventRef = useRef<(event: RealtimeEvent) => Promise<void>>(async () => {});

  const showResultDialog = useCallback(
    (
      currentWinner: GameWinner | null,
      isRequestedByMe: boolean = false,
      isRequestedByOpponent: boolean = false,
      onRequestRematch?: () => void,
      onAcceptRematch?: () => void
    ) => {
      presentResultDialog({
        winner: currentWinner,
        myRole,
        isRematchRequestedByMe: isRequestedByMe,
        isRematchRequestedByOpponent: isRequestedByOpponent,
        onRequestRematch,
        onAcceptRematch,
      });
    },
    [presentResultDialog, myRole]
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
          clientId: typeof window !== "undefined" ? window.sessionStorage.getItem("ezgame_client_id") || "" : "",
        },
      }).catch((err) => console.error("[GameRoom] Failed to request room sync:", err));
    }
  }, [isOpponentOnline, myRole, sendEvent]);

  // Auto trigger Match VS Dialog when opponent connects to room
  useEffect(() => {
    if (isOpponentOnline && opponentProfile && !hasShownVsModalRef.current) {
      hasShownVsModalRef.current = true;

      const playerXProfile = myRole === PlayerRole.X ? myProfile : opponentProfile;
      const playerOProfile = myRole === PlayerRole.O ? myProfile : opponentProfile;

      presentVsDialog({
        playerXName: playerXProfile?.name || "Player X",
        playerXAvatar: playerXProfile?.avatarUrl || "",
        playerOName: playerOProfile?.name || "Player O",
        playerOAvatar: playerOProfile?.avatarUrl || "",
        gameTitle,
      });
    }
  }, [isOpponentOnline, opponentProfile, myRole, myProfile, presentVsDialog, gameTitle]);

  // Unified Surrender Confirmation Dialog
  const promptSurrender = useCallback(() => {
    if (myRole === PlayerRole.SPECTATOR) return;

    presentConfirmDialog({
      title: "Surrender Match?",
      description: "Are you sure you want to surrender this match? Your opponent will be awarded the win.",
      confirmText: "Surrender",
      cancelText: "Keep Playing",
      variant: "destructive",
      icon3D: "defeat-3d",
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
