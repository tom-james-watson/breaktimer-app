import { app, dialog, Menu, Tray } from "electron";
import moment from "moment";
import path from "path";
import packageJson from "../../../package.json";
import { Settings } from "../../types/settings";
import {
  checkIdle,
  checkInWorkingHours,
  getBreaks,
  getNextBreak,
  startBreakNow,
} from "./breaks";
import {
  getDisableEndTime,
  getSettings,
  setDisableEndTime,
  setSettings,
} from "./store";
import { createSettingsWindow } from "./windows";

let tray: Tray;
let lastMinsLeft = 0;

const rootPath = path.dirname(app.getPath("exe"));
const resourcesPath =
  process.platform === "darwin"
    ? path.resolve(rootPath, "..", "Resources")
    : rootPath;

function checkDisableTimeout() {
  const disableEndTime = getDisableEndTime();

  if (disableEndTime && Date.now() >= disableEndTime) {
    setDisableEndTime(null);
    const settings = getSettings();
    setSettings({ ...settings, breaksEnabled: true });
    buildTray();
  }
}

function getDisableTimeRemaining(): string {
  const disableEndTime = getDisableEndTime();
  if (!disableEndTime) {
    return "";
  }

  const remainingMs = disableEndTime - Date.now();
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingDisplayMinutes = remainingMinutes % 60;

  if (remainingMinutes < 1) {
    return "<1m";
  } else if (remainingHours > 0) {
    return `${remainingHours}h ${remainingDisplayMinutes}m`;
  } else {
    return `${remainingMinutes}m`;
  }
}

export function buildTray(): void {
  if (!tray) {
    let imgPath;

    if (process.platform === "darwin") {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/tray-IconTemplate.png"
          : path.join(resourcesPath, "tray", "tray-IconTemplate.png");
    } else {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/icon.png"
          : path.join(app.getAppPath(), "..", "tray", "icon.png");
    }

    tray = new Tray(imgPath);

    // On windows, context menu will not show on left click by default
    if (process.platform === "win32") {
      tray.on("click", () => {
        tray.popUpContextMenu();
      });
    }
  }

  let settings: Settings = getSettings();
  const breaksEnabled = settings.breaksEnabled;

  const setBreaksEnabled = (breaksEnabled: boolean): void => {
    if (breaksEnabled) {
      setDisableEndTime(null);
    }
    settings = getSettings();
    setSettings({ ...settings, breaksEnabled });
    buildTray();
  };

  const disableBreaksFor = (duration: number): void => {
    setBreaksEnabled(false);
    const endTime = Date.now() + duration;
    setDisableEndTime(endTime);
    buildTray();
  };

  const createAboutWindow = (): void => {
    dialog.showMessageBox({
      title: "About",
      type: "info",
      message: `BreakTimer`,
      detail: `Build: ${packageJson.version}\n\nWebsite:\nhttps://breaktimer.app\n\nSource Code:\nhttps://github.com/tom-james-watson/breaktimer-app\n\nDistributed under GPL-3.0-or-later license.`,
    });
  };

  const quit = (): void => {
    setTimeout(() => {
      app.exit(0);
    });
  };

  const breaks = getBreaks();
  const nextBreak = getNextBreak();

  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();
  const minsLeft = breaks[nextBreak.name]?.diff(moment(), "minutes");

  let nextBreakLabel = "";

  if (minsLeft !== undefined) {
    if (minsLeft > 1) {
      nextBreakLabel = `Next break in ${minsLeft} minutes`;
    } else if (minsLeft === 1) {
      nextBreakLabel = `Next break in 1 minute`;
    } else {
      nextBreakLabel = `Next break in less than a minute`;
    }
  }

  const disableEndTime = getDisableEndTime();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: nextBreakLabel,
      visible: nextBreak !== null && inWorkingHours && settings.breaksEnabled,
      enabled: false,
    },
    {
      label: `Disabled for ${getDisableTimeRemaining()}`,
      visible: disableEndTime !== null && !breaksEnabled,
      enabled: false,
    },
    {
      label: `Outside of working hours`,
      visible: !inWorkingHours,
      enabled: false,
    },
    {
      label: `Idle`,
      visible: idle,
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Enable",
      click: setBreaksEnabled.bind(null, true),
      visible: !breaksEnabled,
    },
    {
      label: "Disable...",
      submenu: [
        { label: "Indefinitely", click: setBreaksEnabled.bind(null, false) },
        { label: "30 minutes", click: () => disableBreaksFor(30 * 60 * 1000) },
        { label: "1 hour", click: () => disableBreaksFor(60 * 60 * 1000) },
        { label: "2 hours", click: () => disableBreaksFor(2 * 60 * 60 * 1000) },
        { label: "4 hours", click: () => disableBreaksFor(4 * 60 * 60 * 1000) },
        {
          label: "Rest of day",
          click: () => {
            const now = new Date();
            const endOfDay = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59
            );
            disableBreaksFor(endOfDay.getTime() - now.getTime());
          },
        },
      ],
      visible: breaksEnabled,
    },
    {
      label: "Start break now",
      visible: nextBreak !== null && inWorkingHours,
      click: startBreakNow,
    },
    { type: "separator" },
    { label: "Settings...", click: createSettingsWindow },
    { label: "About...", click: createAboutWindow },
    { label: "Quit", click: quit },
  ]);

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu);
}

export function initTray(): void {
  buildTray();
  let lastDisableText = getDisableTimeRemaining();

  setInterval(() => {
    checkDisableTimeout();

    const currentDisableText = getDisableTimeRemaining();
    if (currentDisableText !== lastDisableText) {
      buildTray();
      lastDisableText = currentDisableText;
    }

    const nextBreak = getNextBreak();
    const breaks = getBreaks();

    if (
      nextBreak === null ||
      !Object.keys(breaks).length ||
      !breaks[nextBreak.name]
    ) {
      return;
    }

    const minsLeft = breaks[nextBreak.name].diff(moment(), "minutes");
    if (minsLeft !== lastMinsLeft) {
      buildTray();
      lastMinsLeft = minsLeft;
    }
  }, 5000);
}
