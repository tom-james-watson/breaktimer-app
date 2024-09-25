import Store from "electron-store";
import { Settings, NotificationType } from "../../types/settings";
import { setAutoLauch } from "./auto-launch";
import { initBreaks } from "./breaks";

const defaultSettings: Settings = {
  autoLaunch: true,
  breaksEnabled: true,
  notificationType: NotificationType.Popup,
  breakFrequency: new Date(0, 0, 0, 0, 28),
  breakLength: new Date(0, 0, 0, 0, 2),
  postponeLength: new Date(0, 0, 0, 0, 3),
  postponeLimit: 0,
  workingHoursEnabled: true,
  workingHoursFrom: new Date(0, 0, 0, 9),
  workingHoursTo: new Date(0, 0, 0, 18),
  workingHoursMonday: true,
  workingHoursTuesday: true,
  workingHoursWednesday: true,
  workingHoursThursday: true,
  workingHoursFriday: true,
  workingHoursSaturday: false,
  workingHoursSunday: false,
  idleResetEnabled: true,
  idleResetLength: new Date(0, 0, 0, 0, 5),
  idleResetNotification: false,
  gongEnabled: true,
  breakTitle: "Time for a break!",
  breakMessage: "Rest your eyes. Stretch your legs. Breathe. Relax.",
  backgroundColor: "#16a085",
  backdropColor: "#001914",
  textColor: "#ffffff",
  showBackdrop: true,
  backdropOpacity: 0.7,
  endBreakEnabled: true,
  skipBreakEnabled: false,
  postponeBreakEnabled: true,
  halfFullTrayMinutes: 20,
  almostEmptyTrayMinutes: 3,
};

const store = new Store<{
  settings: Settings;
  appInitialized: boolean;
}>({
  defaults: {
    settings: defaultSettings,
    appInitialized: false,
  },
});

export function getSettings(): Settings {
  return Object.assign(defaultSettings, store.get("settings")) as Settings;
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
