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
  onEventReceived,
}: UseRoomRealtimeOptions) {
  const [peers, setPeers] = useState<PlayerPresence[]>([]);
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isConfigured] = useState(() => isSupabaseConfigured());

  const [clientId] = useState(() => getOrCreateClientId());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const eventHandlerRef = useRef(onEventReceived);

  useEffect(() => {
    eventHandlerRef.current = onEventReceived;
  }, [onEventReceived]);

  const expectedOpponentRole: PlayerRole =
    myRole === PlayerRole.X ? PlayerRole.O : PlayerRole.X;

  // Check if opponent is online from peers list directly in render (derived state)
  const isOpponentOnline = useMemo(() => {
    return peers.some(
      (peer) => peer.role === expectedOpponentRole && peer.id !== clientId
    );
  }, [peers, expectedOpponentRole, clientId]);

  // Extract opponent profile from presence peers
  const opponentPresence = useMemo(() => {
    return peers.find(
      (peer) => peer.role === expectedOpponentRole && peer.id !== clientId
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

    channel
      .on("presence", { event: "sync" }, () => {
        if (!active) return;
        const presenceState = channel.presenceState<PlayerPresence>();
        const currentPeers: PlayerPresence[] = [];
        Object.values(presenceState).forEach((presences) => {
          presences.forEach((peer) => currentPeers.push(peer));
        });
        setPeers(currentPeers);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        if (!active) return;
        setPeers((prev) => {
          const ids = new Set(prev.map((peer) => peer.id));
          const added = (newPresences as unknown as PlayerPresence[]).filter(
            (peer) => !ids.has(peer.id)
          );
          return [...prev, ...added];
        });
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
            role: myRole,
            joinedAt: Date.now(),
            name: profile?.name,
            avatarSeed: profile?.avatarSeed,
            avatarStyle: profile?.avatarStyle,
          });
        }
      });

    return () => {
      active = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomCode, myRole, isConfigured, clientId, profile?.name, profile?.avatarSeed, profile?.avatarStyle]);

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
