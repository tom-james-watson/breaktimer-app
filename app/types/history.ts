export type HistoryEventType = "completed" | "skipped" | "snoozed" | "idle-reset" | "cancelled";

export interface HistoryItem {
    id: string; // UUID
    type: HistoryEventType;
    timestamp: number;
    duration_ms?: number; // Duration in ms (only for 'completed' and 'cancelled')
}
