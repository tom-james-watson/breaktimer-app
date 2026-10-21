export enum BreakEventType {
  Completed = "COMPLETED",
  EndedEarly = "ENDED_EARLY",
  Skipped = "SKIPPED",
  Snoozed = "SNOOZED",
  // Break auto-detected because the user was idle or the computer was asleep
  Away = "AWAY",
}

export interface BreakEvent {
  type: BreakEventType;
  // Unix timestamp in milliseconds
  timestamp: number;
  // Only recorded for breaks that were actually started
  durationMs?: number;
}

export const statsRetentionDayOptions = [7, 14, 30, 90, 180, 365];
