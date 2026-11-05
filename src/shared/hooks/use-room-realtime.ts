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
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
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

  // Handle Supabase Realtime OR Local BroadcastChannel
  useEffect(() => {
    if (!roomCode) return;

    let active = true;
    const clientId = getOrCreateClientId();
    clientIdRef.current = clientId;

    // 1. Fallback / Tab-to-Tab Local Broadcast Channel
    let localBroadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      localBroadcastChannel = new BroadcastChannel(`ezgame_room_${roomCode}`);
      broadcastChannelRef.current = localBroadcastChannel;

      localBroadcastChannel.onmessage = (event) => {
        if (!active || !event.data) return;
        const msg = event.data;
        if (msg.senderId === clientId) return;

        if (msg.type === "PRESENCE_PING") {
          localBroadcastChannel?.postMessage({
            type: "PRESENCE_PONG",
            senderId: clientId,
            presence: {
              id: clientId,
              role: myRole,
              joinedAt: Date.now(),
            },
          });
          setPeers((prev) => {
            const exists = prev.some((peer) => peer.id === msg.presence.id);
            if (exists) return prev;
            return [...prev, msg.presence];
          });
        } else if (msg.type === "PRESENCE_PONG") {
          setPeers((prev) => {
            const exists = prev.some((peer) => peer.id === msg.presence.id);
            if (exists) return prev;
            return [...prev, msg.presence];
          });
        } else if (msg.type === "PEER_LEAVE") {
          setPeers((prev) => prev.filter((peer) => peer.id !== msg.senderId));
        } else if (msg.type === "REALTIME_EVENT") {
          eventHandlerRef.current?.(msg.event);
        }
      };

      // Announce our presence locally
      localBroadcastChannel.postMessage({
        type: "PRESENCE_PING",
        senderId: clientId,
        presence: {
          id: clientId,
          role: myRole,
          joinedAt: Date.now(),
        },
      });

      // Include self in peers
      setPeers([{ id: clientId, role: myRole, joinedAt: Date.now() }]);
      setIsChannelReady(true);
    }

    // 2. Supabase Realtime Channel
    if (isConfigured) {
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
    }

    return () => {
      active = false;
      if (localBroadcastChannel) {
        localBroadcastChannel.postMessage({
          type: "PEER_LEAVE",
          senderId: clientId,
        });
        localBroadcastChannel.close();
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [roomCode, myRole, isConfigured]);

  const sendEvent = useCallback(
    async (event: RealtimeEvent) => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "REALTIME_EVENT",
          senderId: clientIdRef.current,
          event,
        });
      }

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
