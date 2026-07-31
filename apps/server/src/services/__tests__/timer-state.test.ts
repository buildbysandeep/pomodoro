import { describe, it, expect } from "vitest";
import {
  buildInitialState,
  getDurationForMode,
  getNextMode,
  advanceMode,
  resolveTemplate,
} from "../../socket/timer-state";
import type { PomodoroTemplate } from "@pomodoro/shared";

const testTemplate: PomodoroTemplate = {
  id: "classic",
  name: "Classic",
  isBuiltIn: true,
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  color: "#ef4444",
};

describe("timer-state", () => {
  it("builds initial state with focus duration", () => {
    const state = buildInitialState("user-1", testTemplate);
    expect(state.mode).toBe("focus");
    expect(state.remainingTime).toBe(25 * 60 * 1000);
    expect(state.isRunning).toBe(false);
  });

  it("calculates duration for each mode", () => {
    expect(getDurationForMode(testTemplate, "focus")).toBe(25 * 60 * 1000);
    expect(getDurationForMode(testTemplate, "shortBreak")).toBe(5 * 60 * 1000);
    expect(getDurationForMode(testTemplate, "longBreak")).toBe(15 * 60 * 1000);
  });

  it("advances from focus to short break before long break cycle", () => {
    const state = buildInitialState("user-1", testTemplate);
    const next = advanceMode(state);
    expect(next.mode).toBe("shortBreak");
    expect(next.cycleCount).toBe(1);
  });

  it("advances to long break after completing required cycles", () => {
    const state = buildInitialState("user-1", testTemplate);
    state.cycleCount = 3;
    const next = advanceMode(state);
    expect(next.mode).toBe("longBreak");
    expect(next.cycleCount).toBe(4);
  });

  it("resolves built-in template by id", () => {
    const t = resolveTemplate("deep-work");
    expect(t.id).toBe("deep-work");
    expect(t.focusDuration).toBe(50);
  });

  it("resolves default template when id is missing", () => {
    const t = resolveTemplate();
    expect(t.id).toBe("classic");
  });
});
