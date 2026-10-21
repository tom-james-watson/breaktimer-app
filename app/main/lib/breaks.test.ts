import type { PowerMonitor } from "electron";
import moment from "moment";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BreakEventType } from "../../types/stats";
import {
  defaultSettings,
  NotificationType,
  Settings,
} from "../../types/settings";

const harness = vi.hoisted(() => ({
  buildTray: vi.fn(),
  createBreakWindows: vi.fn(),
  getSystemIdleState: vi.fn<PowerMonitor["getSystemIdleState"]>(() => "active"),
  recordBreakEvent: vi.fn(),
  powerMonitor: {} as Pick<PowerMonitor, "getSystemIdleState">,
  settings: {} as Settings,
}));

vi.mock("electron", () => ({}));
vi.mock("electron-log", () => ({ default: { info: vi.fn() } }));
vi.mock("./ipc", () => ({ sendIpc: vi.fn() }));
vi.mock("./notifications", () => ({ showNotification: vi.fn() }));
vi.mock("./stats", () => ({ recordBreakEvent: harness.recordBreakEvent }));
vi.mock("./store", () => ({ getSettings: () => harness.settings }));
vi.mock("./tray", () => ({ buildTray: harness.buildTray }));
vi.mock("./windows", () => ({
  createBreakWindows: harness.createBreakWindows,
}));

describe("manual breaks", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    harness.settings = {
      ...defaultSettings,
      notificationType: NotificationType.Popup,
    };
  });

  it("starts immediately without waiting for the automatic scheduler", async () => {
    const breaks = await import("./breaks.js");

    breaks.startBreakNow();

    expect(harness.createBreakWindows).toHaveBeenCalledOnce();
    expect(breaks.isHavingBreak()).toBe(true);
    expect(breaks.wasStartedFromTray()).toBe(true);
    expect(
      Math.abs(breaks.getBreakTime()?.diff(moment()) ?? Infinity),
    ).toBeLessThan(1000);
  });
});

describe("system suspension", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T09:00:00Z"));
    vi.resetModules();
    vi.clearAllMocks();
    harness.getSystemIdleState.mockReturnValue("active");
    harness.powerMonitor = {
      getSystemIdleState: harness.getSystemIdleState,
    };
    harness.settings = {
      ...defaultSettings,
      breakFrequencySeconds: 60,
      idleResetLengthSeconds: 5,
      workingHoursEnabled: false,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not count a long suspension as active time", async () => {
    const breaks = await import("./breaks.js");
    breaks.initBreaks(harness.powerMonitor);
    vi.advanceTimersByTime(1000);

    vi.setSystemTime(new Date("2026-08-24T09:02:00Z"));
    vi.advanceTimersByTime(1000);

    expect(breaks.getTimeSinceLastCompletedBreak()).toBe(0);
    expect(breaks.getBreakTime()?.diff(moment(), "seconds")).toBe(60);
  });

  it("detects suspension even if the machine was already locked", async () => {
    harness.getSystemIdleState.mockReturnValue("locked");
    const breaks = await import("./breaks.js");
    breaks.initBreaks(harness.powerMonitor);
    vi.advanceTimersByTime(1000);

    vi.setSystemTime(new Date("2026-08-24T09:02:00Z"));
    vi.advanceTimersByTime(1000);

    expect(breaks.getTimeSinceLastCompletedBreak()).toBe(0);
  });
});

describe("away breaks", () => {
  // Monday 24 August 2026, local time. Default working hours are 09:00-18:00
  // on weekdays.
  const monday = (hours: number, minutes = 0) =>
    new Date(2026, 7, 24, hours, minutes);

  const awayCalls = () =>
    harness.recordBreakEvent.mock.calls.filter(
      ([type]) => type === BreakEventType.Away,
    );

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.clearAllMocks();
    harness.getSystemIdleState.mockReturnValue("active");
    harness.powerMonitor = {
      getSystemIdleState: harness.getSystemIdleState,
    };
    harness.settings = {
      ...defaultSettings,
      breakFrequencySeconds: 60,
      idleResetLengthSeconds: 5,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function suspendBetween(from: Date, to: Date) {
    vi.setSystemTime(from);
    const breaks = await import("./breaks.js");
    breaks.initBreaks(harness.powerMonitor);
    vi.advanceTimersByTime(1000);
    vi.setSystemTime(to);
    vi.advanceTimersByTime(1000);
  }

  it("records a suspension within working hours", async () => {
    await suspendBetween(monday(10), monday(10, 30));

    expect(awayCalls()).toHaveLength(1);
    expect(awayCalls()[0][1]).toBeGreaterThanOrEqual(29 * 60 * 1000);
  });

  it("records returning from idle within working hours", async () => {
    vi.setSystemTime(monday(10));
    const breaks = await import("./breaks.js");
    breaks.initBreaks(harness.powerMonitor);
    vi.advanceTimersByTime(1000);

    harness.getSystemIdleState.mockReturnValue("idle");
    vi.advanceTimersByTime(10 * 60 * 1000);
    harness.getSystemIdleState.mockReturnValue("active");
    vi.advanceTimersByTime(1000);

    expect(awayCalls()).toHaveLength(1);
  });

  it("ignores time away that started before working hours", async () => {
    await suspendBetween(monday(7), monday(9, 30));

    expect(awayCalls()).toHaveLength(0);
  });

  it("ignores time away that spans multiple days", async () => {
    await suspendBetween(monday(17, 50), new Date(2026, 7, 25, 9, 10));

    expect(awayCalls()).toHaveLength(0);
  });
});
