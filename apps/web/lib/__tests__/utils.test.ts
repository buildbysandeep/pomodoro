import { describe, it, expect } from "vitest";
import { formatTime, formatDuration } from "../utils";

describe("utils", () => {
  it("formats milliseconds to mm:ss", () => {
    expect(formatTime(125000)).toBe("02:05");
    expect(formatTime(60000)).toBe("01:00");
    expect(formatTime(59000)).toBe("00:59");
  });

  it("clamps negative time to 00:00", () => {
    expect(formatTime(-1000)).toBe("00:00");
  });

  it("formats minutes to human readable duration", () => {
    expect(formatDuration(25)).toBe("25m");
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(120)).toBe("2h");
  });
});
