"use client";

import Image from "next/image";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { GameMetadata } from "../types";

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
  playText: string;
}

export function GameCard({ game, onSelect, playText }: GameCardProps) {
  return (
    <div
      className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900/80 dark:hover:bg-neutral-900 transition-all cursor-pointer shadow-xs"
      onClick={() => onSelect(game)}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          {game.iconSrc ? (
            <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-xs">
              <Image
                src={game.iconSrc}
                alt={game.title}
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              {game.tag}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              {game.badge}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 transition-colors mb-2">
          {game.title}
        </h3>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {game.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <Users className="w-3.5 h-3.5" />
          <span>{game.players}</span>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(game);
          }}
          className="flex items-center gap-1.5 text-xs"
        >
          <span>{playText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
