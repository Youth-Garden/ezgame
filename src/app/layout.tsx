import type { Metadata, Viewport } from "next";
import { Baloo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { Providers } from "@/shared/components/providers";
import { type ThemeMode } from "@/shared/components/providers/updater/hooks/use-sync-theme";

const THEME_COOKIE_NAME = "theme";

const baloo2 = Baloo_2({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
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
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialTheme: ThemeMode = themeCookie === "light" ? "light" : "dark";
  const isDark = initialTheme === "dark";

  return (
    <html
      lang={locale}
      className={`${baloo2.variable} ${jetbrainsMono.variable} h-full antialiased ${isDark ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;var d=document.documentElement;if(t==="dark"){d.classList.add("dark");}else if(t==="light"){d.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary/20"
        suppressHydrationWarning
      >
        <Providers messages={messages} locale={locale} initialTheme={initialTheme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
