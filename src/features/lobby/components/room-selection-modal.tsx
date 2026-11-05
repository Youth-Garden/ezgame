"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Plus, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatUrl, RouteEnum } from "@/shared/constants/routes";
import { PlayerRole } from "@/shared/types/room";
import type { PortalProps } from "@/shared/types/portal.types";
import type { GameRoomModalData } from "../types";

export function RoomSelectionModal({
  isOpen,
  onDismiss,
  data,
}: PortalProps<GameRoomModalData>) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const gameType = data?.gameType;
  const gameTitle = data?.gameTitle || "Game";

  const handleCreateRoom = async () => {
    if (!gameType) return;
    try {
      setIsCreating(true);
      setErrorMsg("");

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType }),
      });

      const result = await response.json();
      if (result.success && result.room?.code) {
        onDismiss?.();
        const playUrl = formatUrl(
          RouteEnum.CARO_PLAY,
          { code: result.room.code },
          { role: PlayerRole.X }
        );
        router.push(playUrl);
      } else {
        setErrorMsg(result.error || "Failed to create room. Please try again.");
      }
    } catch {
      setErrorMsg("Unable to connect to the server. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg("Please enter a room code!");
      return;
    }

    try {
      setIsJoining(true);
      setErrorMsg("");

      const response = await fetch(
        `/api/rooms?code=${encodeURIComponent(cleanCode)}`
      );
      const result = await response.json();

      if (result.success && result.room) {
        onDismiss?.();
        const playUrl = formatUrl(
          RouteEnum.CARO_PLAY,
          { code: cleanCode },
          { role: PlayerRole.O }
        );
        router.push(playUrl);
      } else {
        setErrorMsg("Room code not found or has expired.");
      }
    } catch {
      setErrorMsg("Failed to connect to the room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-4 z-50 rounded-2xl bg-card border border-border text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {gameTitle}
          </span>
          <h2 className="text-lg font-bold text-foreground">
            Lobby & Matchmaking
          </h2>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("create");
              setErrorMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "create"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create New Room
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("join");
              setErrorMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "join"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Join Existing Room
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Content: Create */}
        {activeTab === "create" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Host as Player X
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    A unique room code will be generated. Send the invite link to your opponent to duel in realtime.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Room Now</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Tab Content: Join */
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label
                htmlFor="room-code-input"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                Enter Match Code
              </label>
              <input
                id="room-code-input"
                type="text"
                placeholder="e.g. CR-8892"
                value={roomCodeInput}
                onChange={(event) =>
                  setRoomCodeInput(event.target.value.toUpperCase())
                }
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/50 font-mono text-center text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                maxLength={10}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                You will enter the match as Player O (moving second).
              </p>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isJoining || !roomCodeInput.trim()}
              className="w-full flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Join Match</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
