"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { formatUrl, getGamePlayRoute, ApiRouteEnum } from "@/shared/constants/routes";
import { httpClient } from "@/shared/lib/http-client";
import { GameType } from "@/shared/types/room";
import { DEFAULT_CARO_CONFIG } from "@/features/caro/config/caro-config";
import { DEFAULT_BIDA_CONFIG } from "@/features/bida/config/bida-config";
import { Icons } from "@/shared/icons";
import type { PortalProps } from "@/shared/types/portal.types";
import type { GameRoomModalData } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const CARO_TIME_OPTIONS = [15, 30, 45, 60] as const;
const CARO_BOARD_OPTIONS = [15, 19] as const;
const BIDA_TIME_OPTIONS = [30, 45, 60, 90] as const;

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

  const gameType = data?.gameType;
  const gameTitle = data?.gameTitle || "Game";
  const isCaro = gameType === GameType.CARO;
  const isBida = gameType === GameType.BIDA;

  // Editable Match Configuration State
  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(
    isCaro
      ? DEFAULT_CARO_CONFIG.turnTimeLimitSeconds
      : DEFAULT_BIDA_CONFIG.turnTimeLimitSeconds
  );
  const [caroBoardSize, setCaroBoardSize] = useState<number>(
    DEFAULT_CARO_CONFIG.boardSize
  );

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    if (!gameType) return;
    try {
      setIsCreating(true);
      setErrorMsg("");

      const result = await httpClient.post<{
        success: boolean;
        room?: { code: string; gameType: string };
        error?: string;
      }>(ApiRouteEnum.ROOMS, {
        gameType,
        config: {
          turnTimeLimitSeconds: turnTimeLimit,
          boardSize: isCaro ? caroBoardSize : undefined,
        },
      });

      if (result.success && result.room?.code) {
        onDismiss?.();
        const routeTarget = getGamePlayRoute(gameType);
        const playUrl = formatUrl(
          routeTarget,
          { code: result.room.code },
          {
            time: String(turnTimeLimit),
            ...(isCaro ? { size: String(caroBoardSize) } : {}),
          }
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

      const apiUrl = formatUrl(
        ApiRouteEnum.ROOMS,
        {},
        {
          code: cleanCode,
          gameType: gameType || "",
        }
      );
      const result = await httpClient.get<{
        success: boolean;
        room?: { code: string; gameType: string };
        error?: string;
      }>(apiUrl);

      if (result.success && result.room) {
        onDismiss?.();
        const routeTarget = getGamePlayRoute(
          result.room.gameType || gameType || GameType.CARO
        );
        const playUrl = formatUrl(routeTarget, { code: cleanCode });
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
      <DialogContent showCloseButton={true}>
        <DialogHeader className="items-center text-center pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {gameTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="w-full pt-1">
          <div className="relative flex p-1 bg-muted rounded-xl mb-5">
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

          {/* Tab Transition Container: Grid stack prevents height collapse */}
          <div className="grid grid-cols-1 transition-[height] duration-300 ease-out">
            {/* Tab 1: Create Room */}
            <div
              className={`col-start-1 row-start-1 space-y-4 transition-all duration-300 ease-out ${
                activeTab === "create"
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-3 pointer-events-none invisible"
              }`}
            >
              <Card variant="outline" className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-secondary text-foreground shrink-0 flex items-center justify-center">
                    <Icons name="gamepad" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {t("hostTitle")}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {t("hostDesc")}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Editable Match Configuration */}
              <Card variant="outline" className="p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Icons name="settings" size={13} className="text-muted-foreground" />
                    {t("matchSettings")}
                  </span>
                  <Badge variant="subtle" size="sm">
                    {isCaro ? t("ruleStandard") : t("rule8Ball")}
                  </Badge>
                </div>

                {/* Option 1: Turn Time Limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Icons name="timer" size={12} className="text-muted-foreground" />
                      {t("turnTimeLimit")}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {turnTimeLimit}s / turn
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(isCaro ? CARO_TIME_OPTIONS : BIDA_TIME_OPTIONS).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setTurnTimeLimit(sec)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none text-center ${
                          turnTimeLimit === sec
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "bg-secondary text-foreground hover:opacity-90"
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 2: Board Size (Caro) or Mode (Bida) */}
                {isCaro ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Icons name="grid" size={12} className="text-muted-foreground" />
                        {t("boardSize")}
                      </span>
                      <span className="font-bold text-foreground font-mono">
                        {caroBoardSize} × {caroBoardSize}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {CARO_BOARD_OPTIONS.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCaroBoardSize(size)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none text-center ${
                            caroBoardSize === size
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "bg-secondary text-foreground hover:opacity-90"
                          }`}
                        >
                          {size} × {size} Grid
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <Card
                      variant="subtle"
                      className="flex items-center justify-center p-2.5 rounded-xl text-center"
                    >
                      <span className="text-xs font-semibold text-foreground font-mono">
                        16 Balls (8-Ball Solids & Stripes)
                      </span>
                    </Card>
                  </div>
                )}
              </Card>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <Icons name="alert-circle" size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                variant="default"
                size="lg"
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full font-semibold gap-2"
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

            {/* Tab 2: Join Existing Room */}
            <form
              onSubmit={handleJoinRoom}
              className={`col-start-1 row-start-1 space-y-4 transition-all duration-300 ease-out ${
                activeTab === "join"
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-3 pointer-events-none invisible"
              }`}
            >
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
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {t("joinRoleNotice")}
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <Icons name="alert-circle" size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                variant="default"
                size="lg"
                type="submit"
                disabled={isJoining}
                className="w-full font-semibold gap-2"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
