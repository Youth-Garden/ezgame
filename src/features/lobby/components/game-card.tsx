"use client";

import { Users, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { GameMetadata } from "../types";

interface GameCardProps {
  game: GameMetadata;
  onSelect: (game: GameMetadata) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const isAvailable = game.isAvailable;

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-xl bg-card border transition-colors ${
        isAvailable
          ? "border-border hover:border-primary/50 cursor-pointer"
          : "border-border/40 opacity-60 bg-card/40 cursor-not-allowed"
      }`}
      onClick={() => {
        if (isAvailable) {
          onSelect(game);
        }
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {game.tag}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              isAvailable
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {game.badge}
          </span>
        </div>

        <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors mb-1.5">
          {game.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {game.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{game.players}</span>
        </div>

        {isAvailable ? (
          <Button
            variant="default"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(game);
            }}
            className="flex items-center gap-1.5 text-xs"
          >
            <span>Play</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled
            className="flex items-center gap-1.5 text-xs"
          >
            <Lock className="w-3 h-3" />
            <span>Soon</span>
          </Button>
        )}
      </div>
    </div>
  );
}
