import type { PomodoroTemplate, TimerMode } from "./types";

export const MODES: Record<string, { label: string; key: TimerMode }> = {
  focus: { label: "Focus", key: "focus" },
  shortBreak: { label: "Short Break", key: "shortBreak" },
  longBreak: { label: "Long Break", key: "longBreak" },
};

export const BUILT_IN_TEMPLATES: PomodoroTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    isBuiltIn: true,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    color: "#ef4444",
  },
  {
    id: "deep-work",
    name: "Deep Work",
    isBuiltIn: true,
    focusDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    cyclesBeforeLongBreak: 4,
    color: "#3b82f6",
  },
  {
    id: "flow-state",
    name: "Flow State",
    isBuiltIn: true,
    focusDuration: 90,
    shortBreakDuration: 20,
    longBreakDuration: 30,
    cyclesBeforeLongBreak: 3,
    color: "#8b5cf6",
  },
];

export const SOCKET_EVENTS = {
  // Client -> Server
  AUTH: "auth",
  TIMER_START: "timer:start",
  TIMER_PAUSE: "timer:pause",
  TIMER_RESUME: "timer:resume",
  TIMER_RESET: "timer:reset",
  TIMER_SKIP: "timer:skip",
  TIMER_TEMPLATE: "timer:template",
  TIMER_SYNC: "timer:sync",
  FOCUS_ENTER: "focus:enter",
  FOCUS_LEAVE: "focus:leave",

  // Server -> Client
  AUTH_SUCCESS: "auth:success",
  AUTH_ERROR: "auth:error",
  TIMER_STATE: "timer:state",
  TIMER_TICK: "timer:tick",
  TIMER_COMPLETE: "timer:complete",
  NOTIFICATION_SESSION: "notification:session",
  ERROR: "error",
} as const;

export const USER_ROOM_PREFIX = "user:";

export const TICK_INTERVAL_MS = 1000;
export const SYNC_INTERVAL_MS = 10000;
