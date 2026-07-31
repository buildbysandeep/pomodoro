"use client";

import { useTimerStore } from "@/stores/timer-store";
import { ProgressRing } from "./progress-ring";
import { formatTime, getDurationForTemplateMode } from "@/lib/utils";
import { motion } from "framer-motion";

export function TimerDisplay() {
  const { remainingTime, currentSessionType, activeTemplate, mode, isRunning } = useTimerStore();
  const totalDuration = getDurationForTemplateMode(activeTemplate, mode);
  const progress = totalDuration > 0 ? remainingTime / totalDuration : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProgressRing
          progress={progress}
          size={320}
          stroke={14}
          color={activeTemplate.color}
          className="mx-auto"
        >
          <div className="flex flex-col items-center">
            <span className="text-6xl font-bold tracking-tighter tabular-nums sm:text-7xl">
              {formatTime(remainingTime)}
            </span>
            <span className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {currentSessionType}
            </span>
            {isRunning && (
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
        </ProgressRing>
      </motion.div>
    </div>
  );
}
