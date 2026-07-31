"use client";

import { useCallback } from "react";

export function useSound() {
  const play = useCallback((volume = 0.7) => {
    if (typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // ignore
    }
  }, []);

  return { play };
}
