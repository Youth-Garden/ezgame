"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/shared/lib/supabase";
import { PlayerRole, type PlayerPresence, type RealtimeEvent } from "@/shared/types/room";

interface UseRoomRealtimeOptions {
  roomCode: string;
  myRole: PlayerRole;
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
  onEventReceived,
}: UseRoomRealtimeOptions) {
  const [peers, setPeers] = useState<PlayerPresence[]>([]);
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isOpponentOnline, setIsOpponentOnline] = useState(false);
  const [isConfigured] = useState(() => isSupabaseConfigured());

  const channelRef = useRef<RealtimeChannel | null>(null);
  const eventHandlerRef = useRef(onEventReceived);
  const clientIdRef = useRef<string>("");

  useEffect(() => {
    eventHandlerRef.current = onEventReceived;
  }, [onEventReceived]);

  const expectedOpponentRole: PlayerRole =
    myRole === PlayerRole.X ? PlayerRole.O : PlayerRole.X;

  // Check if opponent is online from peers list
  useEffect(() => {
    const oppFound = peers.some(
      (peer) => peer.role === expectedOpponentRole && peer.id !== clientIdRef.current
    );
    setIsOpponentOnline(oppFound);
  }, [peers, expectedOpponentRole]);

  // Handle Supabase Realtime Channel
  useEffect(() => {
    if (!roomCode || !isConfigured) return;

    let active = true;
    const clientId = getOrCreateClientId();
    clientIdRef.current = clientId;

    const supabase = getSupabaseClient();
    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: {
          key: clientId,
        },
        broadcast: {
          self: false,
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
        if (payload) {
          eventHandlerRef.current?.(payload as RealtimeEvent);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsChannelReady(true);
          await channel.track({
            id: clientId,
            role: myRole,
            joinedAt: Date.now(),
          });
        }
      });

    return () => {
      active = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [roomCode, myRole, isConfigured]);

  const sendEvent = useCallback(
    async (event: RealtimeEvent) => {
      if (isConfigured && channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "game_event",
          payload: event,
        });
      }
    },
    [isConfigured]
  );

  return {
    peers,
    isOpponentOnline,
    isChannelReady,
    sendEvent,
    isSupabaseConfigured: isConfigured,
    expectedOpponentRole,
  };
}
