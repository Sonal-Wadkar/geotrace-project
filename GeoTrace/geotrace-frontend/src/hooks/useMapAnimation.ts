import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMapAnimationOptions {
  totalHops: number;
  autoStart?: boolean;
  stepDelay?: number;
}

export function useMapAnimation({
  totalHops,
  autoStart = true,
  stepDelay = 600,
}: UseMapAnimationOptions) {
  const [visibleHops, setVisibleHops] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const animateStep = useCallback(
    (current: number) => {
      if (current >= totalHops) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }
      setVisibleHops(current + 1);
      timerRef.current = setTimeout(() => animateStep(current + 1), stepDelay);
    },
    [totalHops, stepDelay]
  );

  const play = useCallback(() => {
    clearTimer();
    setIsPlaying(true);
    setIsPaused(false);
    setVisibleHops(0);
    if (prefersReducedMotion.current) {
      setVisibleHops(totalHops);
      setIsPlaying(false);
      return;
    }
    animateStep(0);
  }, [animateStep, clearTimer, totalHops]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
    setIsPlaying(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (visibleHops >= totalHops) return;
    setIsPlaying(true);
    setIsPaused(false);
    if (prefersReducedMotion.current) {
      setVisibleHops(totalHops);
      setIsPlaying(false);
      return;
    }
    animateStep(visibleHops);
  }, [animateStep, totalHops, visibleHops]);

  const replay = useCallback(() => {
    play();
  }, [play]);

  useEffect(() => {
    if (autoStart && totalHops > 0) {
      play();
    }
    return clearTimer;
  }, [autoStart, totalHops]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => clearTimer, [clearTimer]);

  return {
    visibleHops,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    replay,
    showAll: () => {
      clearTimer();
      setVisibleHops(totalHops);
      setIsPlaying(false);
    },
  };
}
