import type { PomodoroTemplate, TimerMode, TimerState } from "@pomodoro/shared";
import { BUILT_IN_TEMPLATES } from "@pomodoro/shared";
import { recordSession } from "../services/session";

const timerStates = new Map<string, TimerState>();

export function getTimerState(userId: string): TimerState | undefined {
  return timerStates.get(userId);
}

export function getOrCreateTimerState(userId: string, template: PomodoroTemplate): TimerState {
  let state = timerStates.get(userId);
  if (!state) {
    state = buildInitialState(userId, template);
    timerStates.set(userId, state);
  }
  return state;
}

export function setTimerState(userId: string, state: TimerState): void {
  state.lastUpdated = Date.now();
  timerStates.set(userId, state);
}

export function deleteTimerState(userId: string): void {
  timerStates.delete(userId);
}

export function getAllRunningStates(): Array<{ userId: string; state: TimerState }> {
  const running: Array<{ userId: string; state: TimerState }> = [];
  for (const [userId, state] of timerStates.entries()) {
    if (state.isRunning) running.push({ userId, state });
  }
  return running;
}

export function buildInitialState(userId: string, template: PomodoroTemplate): TimerState {
  return {
    userId,
    mode: "focus",
    startTime: null,
    remainingTime: template.focusDuration * 60 * 1000,
    isRunning: false,
    cycleCount: 0,
    currentSessionType: "Focus",
    lastUpdated: Date.now(),
    template,
  };
}

export function getDurationForMode(template: PomodoroTemplate, mode: TimerMode): number {
  switch (mode) {
    case "focus":
      return template.focusDuration * 60 * 1000;
    case "shortBreak":
      return template.shortBreakDuration * 60 * 1000;
    case "longBreak":
      return template.longBreakDuration * 60 * 1000;
  }
}

export function getNextMode(state: TimerState): TimerMode {
  const { mode, cycleCount, template } = state;
  if (mode === "focus") {
    const nextCycle = cycleCount + 1;
    if (nextCycle % template.cyclesBeforeLongBreak === 0) return "longBreak";
    return "shortBreak";
  }
  return "focus";
}

export function advanceMode(state: TimerState): TimerState {
  const nextMode = getNextMode(state);
  let cycleCount = state.cycleCount;
  if (state.mode === "focus" && nextMode !== "focus") {
    cycleCount += 1;
  }

  return {
    ...state,
    mode: nextMode,
    startTime: null,
    remainingTime: getDurationForMode(state.template, nextMode),
    isRunning: false,
    cycleCount,
    currentSessionType: labelForMode(nextMode),
    lastUpdated: Date.now(),
    nextMode: undefined,
  };
}

export function labelForMode(mode: TimerMode): string {
  switch (mode) {
    case "focus":
      return "Focus";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
  }
}

export async function persistCompletedSession(
  userId: string,
  state: TimerState,
  deviceInfo?: string
): Promise<void> {
  const duration = getDurationForMode(state.template, state.mode);
  const elapsed = duration - Math.max(0, state.remainingTime);
  await recordSession(userId, {
    templateId: state.template.id,
    mode: state.mode,
    duration,
    elapsed,
    completed: true,
    deviceInfo,
  });
}

export function resolveTemplate(templateId?: string): PomodoroTemplate {
  const t = BUILT_IN_TEMPLATES.find((t) => t.id === templateId) || BUILT_IN_TEMPLATES[0];
  return { ...t };
}
