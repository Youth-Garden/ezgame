"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX, Users } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";
import { sounds } from "@/shared/lib/sound-effects";
import { PlayerRole } from "@/shared/types/room";

interface RoomHeaderProps {
  roomCode: string;
  gameTitle: string;
  myRole: PlayerRole;
  isOpponentOnline: boolean;
  expectedOpponentRole: PlayerRole;
  isSupabaseConfigured: boolean;
}

export function RoomHeader({
  roomCode,
  gameTitle,
  myRole,
  isOpponentOnline,
  expectedOpponentRole,
  isSupabaseConfigured,
}: RoomHeaderProps) {
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());

  const toggleSound = () => {
    const nextState = !soundOn;
    sounds.setEnabled(nextState);
    setSoundOn(nextState);
  };

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/caro/${roomCode}?role=${expectedOpponentRole}`
      : "";

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-30 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back to lobby & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
            title="Về trang chủ"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                {gameTitle}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-mono font-semibold text-white/80 border border-white/10">
                #{roomCode}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/60">
              <span>
                Bạn là:{" "}
                <strong
                  className={
                    myRole === PlayerRole.X
                      ? "text-cyan-400 font-bold"
                      : myRole === PlayerRole.O
                      ? "text-rose-400 font-bold"
                      : "text-amber-400"
                  }
                >
                  Quân {myRole}
                </strong>
              </span>
              {!isSupabaseConfigured && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tab-to-Tab Dev Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Opponent status & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Opponent Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-white/50" />
            <span className="text-white/60 hidden sm:inline">
              Đối thủ ({expectedOpponentRole}):
            </span>
            {isOpponentOnline ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Đang chờ...
              </span>
            )}
          </div>

          {/* Copy Invite Link */}
          {inviteUrl && (
            <CopyLinkButton
              textToCopy={inviteUrl}
              label="Mời bạn"
              className="hidden md:inline-flex"
            />
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            type="button"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
            title={soundOn ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
