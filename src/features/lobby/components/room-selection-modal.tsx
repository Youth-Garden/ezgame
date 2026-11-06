"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Plus, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatUrl, RouteEnum } from "@/shared/constants/routes";
import { PlayerRole } from "@/shared/types/room";
import type { PortalProps } from "@/shared/types/portal.types";
import type { GameRoomModalData, LobbyLocale } from "../types";

const MODAL_I18N = {
  vi: {
    createTab: "Tạo phòng",
    joinTab: "Vào phòng",
    hostTitle: "Chủ phòng • Quân X (Đi trước)",
    hostDesc: "Hệ thống sẽ tạo mã phòng thi đấu. Gửi liên kết cho đối thủ để bắt đầu trận chiến.",
    createBtn: "Tạo phòng ngay",
    creatingBtn: "Đang tạo phòng...",
    inputLabel: "Nhập mã trận đấu",
    inputPlaceholder: "VD: CR-8892",
    joinRoleNotice: "Bạn sẽ tham gia với vai trò Quân O (Đi sau).",
    joinBtn: "Vào trận",
    joiningBtn: "Đang kết nối...",
    emptyCodeErr: "Vui lòng nhập mã phòng!",
    notFoundErr: "Mã phòng không tồn tại hoặc đã hết hạn.",
    createErr: "Không thể tạo phòng. Vui lòng thử lại.",
    connectErr: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
  },
  en: {
    createTab: "Create Room",
    joinTab: "Join Room",
    hostTitle: "Host as Player X (Moves first)",
    hostDesc: "A match code will be generated. Send the invite link to your opponent to begin.",
    createBtn: "Create Room",
    creatingBtn: "Creating Room...",
    inputLabel: "Enter Match Code",
    inputPlaceholder: "e.g. CR-8892",
    joinRoleNotice: "You will enter the match as Player O (moving second).",
    joinBtn: "Join Match",
    joiningBtn: "Connecting...",
    emptyCodeErr: "Please enter a room code!",
    notFoundErr: "Room code not found or has expired.",
    createErr: "Failed to create room. Please try again.",
    connectErr: "Unable to connect to the server. Please try again.",
  },
};

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

  const locale: LobbyLocale = data?.locale || "vi";
  const i18n = MODAL_I18N[locale];
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
        setErrorMsg(result.error || i18n.createErr);
      }
    } catch {
      setErrorMsg(i18n.connectErr);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg(i18n.emptyCodeErr);
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
        setErrorMsg(i18n.notFoundErr);
      }
    } catch {
      setErrorMsg(i18n.connectErr);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      className={`relative w-full max-w-md mx-4 z-50 rounded-2xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-2 pointer-events-none"
      }`}
    >
      {/* Header - Centered title */}
      <div className="relative px-6 pt-6 pb-2 text-center">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          {gameTitle}
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 pt-3 pb-6">
        {/* Animated Sliding Pill Segmented Indicator */}
        <div className="relative flex p-1 bg-neutral-100 dark:bg-neutral-950/80 rounded-xl mb-5">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-neutral-800 shadow-xs transition-transform duration-200 ease-out ${
              activeTab === "create" ? "translate-x-0" : "translate-x-full"
            }`}
          />

          <button
            type="button"
            onClick={() => {
              setActiveTab("create");
              setErrorMsg("");
            }}
            className={`relative z-10 flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === "create"
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {i18n.createTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("join");
              setErrorMsg("");
            }}
            className={`relative z-10 flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === "join"
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {i18n.joinTab}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Content: Create */}
        {activeTab === "create" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-neutral-950/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 text-primary shadow-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                    {i18n.hostTitle}
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {i18n.hostDesc}
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
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{i18n.creatingBtn}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{i18n.createBtn}</span>
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
                className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5"
              >
                {i18n.inputLabel}
              </label>
              <input
                id="room-code-input"
                type="text"
                placeholder={i18n.inputPlaceholder}
                value={roomCodeInput}
                onChange={(event) =>
                  setRoomCodeInput(event.target.value.toUpperCase())
                }
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-950/70 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-mono text-center text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                maxLength={10}
              />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                {i18n.joinRoleNotice}
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
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{i18n.joiningBtn}</span>
                </>
              ) : (
                <>
                  <span>{i18n.joinBtn}</span>
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
