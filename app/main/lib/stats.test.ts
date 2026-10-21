import { describe, expect, it, vi } from "vitest";
import { BreakEventType } from "../../types/stats";

vi.mock("electron-store", () => ({ default: class {} }));
vi.mock("electron-log", () => ({ default: { info: vi.fn() } }));
vi.mock("./store", () => ({ getSettings: vi.fn() }));

describe("filterExpiredEvents", () => {
  it("drops events older than the retention period", async () => {
    const { filterExpiredEvents } = await import("./stats.js");
    const day = 24 * 60 * 60 * 1000;
    const now = 100 * day;

    const events = [
      { type: BreakEventType.Completed, timestamp: now - 31 * day },
      { type: BreakEventType.Skipped, timestamp: now - 30 * day },
      { type: BreakEventType.Snoozed, timestamp: now - day },
    ];

    expect(filterExpiredEvents(events, 30, now)).toEqual(events.slice(1));
    expect(filterExpiredEvents(events, 7, now)).toEqual(events.slice(2));
  });
});
