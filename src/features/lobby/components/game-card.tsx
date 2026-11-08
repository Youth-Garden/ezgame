"use client";

import Image from "next/image";
import { useRipple } from "@/shared/hooks/use-ripple";
import { Card } from "@/shared/components/ui/card";
import type { GameMetadata } from "../types";

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const { createRipple, RippleContainer } = useRipple<HTMLDivElement>();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    createRipple(event);
    onSelect(game);
  };

  return (
    <article className="flex flex-col select-none w-full">
      {/* 3:4 Vertical Aspect Card Container using Card component */}
      <Card
        variant="solid"
        className="group relative flex aspect-[3/4] flex-col items-center justify-end overflow-hidden pb-4 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 active:scale-[0.99]"
        onClick={handleClick}
      >
        <RippleContainer />

        {/* Artwork occupying upper portion */}
        {game.iconSrc ? (
          <div className="pointer-events-none absolute inset-x-3.5 top-3.5 bottom-20 overflow-hidden rounded-xl bg-neutral-950 dark:bg-black">
            <Image
              src={game.iconSrc}
              alt={game.title}
              fill
              priority={game.id === "caro"}
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        ) : null}

        {/* Bottom Ambient Gradient for Legibility */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />

        {/* Card Title (Bold Uppercase) & Subtitle */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pointer-events-none">
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground dark:text-white drop-shadow-sm transition-colors">
            {game.title}
          </h3>
          <span className="mt-1 text-[11px] font-semibold tracking-wider text-text-secondary font-bold uppercase">
            {game.badge}
          </span>
        </div>
      </Card>
    </article>
  );
}
