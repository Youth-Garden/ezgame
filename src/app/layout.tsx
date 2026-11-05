import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PortalRenderer } from "@/shared/components/portal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EzGame - Nền tảng Casual Game Thời Gian Thực (No-Auth)",
  description:
    "Vào là chơi ngay, không cần đăng nhập. Chơi cờ Caro 15x15 thời gian thực P2P siêu mượt cùng bạn bè chỉ qua 1 link mời!",
  keywords: ["caro", "gomoku", "casual game", "realtime", "nextjs", "supabase"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 bg-grid-pattern selection:bg-cyan-500 selection:text-black">
        {children}
        <PortalRenderer />
      </body>
    </html>
  );
}
