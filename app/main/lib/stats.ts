import Store from "electron-store";
import log from "electron-log";
import { BreakEvent, BreakEventType } from "../../types/stats";
import { getSettings } from "./store";

const DAY_MS = 24 * 60 * 60 * 1000;
const PRUNE_INTERVAL_MS = 60 * 60 * 1000;

// Statistics live in their own file next to the settings file and never leave
// the device.
const statsStore = new Store<{ events: BreakEvent[] }>({
  name: "statistics",
  defaults: { events: [] },
});

let pruneInterval: NodeJS.Timeout;

export function filterExpiredEvents(
  events: BreakEvent[],
  retentionDays: number,
  now = Date.now(),
): BreakEvent[] {
  const cutoff = now - retentionDays * DAY_MS;
  return events.filter((event) => event.timestamp >= cutoff);
}

export function pruneBreakEvents(): BreakEvent[] {
  const events = statsStore.get("events");
  const retained = filterExpiredEvents(
    events,
    getSettings().statsRetentionDays,
  );

  if (retained.length !== events.length) {
    log.info(
      `Pruned break statistics [removed=${events.length - retained.length}]`,
    );
    statsStore.set("events", retained);
  }

  return retained;
}

export function recordBreakEvent(
  type: BreakEventType,
  durationMs?: number,
): void {
  const event: BreakEvent = { type, timestamp: Date.now() };
  if (durationMs !== undefined) {
    event.durationMs = Math.round(durationMs);
  }

  statsStore.set("events", [...pruneBreakEvents(), event]);
}

export function getBreakEvents(): BreakEvent[] {
  return pruneBreakEvents();
}

export function clearBreakEvents(): void {
  log.info("Cleared break statistics");
  statsStore.set("events", []);
}

export function initStats(): void {
  pruneBreakEvents();

  if (pruneInterval) {
    clearInterval(pruneInterval);
  }

  pruneInterval = setInterval(pruneBreakEvents, PRUNE_INTERVAL_MS);
}
