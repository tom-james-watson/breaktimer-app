import Store from "electron-store";
import { defaultSettings, Settings } from "../../types/settings";
import { setAutoLauch } from "./auto-launch";
import { initBreaks } from "./breaks";

interface Migration {
  version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrate: (settings: any) => any;
}

const migrations: Migration[] = [
  {
    version: 1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    migrate: (settings: any) => {
      // Working hours migration
      if (
        settings.workingHoursMonday &&
        typeof settings.workingHoursMonday === "boolean"
      ) {
        console.log("Migrating working hours settings to new format");

        const oldToNew = (from: Date, to: Date) => ({
          fromMinutes: from.getHours() * 60 + from.getMinutes(),
          toMinutes: to.getHours() * 60 + to.getMinutes(),
        });

        const defaultRange = oldToNew(
          new Date(settings.workingHoursFrom),
          new Date(settings.workingHoursTo)
        );

        [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].forEach((day) => {
          const key = `workingHours${day}`;
          settings[key] = {
            enabled: settings[key],
            ranges: [defaultRange],
          };
        });

        delete settings.workingHoursFrom;
        delete settings.workingHoursTo;
      }
      return settings;
    },
  },
];

const store = new Store({
  defaults: {
    settings: defaultSettings,
    appInitialized: false,
    settingsVersion: 0,
    disableEndTime: null,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateSettings(settings: any): Settings {
  let currentVersion = store.get("settingsVersion") as number;
  const pendingMigrations = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  if (pendingMigrations.length > 0) {
    console.log(
      `Running migrations from version ${currentVersion} to ${
        pendingMigrations[pendingMigrations.length - 1].version
      }`
    );

    let migratedSettings = { ...settings };

    for (const migration of pendingMigrations) {
      try {
        console.log(`Applying migration version ${migration.version}`);
        migratedSettings = migration.migrate(migratedSettings);
        currentVersion = migration.version;
      } catch (error) {
        console.error(
          `Failed to apply migration version ${migration.version}:`,
          error
        );
        break;
      }
    }

    // Save migrated settings and update version
    store.set("settings", migratedSettings);
    store.set("settingsVersion", currentVersion);

    console.log(`Migrations completed. New version: ${currentVersion}`);
    return migratedSettings;
  }

  return settings;
}

export function getSettings(): Settings {
  const settings = store.get("settings");
  const migratedSettings = migrateSettings(settings);
  return Object.assign({}, defaultSettings, migratedSettings) as Settings;
}

export function setSettings(settings: Settings, resetBreaks = true): void {
  const currentSettings = getSettings();

  if (currentSettings.autoLaunch !== settings.autoLaunch) {
    setAutoLauch(settings.autoLaunch);
  }

  store.set({ settings });

  if (resetBreaks) {
    initBreaks();
  }
}

export function getAppInitialized(): boolean {
  return store.get("appInitialized") as boolean;
}

export function setAppInitialized(): void {
  store.set({ appInitialized: true });
}

export function setBreaksEnabled(breaksEnabled: boolean): void {
  const settings: Settings = getSettings();
  setSettings({ ...settings, breaksEnabled }, false);
}

export function setDisableEndTime(endTime: number | null): void {
  store.set("disableEndTime", endTime);
}

export function getDisableEndTime(): number | null {
  return store.get("disableEndTime");
}
