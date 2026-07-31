import { create } from "zustand";
import type { PomodoroTemplate, TimerMode, TimerState } from "@pomodoro/shared";
import { BUILT_IN_TEMPLATES } from "@pomodoro/shared";

interface TimerStore {
  state: TimerState | null;
  connected: boolean;
  isRunning: boolean;
  mode: TimerMode;
  remainingTime: number;
  currentSessionType: string;
  cycleCount: number;
  activeTemplate: PomodoroTemplate;
  setState: (state: TimerState) => void;
  setConnected: (connected: boolean) => void;
  tick: (remainingTime: number) => void;
}

const defaultTemplate = BUILT_IN_TEMPLATES[0];

export const useTimerStore = create<TimerStore>((set) => ({
  state: null,
  connected: false,
  isRunning: false,
  mode: "focus",
  remainingTime: defaultTemplate.focusDuration * 60 * 1000,
  currentSessionType: "Focus",
  cycleCount: 0,
  activeTemplate: defaultTemplate,
  setState: (state) =>
    set({
      state,
      isRunning: state.isRunning,
      mode: state.mode,
      remainingTime: state.remainingTime,
      currentSessionType: state.currentSessionType,
      cycleCount: state.cycleCount,
      activeTemplate: state.template,
    }),
  setConnected: (connected) => set({ connected }),
  tick: (remainingTime) => set({ remainingTime }),
}));
