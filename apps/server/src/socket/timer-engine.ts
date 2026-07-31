import type { Server as SocketIOServer } from "socket.io";
import {
  TICK_INTERVAL_MS,
  USER_ROOM_PREFIX,
  SOCKET_EVENTS,
  type TimerState,
} from "@pomodoro/shared";
import {
  getAllRunningStates,
  setTimerState,
  advanceMode,
  getDurationForMode,
  persistCompletedSession,
} from "./timer-state";

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startTimerEngine(io: SocketIOServer): void {
  if (intervalId) return;

  intervalId = setInterval(() => {
    const now = Date.now();
    for (const { userId, state } of getAllRunningStates()) {
      if (!state.isRunning || state.startTime === null) continue;

      const elapsed = now - state.startTime;
      const remaining = Math.max(0, state.remainingTime - elapsed);
      const updated: TimerState = { ...state, remainingTime: remaining, lastUpdated: now };

      setTimerState(userId, updated);

      const room = `${USER_ROOM_PREFIX}${userId}`;
      io.to(room).emit(SOCKET_EVENTS.TIMER_TICK, {
        remainingTime: remaining,
        elapsed,
      });

      if (remaining <= 0) {
        handleCompletion(io, userId, updated);
      }
    }
  }, TICK_INTERVAL_MS);
}

export function stopTimerEngine(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

async function handleCompletion(io: SocketIOServer, userId: string, state: TimerState): Promise<void> {
  const completedState = { ...state, isRunning: false, startTime: null };
  setTimerState(userId, completedState);

  await persistCompletedSession(userId, completedState).catch((err) => {
    console.error("Failed to persist session:", err);
  });

  const room = `${USER_ROOM_PREFIX}${userId}`;
  const next = advanceMode(completedState);
  const duration = getDurationForMode(next.template, next.mode);
  const nextState = { ...next, remainingTime: duration, nextMode: next.mode };

  io.to(room).emit(SOCKET_EVENTS.TIMER_COMPLETE, {
    mode: completedState.mode,
    nextMode: next.mode,
  });

  io.to(room).emit(SOCKET_EVENTS.NOTIFICATION_SESSION, {
    title: `${labelForMode(completedState.mode)} complete`,
    body: `Next up: ${labelForMode(next.mode)}`,
  });

  setTimerState(userId, nextState);
  io.to(room).emit(SOCKET_EVENTS.TIMER_STATE, nextState);
}

function labelForMode(mode: TimerState["mode"]): string {
  switch (mode) {
    case "focus":
      return "Focus";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
  }
}
