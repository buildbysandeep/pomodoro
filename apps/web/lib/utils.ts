import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PomodoroTemplate, TimerMode } from "@pomodoro/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDurationForTemplateMode(template: PomodoroTemplate, mode: TimerMode): number {
  switch (mode) {
    case "focus":
      return template.focusDuration * 60 * 1000;
    case "shortBreak":
      return template.shortBreakDuration * 60 * 1000;
    case "longBreak":
      return template.longBreakDuration * 60 * 1000;
  }
}
