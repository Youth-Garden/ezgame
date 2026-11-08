"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { formatUrl, getGamePlayRoute, ApiRouteEnum } from "@/shared/constants/routes";
import { httpClient } from "@/shared/lib/http-client";
import { GameType } from "@/shared/types/room";
import { Icons } from "@/shared/icons";
import type { PortalProps } from "@/shared/types/portal.types";
import type { GameRoomModalData } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function RoomSelectionDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<GameRoomModalData>) {
  const router = useRouter();
  const t = useTranslations("modal");
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

      const result = await httpClient.post<{
        success: boolean;
        room?: { code: string; gameType: string };
        error?: string;
      }>(ApiRouteEnum.ROOMS, { gameType });
      if (result.success && result.room?.code) {
        onDismiss?.();
        const routeTarget = getGamePlayRoute(gameType);
        const playUrl = formatUrl(
          routeTarget,
          { code: result.room.code }
        );
        router.push(playUrl);
      } else {
        setErrorMsg(result.error || t("createErr"));
      }
    } catch {
      setErrorMsg(t("connectErr"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg(t("emptyCodeErr"));
      return;
    }

    try {
      setIsJoining(true);
      setErrorMsg("");

      const apiUrl = formatUrl(ApiRouteEnum.ROOMS, {}, {
        code: cleanCode,
        gameType: gameType || "",
      });
      const result = await httpClient.get<{
        success: boolean;
        room?: { code: string; gameType: string };
        error?: string;
      }>(apiUrl);

      if (result.success && result.room) {
        onDismiss?.();
        const routeTarget = getGamePlayRoute(result.room.gameType || gameType || GameType.CARO);
        const playUrl = formatUrl(
          routeTarget,
          { code: cleanCode }
        );
        router.push(playUrl);
      } else {
        setErrorMsg(t("notFoundErr"));
      }
    } catch {
      setErrorMsg(t("connectErr"));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={true} className="w-[min(calc(100vw-2rem),28rem)] p-6">
        <DialogHeader className="items-center text-center pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {gameTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Segmented Tab Switcher with sliding animation */}
        <div className="w-full pt-1">
          <div className="relative flex p-1 bg-muted rounded-xl mb-5">
            {/* Animated Sliding Highlight Pill */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-card shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
                activeTab === "create" ? "translate-x-0" : "translate-x-full"
              }`}
            />

            <button
              type="button"
              onClick={() => {
                setActiveTab("create");
                setErrorMsg("");
              }}
              className={`relative z-10 flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer ${
                activeTab === "create"
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("createTab")}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("join");
                setErrorMsg("");
              }}
              className={`relative z-10 flex-1 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer ${
                activeTab === "join"
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("joinTab")}
            </button>
          </div>

          {/* Tab 1: Create Room */}
          {activeTab === "create" ? (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-4 rounded-xl bg-muted/60 dark:bg-muted/40">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/15 text-primary mt-0.5 shrink-0 flex items-center justify-center">
                    <Icons name="sparkles" size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {t("hostTitle")}
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed font-medium">
                      {t("hostDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-destructive/10 border-none text-destructive text-xs flex items-center gap-2">
                  <Icons name="alert-circle" size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                variant="default"
                size="lg"
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full font-semibold shadow-md gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t("creatingBtn")}</span>
                  </>
                ) : (
                  <>
                    <Icons name="plus" size={16} />
                    <span>{t("createBtn")}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Tab 2: Join Existing Room */
            <form onSubmit={handleJoinRoom} className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <label
                  htmlFor="room-code-input"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  {t("inputLabel")}
                </label>
                <Input
                  id="room-code-input"
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder={t("inputPlaceholder")}
                  maxLength={8}
                />
                <p className="text-[11px] text-text-secondary mt-1.5 font-medium">
                  {t("joinRoleNotice")}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border-none text-rose-500 text-xs flex items-center gap-2">
                  <Icons name="alert-circle" size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                variant="default"
                size="lg"
                type="submit"
                disabled={isJoining}
                className="w-full font-semibold shadow-md gap-2"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>{t("joiningBtn")}</span>
                  </>
                ) : (
                  <>
                    <Icons name="arrow-right" size={16} />
                    <span>{t("joinBtn")}</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
