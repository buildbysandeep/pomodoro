"use client";

import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timer-store";
import { useSocket } from "@/hooks/use-socket";
import { SOCKET_EVENTS } from "@pomodoro/shared";

export function TimerControls() {
  const { isRunning } = useTimerStore();
  const { emit } = useSocket();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {isRunning ? (
        <Button size="lg" className="h-14 w-32 gap-2 rounded-full text-base" onClick={() => emit(SOCKET_EVENTS.TIMER_PAUSE)}>
          <Pause className="h-5 w-5" />
          Pause
        </Button>
      ) : (
        <Button size="lg" className="h-14 w-32 gap-2 rounded-full text-base" onClick={() => emit(SOCKET_EVENTS.TIMER_RESUME)}>
          <Play className="h-5 w-5" />
          Start
        </Button>
      )}

      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => emit(SOCKET_EVENTS.TIMER_RESET)}>
        <RotateCcw className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => emit(SOCKET_EVENTS.TIMER_SKIP)}>
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
