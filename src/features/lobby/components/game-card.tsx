"use client";

import Image from "next/image";
import { Icons } from "@/shared/icons";
import { useRipple } from "@/shared/hooks/use-ripple";
import type { GameMetadata } from "../types";

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
  playText?: string;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const { createRipple, RippleContainer } = useRipple<HTMLDivElement>();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    createRipple(event);
    onSelect(game);
  };

  return (
    <div
      className="group relative flex-1 min-w-[260px] max-w-sm rounded-2xl overflow-hidden bg-white/80 dark:bg-neutral-900/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none"
      onClick={handleClick}
    >
      <RippleContainer />

      {/* Visual Game Artwork Cover with subtle 16:9 ratio */}
      <div className="relative w-full aspect-16/9 overflow-hidden bg-neutral-950">
        {game.iconSrc ? (
          <Image
            src={game.iconSrc}
            alt={game.title}
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          />
        ) : null}

        {/* Ambient Dark Gradient for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Top Badges (Subtle Frosted Pill) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-white/90 uppercase px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
            {game.tag}
          </span>
          <span className="text-[10px] font-medium text-white/90 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
            {game.badge}
          </span>
        </div>

        {/* Floating Quick Action Arrow on Hover */}
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Icons name="arrow-right" size={14} />
        </div>
      </div>

      {/* Clean Bottom Label Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
            <Icons name="users" size={12} />
            <span>{game.players}</span>
          </span>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-relaxed">
          {game.description}
        </p>
      </div>
    </div>
  );
}
