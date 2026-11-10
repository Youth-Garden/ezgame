import type { Metadata, Viewport } from "next";
import { Baloo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { Providers } from "@/shared/components/providers";
import { THEME_COOKIE_KEY, type ThemeMode } from "@/shared/components/providers/updater/hooks/use-sync-theme";

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
  const themeCookie = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme: ThemeMode = themeCookie === "light" ? "light" : "dark";
  const isDark = initialTheme === "dark";

  return (
    <html
      lang={locale}
      className={`${baloo2.variable} ${jetbrainsMono.variable} h-full antialiased ${isDark ? "dark" : ""}`}
      style={{
        colorScheme: isDark ? "dark" : "light",
        backgroundColor: isDark ? "#09090b" : "#edf1f7",
      }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE_KEY}=([^;]*)/);var t=m?decodeURIComponent(m[1]):localStorage.getItem("${THEME_COOKIE_KEY}");var d=document.documentElement;if(t==="light"){d.classList.remove("dark");d.style.colorScheme="light";d.style.backgroundColor="#edf1f7";}else{d.classList.add("dark");d.style.colorScheme="dark";d.style.backgroundColor="#09090b";}}catch(e){}})();`,
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
