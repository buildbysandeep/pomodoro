"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import {
  SOCKET_EVENTS,
  SYNC_INTERVAL_MS,
  TICK_INTERVAL_MS,
  type TimerState,
  type TimerTickPayload,
} from "@pomodoro/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useTimerStore } from "@/stores/timer-store";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let globalSocket: Socket | null = null;
let globalToken: string | null = null;
let connectionCount = 0;

function playCompletionSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // ignore
  }
}

function getSocket(token: string): Socket {
  if (globalSocket?.connected && globalToken === token) {
    return globalSocket;
  }
  if (globalSocket) {
    globalSocket.disconnect();
  }
  globalSocket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    auth: { token },
  });
  globalToken = token;
  return globalSocket;
}

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const { setState, setConnected, tick } = useTimerStore();
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) return;
    connectionCount++;
    const socket = getSocket(token);

    const onConnect = () => {
      setConnected(true);
      socket.emit(SOCKET_EVENTS.AUTH, { token });
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onAuthSuccess = () => {
      socket.emit(SOCKET_EVENTS.TIMER_SYNC);
    };

    const onAuthError = () => {
      useAuthStore.getState().logout();
    };

    const onTimerState = (state: TimerState) => {
      setState(state);
    };

    const onTimerTick = (payload: TimerTickPayload) => {
      tick(payload.remainingTime);
    };

    const onTimerComplete = () => {
      playCompletionSound();
    };

    const onNotification = (payload: { title: string; body: string }) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(payload.title, { body: payload.body });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.AUTH_SUCCESS, onAuthSuccess);
    socket.on(SOCKET_EVENTS.AUTH_ERROR, onAuthError);
    socket.on(SOCKET_EVENTS.TIMER_STATE, onTimerState);
    socket.on(SOCKET_EVENTS.TIMER_TICK, onTimerTick);
    socket.on(SOCKET_EVENTS.TIMER_COMPLETE, onTimerComplete);
    socket.on(SOCKET_EVENTS.NOTIFICATION_SESSION, onNotification);

    if (socket.connected) onConnect();

    return () => {
      connectionCount--;
      if (connectionCount <= 0) {
        socket.disconnect();
        globalSocket = null;
        globalToken = null;
      } else {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off(SOCKET_EVENTS.AUTH_SUCCESS, onAuthSuccess);
        socket.off(SOCKET_EVENTS.AUTH_ERROR, onAuthError);
        socket.off(SOCKET_EVENTS.TIMER_STATE, onTimerState);
        socket.off(SOCKET_EVENTS.TIMER_TICK, onTimerTick);
        socket.off(SOCKET_EVENTS.TIMER_COMPLETE, onTimerComplete);
        socket.off(SOCKET_EVENTS.NOTIFICATION_SESSION, onNotification);
      }
    };
  }, [token, setState, setConnected, tick]);

  // Local visual countdown between server ticks, driven by store subscription
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const clear = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const start = () => {
      clear();
      intervalId = setInterval(() => {
        const { isRunning, remainingTime } = useTimerStore.getState();
        if (isRunning && remainingTime > 0) {
          tick(Math.max(0, remainingTime - TICK_INTERVAL_MS));
        }
      }, TICK_INTERVAL_MS);
    };

    const unsubscribe = useTimerStore.subscribe((state) => {
      if (state.isRunning && state.remainingTime > 0) {
        if (!intervalId) start();
      } else {
        clear();
      }
    });

    const current = useTimerStore.getState();
    if (current.isRunning && current.remainingTime > 0) start();

    return () => {
      clear();
      unsubscribe();
    };
  }, [tick]);

  // Periodic authoritative re-sync
  useEffect(() => {
    syncRef.current = setInterval(() => {
      if (globalSocket?.connected) {
        globalSocket.emit(SOCKET_EVENTS.TIMER_SYNC);
      }
    }, SYNC_INTERVAL_MS);
    return () => {
      if (syncRef.current) clearInterval(syncRef.current);
    };
  }, []);

  const emit = useCallback(<T>(event: string, payload?: T) => {
    if (globalSocket?.connected) {
      globalSocket.emit(event, payload);
    }
  }, []);

  return { socket: globalSocket, emit, connected: useTimerStore((s) => s.connected) };
}
