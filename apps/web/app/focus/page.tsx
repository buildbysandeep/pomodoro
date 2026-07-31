"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, RotateCcw, SkipForward, Minimize, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useSocket } from "@/hooks/use-socket";
import { useTimerStore } from "@/stores/timer-store";
import { SOCKET_EVENTS } from "@pomodoro/shared";
import { formatTime, getDurationForTemplateMode } from "@/lib/utils";
import { ProgressRing } from "@/components/timer/progress-ring";

export default function FocusPage() {
  const router = useRouter();
  const { emit } = useSocket();
  const { remainingTime, activeTemplate, mode, isRunning, currentSessionType, connected } = useTimerStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [muted, setMuted] = useState(false);

  const totalDuration = getDurationForTemplateMode(activeTemplate, mode);
  const progress = totalDuration > 0 ? remainingTime / totalDuration : 0;

  // Enter fullscreen on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const request = el.requestFullscreen || (el as any).webkitRequestFullscreen;
    if (request) {
      request.call(el).catch(() => {});
    }

    emit(SOCKET_EVENTS.FOCUS_ENTER);

    return () => {
      emit(SOCKET_EVENTS.FOCUS_LEAVE);
    };
  }, [emit]);

  // Wake Lock
  useEffect(() => {
    async function lock() {
      try {
        if ("wakeLock" in navigator && isRunning) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // ignore
      }
    }
    lock();
    return () => {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [isRunning]);

  // Auto-hide controls on idle
  const resetIdle = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 3000);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("click", resetIdle);
    window.addEventListener("keydown", resetIdle);
    resetIdle();
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("click", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        emit(isRunning ? SOCKET_EVENTS.TIMER_PAUSE : SOCKET_EVENTS.TIMER_RESUME);
      }
      if (e.code === "KeyR") emit(SOCKET_EVENTS.TIMER_RESET);
      if (e.code === "KeyS") emit(SOCKET_EVENTS.TIMER_SKIP);
      if (e.code === "Escape") {
        document.exitFullscreen?.().catch(() => {});
        router.push("/");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [emit, isRunning, router]);

  async function exitFocus() {
    await document.exitFullscreen?.().catch(() => {});
    router.push("/");
  }

  return (
    <AuthGuard>
      <div
        ref={containerRef}
        className={`focus-ui-container flex min-h-screen flex-col items-center justify-center bg-background text-foreground ${idle ? "focus-idle" : ""}`}
        onMouseMove={resetIdle}
        onClick={resetIdle}
      >
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={connected ? "h-2 w-2 rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-amber-500"} />
            {connected ? "Live sync" : "Reconnecting"}
          </div>

          <ProgressRing progress={progress} size={420} stroke={16} color={activeTemplate.color}>
            <div className="flex flex-col items-center">
              <span className="text-8xl font-bold tracking-tighter tabular-nums sm:text-9xl">
                {formatTime(remainingTime)}
              </span>
              <span className="mt-3 text-lg font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {currentSessionType}
              </span>
            </div>
          </ProgressRing>

          <div className="focus-ui flex items-center gap-4">
            {isRunning ? (
              <Button size="lg" className="h-16 w-40 gap-2 rounded-full text-lg" onClick={() => emit(SOCKET_EVENTS.TIMER_PAUSE)}>
                <Pause className="h-6 w-6" />
                Pause
              </Button>
            ) : (
              <Button size="lg" className="h-16 w-40 gap-2 rounded-full text-lg" onClick={() => emit(SOCKET_EVENTS.TIMER_RESUME)}>
                <Play className="h-6 w-6" />
                Start
              </Button>
            )}
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={() => emit(SOCKET_EVENTS.TIMER_RESET)}>
              <RotateCcw className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={() => emit(SOCKET_EVENTS.TIMER_SKIP)}>
              <SkipForward className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={() => setMuted((m) => !m)}>
              {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>

          <div className="focus-ui absolute right-6 top-6">
            <Button variant="ghost" size="icon" onClick={exitFocus}>
              <Minimize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
