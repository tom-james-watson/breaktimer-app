import Database from "better-sqlite3";
import { app } from "electron";
import log from "electron-log";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { HistoryEventType, HistoryItem } from "../../types/history";

let db: Database.Database | null = null;

/**
 * Get or create the database instance
 */
function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "breaktimer.db");

  log.info(`Initializing database at: ${dbPath}`);

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL"); // Better concurrency
  db.pragma("foreign_keys = ON");

  return db;
}

/**
 * Initialize the database schema
 */
export function initDatabase(): void {
  const database = getDatabase();

  // Create history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp);
    CREATE INDEX IF NOT EXISTS idx_history_type ON history(type);
  `);

  log.info("Database schema initialized");
}

/**
 * Add a history event
 */
export function addHistoryEvent(
  type: HistoryEventType,
  timestamp: number,
  duration_ms?: number
): void {
  const database = getDatabase();

  const id = uuidv4();

  const stmt = database.prepare(`
    INSERT INTO history (id, type, timestamp, duration_ms)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, type, timestamp, duration_ms ?? null);

  log.info(
    `History event added: ${type} at ${new Date(timestamp).toISOString()}${duration_ms ? ` (duration: ${duration_ms}ms)` : ""
    }`
  );
}

/**
 * Get all history events
 */
export function getHistory(): HistoryItem[] {
  const database = getDatabase();

  const stmt = database.prepare(`
    SELECT id, type, timestamp, duration_ms
    FROM history
    ORDER BY timestamp DESC
  `);

  return stmt.all() as HistoryItem[];
}

/**
 * Get history events within a time range
 */
export function getHistoryRange(
  startTimestamp: number,
  endTimestamp: number
): HistoryItem[] {
  const database = getDatabase();

  const stmt = database.prepare(`
    SELECT id, type, timestamp, duration_ms
    FROM history
    WHERE timestamp >= ? AND timestamp <= ?
    ORDER BY timestamp DESC
  `);

  return stmt.all(startTimestamp, endTimestamp) as HistoryItem[];
}

/**
 * Cleanup old history records (keep last 1 year)
 */
export function cleanupHistory(): void {
  const database = getDatabase();

  // Calculate timestamp for 1 year ago
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);

  const stmt = database.prepare(`
    DELETE FROM history
    WHERE timestamp < ?
  `);

  const info = stmt.run(oneYearAgo);

  if (info.changes > 0) {
    log.info(`Cleaned up ${info.changes} old history records (older than 1 year)`);
  }
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    log.info("Database connection closed");
  }
}
