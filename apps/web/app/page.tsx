"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/layout/auth-guard";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { TemplateSelector } from "@/components/timer/template-selector";
import { useSocket } from "@/hooks/use-socket";
import { useTimerStore } from "@/stores/timer-store";
import { SOCKET_EVENTS } from "@pomodoro/shared";
import { motion } from "framer-motion";

export default function HomePage() {
  const { emit } = useSocket();
  const connected = useTimerStore((s) => s.connected);
  const isRunning = useTimerStore((s) => s.isRunning);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        emit(isRunning ? SOCKET_EVENTS.TIMER_PAUSE : SOCKET_EVENTS.TIMER_RESUME);
      }
      if (e.code === "KeyR") emit(SOCKET_EVENTS.TIMER_RESET);
      if (e.code === "KeyS") emit(SOCKET_EVENTS.TIMER_SKIP);
      if (e.code === "KeyF") window.location.href = "/focus";
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [emit, isRunning]);

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-12 sm:py-20">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className={connected ? "h-2 w-2 rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-amber-500"} />
          {connected ? "Synced in real-time" : "Reconnecting..."}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-10"
        >
          <TimerDisplay />
          <TimerControls />
          <div className="flex justify-center">
            <TemplateSelector />
          </div>
        </motion.div>

        <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Focus</p>
            <p className="text-2xl font-semibold">{useTimerStore((s) => s.activeTemplate.focusDuration)}m</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Short Break</p>
            <p className="text-2xl font-semibold">{useTimerStore((s) => s.activeTemplate.shortBreakDuration)}m</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Long Break</p>
            <p className="text-2xl font-semibold">{useTimerStore((s) => s.activeTemplate.longBreakDuration)}m</p>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Shortcuts: Space {isRunning ? "pause" : "start"} • R reset • S skip • F focus
        </p>
      </main>
    </AuthGuard>
  );
}
