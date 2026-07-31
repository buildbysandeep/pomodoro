export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface PomodoroTemplate {
  id: string;
  userId?: string;
  name: string;
  isBuiltIn: boolean;
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  cyclesBeforeLongBreak: number;
  color: string;
}

export interface TimerState {
  userId: string;
  mode: TimerMode;
  startTime: number | null;
  remainingTime: number; // ms
  isRunning: boolean;
  cycleCount: number;
  currentSessionType: string;
  lastUpdated: number;
  template: PomodoroTemplate;
  nextMode?: TimerMode;
}

export interface TimerTickPayload {
  remainingTime: number;
  elapsed: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface UserPreferences {
  userId: string;
  theme: "light" | "dark" | "system";
  sound: string;
  volume: number;
  notifications: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  defaultTemplateId: string;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  templateId: string;
  mode: TimerMode;
  duration: number; // planned ms
  elapsed: number; // actual ms
  completed: boolean;
  completedAt?: string;
  interruptedAt?: string;
  deviceInfo?: string;
  notes?: string;
  createdAt: string;
}

export interface DailyAnalytics {
  userId: string;
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  sessionsCompleted: number;
  sessionsStarted: number;
  completionRate: number;
  streakDay: boolean;
}

export interface SocketAuthPayload {
  token: string;
}

export interface TimerClientPayload {
  templateId?: string;
}
