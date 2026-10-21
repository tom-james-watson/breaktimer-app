import { BreakEvent, BreakEventType } from "../../../types/stats";

export interface BreakCounts {
  completed: number;
  endedEarly: number;
  skipped: number;
  snoozed: number;
  away: number;
}

export interface DailyBreakCounts {
  date: Date;
  counts: BreakCounts;
}

const emptyCounts = (): BreakCounts => ({
  completed: 0,
  endedEarly: 0,
  skipped: 0,
  snoozed: 0,
  away: 0,
});

const countKeys: Record<BreakEventType, keyof BreakCounts> = {
  [BreakEventType.Completed]: "completed",
  [BreakEventType.EndedEarly]: "endedEarly",
  [BreakEventType.Skipped]: "skipped",
  [BreakEventType.Snoozed]: "snoozed",
  [BreakEventType.Away]: "away",
};

export function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

// Start of the local day `days - 1` days ago, so that `days = 1` means today.
export function startOfPeriod(days: number, now = new Date()): Date {
  const start = startOfDay(now);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export function countBreakEvents(
  events: BreakEvent[],
  since: Date,
  until?: Date,
): BreakCounts {
  const counts = emptyCounts();
  for (const event of events) {
    if (event.timestamp < since.getTime()) continue;
    if (until && event.timestamp >= until.getTime()) continue;
    const key = countKeys[event.type];
    if (key) counts[key]++;
  }
  return counts;
}

// Only breaks that BreakTimer prompted for count towards the rate. Snoozed
// breaks come back later, and away breaks were never prompted.
export function getCompletionRate(counts: BreakCounts): number | null {
  const total = counts.completed + counts.endedEarly + counts.skipped;
  return total === 0 ? null : counts.completed / total;
}

export function getDailyBreakCounts(
  events: BreakEvent[],
  days: number,
  now = new Date(),
): DailyBreakCounts[] {
  const result: DailyBreakCounts[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfPeriod(i + 1, now);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    result.push({ date, counts: countBreakEvents(events, date, next) });
  }
  return result;
}
