"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/shared/lib/supabase";
import { PlayerRole, type PlayerPresence, type RealtimeEvent } from "@/shared/types/room";
import { type PlayerProfile } from "./use-player-profile";
import { getAvatarUrl, type AvatarStyle } from "@/shared/lib/avatar";

interface UseRoomRealtimeOptions {
  roomCode: string;
  myRole: PlayerRole;
  profile?: PlayerProfile;
  onRoleAssigned?: (assignedRole: PlayerRole) => void;
  onEventReceived?: (event: RealtimeEvent) => void;
}

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "client_ssr";
  let id = window.sessionStorage.getItem("ezgame_client_id");
  if (!id) {
    id = `client_${Math.random().toString(36).substring(2, 9)}`;
    window.sessionStorage.setItem("ezgame_client_id", id);
  }
  return id;
}

export function useRoomRealtime({
  roomCode,
  myRole,
  profile,
  onRoleAssigned,
  onEventReceived,
}: UseRoomRealtimeOptions) {
  const [peers, setPeers] = useState<PlayerPresence[]>([]);
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isConfigured] = useState(() => isSupabaseConfigured());

  const [clientId] = useState(() => getOrCreateClientId());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const eventHandlerRef = useRef(onEventReceived);
  const onRoleAssignedRef = useRef(onRoleAssigned);
  const profileRef = useRef(profile);
  const myRoleRef = useRef(myRole);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Always keep refs synced without triggering channel teardown
  useEffect(() => {
    myRoleRef.current = myRole;
  }, [myRole]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    eventHandlerRef.current = onEventReceived;
  }, [onEventReceived]);

  useEffect(() => {
    onRoleAssignedRef.current = onRoleAssigned;
  }, [onRoleAssigned]);

  const expectedOpponentRole: PlayerRole =
    myRole === PlayerRole.X ? PlayerRole.O : PlayerRole.X;

  // Immediate presence check from active peers
  const hasOpponentInPeers = useMemo(() => {
    return peers.some(
      (peer) => peer.id !== clientId && (peer.role === expectedOpponentRole || peer.role !== myRole || peers.length >= 2)
    );
  }, [peers, expectedOpponentRole, myRole, clientId]);

  // Debounced isOpponentOnline with a 4-second grace period to prevent flickering during transient socket drops / F5
  const [isOpponentOnline, setIsOpponentOnline] = useState(hasOpponentInPeers);

  useEffect(() => {
    if (hasOpponentInPeers) {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
      setIsOpponentOnline(true);
    } else {
      // Don't immediately drop the game, give 4 seconds grace period for heartbeat / re-sync
      if (!disconnectTimerRef.current) {
        disconnectTimerRef.current = setTimeout(() => {
          setIsOpponentOnline(false);
          disconnectTimerRef.current = null;
        }, 4000);
      }
    }
  }, [hasOpponentInPeers]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }
    };
  }, []);

  // Extract opponent profile from presence peers
  const opponentPresence = useMemo(() => {
    return (
      peers.find((peer) => peer.role === expectedOpponentRole && peer.id !== clientId) ||
      peers.find((peer) => peer.id !== clientId)
    );
  }, [peers, expectedOpponentRole, clientId]);

  const opponentProfile = useMemo(() => {
    if (!opponentPresence) return null;
    const seed = opponentPresence.avatarSeed || opponentPresence.id;
    const style = (opponentPresence.avatarStyle as AvatarStyle) || "bottts-neutral";
    return {
      name: opponentPresence.name || `Player ${expectedOpponentRole}`,
      avatarUrl: getAvatarUrl(style, seed),
      role: opponentPresence.role,
    };
  }, [opponentPresence, expectedOpponentRole]);

  // Handle Supabase Realtime Channel
  useEffect(() => {
    if (!roomCode || !isConfigured) return;

    let active = true;

    const supabase = getSupabaseClient();
    const channelName = `room-${roomCode}`;
    const channel = supabase.channel(channelName, {
      config: {
        private: false,
        presence: {
          key: clientId,
        },
        broadcast: {
          self: false,
          ack: true,
        },
      },
    });

    channelRef.current = channel;

    const syncPeers = async () => {
      if (!active) return;
      const presenceState = channel.presenceState<PlayerPresence>();
      const currentPeers: PlayerPresence[] = [];
      Object.values(presenceState).forEach((presences) => {
        presences.forEach((peer) => currentPeers.push(peer));
      });
      setPeers(currentPeers);

      // Auto-assign roles: first arrival gets random X/O, second arrival gets the other role
      const otherPlayers = currentPeers.filter((p) => p.id !== clientId);
      const existingPeer = otherPlayers[0];

      if (existingPeer && existingPeer.role) {
        // There is already a player in the room: give me the opposite role
        const oppositeRole = existingPeer.role === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
        if (myRoleRef.current !== oppositeRole && myRoleRef.current !== PlayerRole.SPECTATOR) {
          onRoleAssignedRef.current?.(oppositeRole);
          await channel.track({
            id: clientId,
            role: oppositeRole,
            joinedAt: Date.now(),
            name: profileRef.current?.name,
            avatarSeed: profileRef.current?.avatarSeed,
            avatarStyle: profileRef.current?.avatarStyle,
          });
        }
      }
    };

    channel
      .on("presence", { event: "sync" }, syncPeers)
      .on("presence", { event: "join" }, ({ newPresences }) => {
        if (!active) return;
        const incoming = newPresences as unknown as PlayerPresence[];
        setPeers((prev) => {
          const ids = new Set(prev.map((peer) => peer.id));
          const added = incoming.filter((peer) => !ids.has(peer.id));
          return [...prev, ...added];
        });

        // Fast handshake role assignment on immediate join
        const otherPeer = incoming.find((p) => p.id !== clientId);
        if (otherPeer && otherPeer.role && myRoleRef.current === otherPeer.role) {
          const oppositeRole = otherPeer.role === PlayerRole.X ? PlayerRole.O : PlayerRole.X;
          onRoleAssignedRef.current?.(oppositeRole);
          channel.track({
            id: clientId,
            role: oppositeRole,
            joinedAt: Date.now(),
            name: profileRef.current?.name,
            avatarSeed: profileRef.current?.avatarSeed,
            avatarStyle: profileRef.current?.avatarStyle,
          }).catch(() => {});
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (!active) return;
        const leftIds = new Set(
          (leftPresences as unknown as PlayerPresence[]).map((peer) => peer.id)
        );
        setPeers((prev) => prev.filter((peer) => !leftIds.has(peer.id)));
      })
      .on("broadcast", { event: "game_event" }, ({ payload }) => {
        if (!active) return;
        console.log("[Realtime] Received game_event:", payload);
        if (payload) {
          eventHandlerRef.current?.(payload as RealtimeEvent);
        }
      })
      .subscribe(async (status, err) => {
        console.log(`[Realtime] Subscription status for ${channelName}:`, status, err || "");
        if (status === "SUBSCRIBED") {
          setIsChannelReady(true);
          await channel.track({
            id: clientId,
            role: myRoleRef.current,
            joinedAt: Date.now(),
            name: profileRef.current?.name,
            avatarSeed: profileRef.current?.avatarSeed,
            avatarStyle: profileRef.current?.avatarStyle,
          });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          // Attempt graceful re-subscribe on connection failure
          console.warn(`[Realtime] Socket issue (${status}). Retrying subscription...`);
          setTimeout(() => {
            if (active && channelRef.current) {
              channelRef.current.subscribe();
            }
          }, 2000);
        }
      });

    return () => {
      active = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomCode, isConfigured, clientId]);

  const sendEvent = useCallback(
    async (event: RealtimeEvent) => {
      if (isConfigured && channelRef.current) {
        console.log("[Realtime] Sending game_event:", event);
        const resp = await channelRef.current.send({
          type: "broadcast",
          event: "game_event",
          payload: event,
        });
        console.log("[Realtime] Send response status:", resp);
      }
    },
    [isConfigured]
  );

  return {
    peers,
    isOpponentOnline,
    opponentProfile,
    isChannelReady,
    sendEvent,
    isSupabaseConfigured: isConfigured,
    expectedOpponentRole,
  };
}
