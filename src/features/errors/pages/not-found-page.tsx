"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { RouteEnum } from "@/shared/constants/routes";
import { Button } from "@/shared/components/ui/button";
import { Icons } from "@/shared/icons";

export function NotFoundPage() {
  const t = useTranslations("error");

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-6 select-none relative overflow-x-hidden font-game">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 max-w-md w-full flex flex-col items-center text-center gap-6">
        {/* Number 404 */}
        <span className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/70 to-foreground/20 drop-shadow-2xl select-none">
          404
        </span>

        {/* Text info */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
            {t("notFoundTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans max-w-sm mx-auto">
            {t("notFoundDesc")}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={RouteEnum.LOBBY}>
            <Button variant="default" size="lg" className="font-bold gap-2">
              <Icons name="home" size={16} />
              <span>{t("backToLobby")}</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
