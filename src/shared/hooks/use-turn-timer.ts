"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { sounds } from "@/shared/lib/sound-effects";

interface UseTurnTimerProps {
  currentTurn: string;
  isGameActive: boolean;
  timeLimitSeconds: number;
  warningThresholdSeconds?: number;
  onTimeOut?: () => void;
}

export function useTurnTimer({
  currentTurn,
  isGameActive,
  timeLimitSeconds,
  warningThresholdSeconds = 10,
  onTimeOut,
}: UseTurnTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const onTimeOutRef = useRef(onTimeOut);
  onTimeOutRef.current = onTimeOut;

  // Reset timer whenever the turn changes or game pauses/starts
  useEffect(() => {
    setTimeLeft(timeLimitSeconds);
  }, [currentTurn, isGameActive, timeLimitSeconds]);

  useEffect(() => {
    if (!isGameActive || timeLimitSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeOutRef.current?.();
          return 0;
        }

        const next = prev - 1;
        if (next <= warningThresholdSeconds) {
          sounds.playTimerTickSound();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, isGameActive, timeLimitSeconds, warningThresholdSeconds]);

  const resetTimer = useCallback(() => {
    setTimeLeft(timeLimitSeconds);
  }, [timeLimitSeconds]);

  const isWarning = timeLeft <= warningThresholdSeconds && timeLeft > 0;
  const isExpired = timeLeft === 0;

  return {
    timeLeft,
    isWarning,
    isExpired,
    resetTimer,
  };
}
