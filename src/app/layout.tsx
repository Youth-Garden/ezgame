import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PortalRenderer } from "@/shared/components/portal";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EzGame - Casual Game Realtime Platform (No-Auth)",
  description:
    "Join and play instantly, no login required. Play Caro 15x15 realtime P2P smoothly with friends via one invite link!",
  keywords: ["caro", "gomoku", "casual game", "realtime", "nextjs", "supabase"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
        <PortalRenderer />
      </body>
    </html>
  );
}
