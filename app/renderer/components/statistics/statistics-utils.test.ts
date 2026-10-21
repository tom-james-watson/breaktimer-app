import { describe, expect, it } from "vitest";
import { BreakEvent, BreakEventType } from "../../../types/stats";
import {
  countBreakEvents,
  getCompletionRate,
  getDailyBreakCounts,
  startOfPeriod,
} from "./statistics-utils";

const now = new Date(2026, 9, 21, 15, 0);
const at = (day: number, hour: number) =>
  new Date(2026, 9, day, hour, 0).getTime();

const events: BreakEvent[] = [
  { type: BreakEventType.Completed, timestamp: at(21, 9) },
  { type: BreakEventType.Snoozed, timestamp: at(21, 10) },
  { type: BreakEventType.Skipped, timestamp: at(21, 11) },
  { type: BreakEventType.EndedEarly, timestamp: at(20, 23) },
  { type: BreakEventType.Completed, timestamp: at(19, 0) },
  { type: BreakEventType.Completed, timestamp: at(10, 12) },
  { type: BreakEventType.Away, timestamp: at(21, 13) },
];

describe("countBreakEvents", () => {
  it("counts only events within the period", () => {
    expect(countBreakEvents(events, startOfPeriod(1, now))).toEqual({
      completed: 1,
      endedEarly: 0,
      skipped: 1,
      snoozed: 1,
      away: 1,
    });
    expect(countBreakEvents(events, startOfPeriod(7, now))).toEqual({
      completed: 2,
      endedEarly: 1,
      skipped: 1,
      snoozed: 1,
      away: 1,
    });
  });
});

describe("getCompletionRate", () => {
  it("ignores snoozes and away breaks, and returns null without final outcomes", () => {
    expect(
      getCompletionRate({
        completed: 3,
        endedEarly: 0,
        skipped: 1,
        snoozed: 9,
        away: 4,
      }),
    ).toBe(0.75);
    expect(
      getCompletionRate({
        completed: 0,
        endedEarly: 0,
        skipped: 0,
        snoozed: 2,
        away: 1,
      }),
    ).toBeNull();
  });
});

describe("getDailyBreakCounts", () => {
  it("buckets events by local day, oldest first", () => {
    const daily = getDailyBreakCounts(events, 3, now);

    expect(daily.map((d) => d.date.getDate())).toEqual([19, 20, 21]);
    expect(daily.map((d) => d.counts.completed)).toEqual([1, 0, 1]);
    expect(daily[1].counts.endedEarly).toBe(1);
  });
});
