import { Server as SocketIOServer, type Socket } from "socket.io";
import {
  SOCKET_EVENTS,
  USER_ROOM_PREFIX,
  TICK_INTERVAL_MS,
  SYNC_INTERVAL_MS,
  type SocketAuthPayload,
} from "@pomodoro/shared";
import { verifyToken } from "../utils/jwt";
import { findTemplateById } from "../services/template";
import {
  getTimerState,
  getOrCreateTimerState,
  setTimerState,
  buildInitialState,
  getDurationForMode,
  advanceMode,
  labelForMode,
  resolveTemplate,
} from "./timer-state";
import { startTimerEngine, stopTimerEngine } from "./timer-engine";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  deviceInfo?: string;
}

const socketUsers = new Map<string, Set<AuthenticatedSocket>>();

export function setupSocketIO(io: SocketIOServer): void {
  startTimerEngine(io);

  io.on("connection", (socket: AuthenticatedSocket) => {
    let authTimeout: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (!socket.userId) socket.disconnect(true);
    }, 10000);

    socket.on(SOCKET_EVENTS.AUTH, async (payload: SocketAuthPayload) => {
      try {
        const decoded = verifyToken(payload.token);
        socket.userId = decoded.userId;
        socket.deviceInfo = (socket.handshake.headers["user-agent"] as string) || "unknown";

        const room = `${USER_ROOM_PREFIX}${decoded.userId}`;
        await socket.join(room);

        if (!socketUsers.has(decoded.userId)) {
          socketUsers.set(decoded.userId, new Set());
        }
        socketUsers.get(decoded.userId)!.add(socket);

        if (authTimeout) {
          clearTimeout(authTimeout);
          authTimeout = null;
        }

        socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, { userId: decoded.userId });

        const state = getOrCreateTimerState(decoded.userId, resolveTemplate());
        socket.emit(SOCKET_EVENTS.TIMER_STATE, state);

        setupTimerHandlers(io, socket);
      } catch (err) {
        socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: "Invalid token" });
        socket.disconnect(true);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        socketUsers.get(socket.userId)?.delete(socket);
      }
      if (authTimeout) clearTimeout(authTimeout);
    });
  });
}

function setupTimerHandlers(io: SocketIOServer, socket: AuthenticatedSocket): void {
  const userId = socket.userId!;
  const room = `${USER_ROOM_PREFIX}${userId}`;

  const emitState = (state: ReturnType<typeof getTimerState>) => {
    if (!state) return;
    io.to(room).emit(SOCKET_EVENTS.TIMER_STATE, state);
  };

  socket.on(SOCKET_EVENTS.TIMER_START, async (payload: { templateId?: string }) => {
    const template = payload.templateId
      ? (await findTemplateById(userId, payload.templateId)) ?? resolveTemplate()
      : resolveTemplate();
    const state = buildInitialState(userId, template);
    state.isRunning = true;
    state.startTime = Date.now();
    setTimerState(userId, state);
    emitState(state);
  });

  socket.on(SOCKET_EVENTS.TIMER_PAUSE, () => {
    const state = getTimerState(userId);
    if (!state || !state.isRunning || state.startTime === null) return;

    const elapsed = Date.now() - state.startTime;
    const remaining = Math.max(0, state.remainingTime - elapsed);
    const updated = { ...state, isRunning: false, startTime: null, remainingTime: remaining };
    setTimerState(userId, updated);
    emitState(updated);
  });

  socket.on(SOCKET_EVENTS.TIMER_RESUME, () => {
    const state = getTimerState(userId);
    if (!state || state.isRunning) return;

    const updated = { ...state, isRunning: true, startTime: Date.now() };
    setTimerState(userId, updated);
    emitState(updated);
  });

  socket.on(SOCKET_EVENTS.TIMER_RESET, () => {
    const state = getTimerState(userId);
    if (!state) return;

    const duration = getDurationForMode(state.template, state.mode);
    const updated = { ...state, remainingTime: duration, startTime: null, isRunning: false };
    setTimerState(userId, updated);
    emitState(updated);
  });

  socket.on(SOCKET_EVENTS.TIMER_SKIP, () => {
    const state = getTimerState(userId);
    if (!state) return;

    const next = advanceMode(state);
    const duration = getDurationForMode(next.template, next.mode);
    const updated = { ...next, remainingTime: duration, nextMode: next.mode };
    setTimerState(userId, updated);
    emitState(updated);
  });

  socket.on(SOCKET_EVENTS.TIMER_TEMPLATE, async (payload: { templateId: string }) => {
    const template = (await findTemplateById(userId, payload.templateId)) ?? resolveTemplate();
    const state = buildInitialState(userId, template);
    setTimerState(userId, state);
    emitState(state);
  });

  socket.on(SOCKET_EVENTS.TIMER_SYNC, () => {
    const state = getTimerState(userId);
    if (state) socket.emit(SOCKET_EVENTS.TIMER_STATE, state);
  });

  socket.on(SOCKET_EVENTS.FOCUS_ENTER, () => {
    io.to(room).emit("focus:status", { userId, focused: true });
  });

  socket.on(SOCKET_EVENTS.FOCUS_LEAVE, () => {
    io.to(room).emit("focus:status", { userId, focused: false });
  });
}

export function getSocketStats(): { users: number; sockets: number } {
  let sockets = 0;
  for (const set of socketUsers.values()) sockets += set.size;
  return { users: socketUsers.size, sockets };
}

export { stopTimerEngine };
