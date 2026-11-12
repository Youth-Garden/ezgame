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
  const [timeFraction, setTimeFraction] = useState(1);
  const onTimeOutRef = useRef(onTimeOut);
  onTimeOutRef.current = onTimeOut;
  const lastTickSoundSecRef = useRef<number>(-1);

  // Reset timer whenever the turn changes or game pauses/starts
  useEffect(() => {
    setTimeLeft(timeLimitSeconds);
    setTimeFraction(1);
    lastTickSoundSecRef.current = -1;
  }, [currentTurn, isGameActive, timeLimitSeconds]);

  useEffect(() => {
    if (!isGameActive || timeLimitSeconds <= 0) return;

    const startTime = performance.now();
    const durationMs = timeLimitSeconds * 1000;
    let animId: number;

    const tick = (now: number) => {
      const elapsedMs = now - startTime;
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      const fraction = remainingMs / durationMs;
      const remainingSec = Math.ceil(remainingMs / 1000);

      setTimeFraction(fraction);
      setTimeLeft(remainingSec);

      // Play tick sound once per second when entering warning zone
      if (remainingSec <= warningThresholdSeconds && remainingSec > 0 && remainingSec !== lastTickSoundSecRef.current) {
        lastTickSoundSecRef.current = remainingSec;
        sounds.playTimerTickSound();
      }

      if (remainingMs <= 0) {
        setTimeFraction(0);
        setTimeLeft(0);
        onTimeOutRef.current?.();
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [currentTurn, isGameActive, timeLimitSeconds, warningThresholdSeconds]);

  const resetTimer = useCallback(() => {
    setTimeLeft(timeLimitSeconds);
    setTimeFraction(1);
    lastTickSoundSecRef.current = -1;
  }, [timeLimitSeconds]);

  const isWarning = timeLeft <= warningThresholdSeconds && timeLeft > 0;
  const isExpired = timeLeft === 0;

  return {
    timeLeft,
    timeFraction,
    isWarning,
    isExpired,
    resetTimer,
  };
}
