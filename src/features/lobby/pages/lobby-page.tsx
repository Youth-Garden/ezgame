"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { GameType, PlayerRole } from "@/shared/types/room";
import { RouteEnum, formatUrl } from "@/shared/constants/routes";

export function LobbyPage() {
  const router = useRouter();
  const selectedGame = GameType.CARO;
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Create room handler
  const handleCreateRoom = async () => {
    try {
      setIsCreating(true);
      setErrorMsg("");

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: selectedGame }),
      });

      const data = await response.json();
      if (data.success && data.room?.code) {
        // Navigate using RouteEnum and formatUrl
        const playUrl = formatUrl(
          RouteEnum.CARO_PLAY,
          { code: data.room.code },
          { role: PlayerRole.X }
        );
        router.push(playUrl);
      } else {
        setErrorMsg(data.error || "Không thể khởi tạo phòng. Vui lòng thử lại!");
      }
    } catch {
      setErrorMsg("Lỗi kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setIsCreating(false);
    }
  };

  // Join room handler
  const handleJoinRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg("Vui lòng nhập mã phòng!");
      return;
    }

    try {
      setIsJoining(true);
      setErrorMsg("");

      const response = await fetch(
        `/api/rooms?code=${encodeURIComponent(cleanCode)}`
      );
      const data = await response.json();

      if (data.success && data.room) {
        const playUrl = formatUrl(
          RouteEnum.CARO_PLAY,
          { code: cleanCode },
          { role: PlayerRole.O }
        );
        router.push(playUrl);
      } else {
        setErrorMsg("Mã phòng không tồn tại hoặc đã hết hạn!");
      }
    } catch {
      setErrorMsg("Lỗi khi kết nối đến phòng!");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400 bg-clip-text text-transparent">
                EzGame
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-white/50 uppercase">
                Casual Web Gaming Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              P2P Realtime Live
            </span>
          </div>
        </div>
      </header>

      {/* Hero & Lobby Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className="max-w-4xl w-full mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Không Cần Tài Khoản • Vào Là Chơi Ngay
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Nền Tảng Đấu Trí Casual <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Thời Gian Thực Siêu Tốc
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto">
            Tạo phòng chỉ với 1 click, gửi link qua Zalo hay Messenger cho bạn bè để cùng so tài. Không cần cài đặt, không cần đăng ký rườm rà.
          </p>
        </div>

        {/* Game Selection Cards */}
        <div className="max-w-4xl w-full mx-auto mb-10">
          <div className="text-left mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              Chọn trò chơi
            </h2>
            <span className="text-xs text-cyan-400">Đa dạng thể loại</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Caro Game Card */}
            <div className="relative p-5 rounded-3xl text-left bg-slate-900/90 border border-cyan-500/50 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30">
                    15x15
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Cờ Caro (Gomoku)
                </h3>
                <p className="text-xs text-white/60 line-clamp-2">
                  Luật 5 ô liên tiếp truyền thống trên bàn cờ 15x15. Đấu trí đỉnh cao thời gian thực!
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  2 Người
                </span>
                <span className="text-cyan-400 font-medium">Sẵn sàng chơi</span>
              </div>
            </div>

            {/* Coming Soon Card */}
            <div className="relative p-5 rounded-3xl text-left bg-slate-900/20 border border-white/5 opacity-60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/40 text-[11px] font-semibold">
                    Sắp ra mắt
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Tic-Tac-Toe (3x3)
                </h3>
                <p className="text-xs text-white/60 line-clamp-2">
                  Trò chơi 3x3 kinh điển, đánh nhanh thắng nhanh trong 30 giây.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  2 Người
                </span>
                <span className="text-white/40 font-medium">Coming soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel: Create & Join */}
        <div className="max-w-2xl w-full mx-auto rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Action 1: Create Room */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-1">Tạo Phòng Mới</h3>
              <p className="text-xs text-white/60 mb-4">
                Bạn giữ vai <strong>Quân X (Đi trước)</strong>. Nhận link để gửi cho bạn bè.
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                type="button"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang tạo phòng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo phòng ngay</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Join Room */}
            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white mb-1">Tham Gia Phòng</h3>
              <p className="text-xs text-white/60 mb-4">
                Nhập mã phòng bạn được chia sẻ để giữ vai <strong>Quân O (Đi sau)</strong>.
              </p>
              <div className="w-full flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: CR-7821"
                  value={roomCodeInput}
                  onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-white/30 font-mono text-center text-sm uppercase tracking-wider focus:outline-none focus:border-cyan-400 transition-colors"
                  maxLength={10}
                />
                <button
                  type="submit"
                  disabled={isJoining || !roomCodeInput.trim()}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-white/10 hover:border-white/20 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang vào...</span>
                    </>
                  ) : (
                    <>
                      <span>Vào trận</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="max-w-4xl w-full mx-auto mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <Zap className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="font-semibold text-sm text-white mb-1">
              Supabase Realtime P2P
            </h4>
            <p className="text-xs text-white/50">
              Truyền nước đi mili-giây qua Broadcast Channel, nhận diện đối thủ online bằng Presence.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="font-semibold text-sm text-white mb-1">
              No-Auth Tiện Lợi
            </h4>
            <p className="text-xs text-white/50">
              Không lưu trữ thông tin cá nhân, không mật khẩu, chỉ lưu mã phòng tối giản trên DB.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <Share2 className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="font-semibold text-sm text-white mb-1">
              Chia Sẻ 1 Click
            </h4>
            <p className="text-xs text-white/50">
              Sao chép đường link gửi qua tin nhắn để bạn bè mở trực tiếp trên điện thoại hoặc máy tính.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-white/40">
        <p>EzGame Platform • Kiến trúc Feature-based • Next.js App Router + Prisma + Supabase</p>
      </footer>
    </div>
  );
}
