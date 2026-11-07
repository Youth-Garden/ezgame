import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { PortalRenderer } from "@/shared/components/portal";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-game",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3280ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "EzGame - Casual Game Realtime Platform (No-Auth)",
  description:
    "Join and play instantly, no login required. Play Caro 15x15 realtime P2P smoothly with friends via one invite link!",
  keywords: ["caro", "gomoku", "casual game", "realtime", "nextjs", "supabase", "pwa"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EzGame",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
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
      className={`${jakartaSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary/20">
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
        <PortalRenderer />
      </body>
    </html>
  );
}
