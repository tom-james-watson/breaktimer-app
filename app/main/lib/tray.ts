import path from "path";
import moment from "moment";
import { app, dialog, Menu, Tray } from "electron";
import packageJson from "../../../package.json";
import { Settings } from "../../types/settings";
import { getSettings, setSettings } from "./store";
import { createSettingsWindow } from "./windows";
import {
  getBreakTime,
  checkInWorkingHours,
  checkIdle,
  startBreakNow,
  createBreak,
} from "./breaks";

let tray: Tray;
let lastMinsLeft = 0;


/**
 * Returns the path to the tray icon based on the status and the remaining minutes.
 *
 * @param {('disabled' | 'not-in-working-hours' | 'active')} status - The status of the tray icon.
 * @param {number} [minsLeft] - The remaining minutes. Only used when the status is 'active'.
 * @return {string} The path to the tray icon.
 */
function getTrayIconPath(status: 'disabled' | 'not-in-working-hours' | 'active', minsLeft?: number): string {
  const settings = getSettings();

  let trayIconFileName = "icon.png";

  if (process.platform === "darwin") {
    trayIconFileName = "tray-IconTemplate.png";
  } else {
    switch (status) {
      case 'disabled':
        trayIconFileName = "icon-disabled.png";
        break;
      case 'not-in-working-hours':
        trayIconFileName = "icon-off-work.png";
        break;
      case 'active':
        if (minsLeft !== undefined) {
          if (minsLeft < settings.almostEmptyTrayMinutes) {
            trayIconFileName = "icon-almost-empty.png";
          } else if (minsLeft < settings.halfFullTrayMinutes) {
            trayIconFileName = "icon-half-full.png";
          }
        }
        break;
    }
  }

  return process.env.NODE_ENV === "development"
    ? path.join("resources", "tray", trayIconFileName)
    : path.join(process.resourcesPath, "app", "resources", "tray", trayIconFileName);
}

export function buildTray(): void {
  if (!tray) {
    const trayIconPath = getTrayIconPath('disabled');
    tray = new Tray(trayIconPath);

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
    settings = getSettings();
    setSettings({ ...settings, breaksEnabled });
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

  const breakTime = getBreakTime();
  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();
  const minsLeft = breakTime?.diff(moment(), "minutes");

  let toolTip = "";

  if (breaksEnabled) {
    if (inWorkingHours) {
      if (minsLeft !== undefined) {
        if (minsLeft > 1) {
          toolTip = `Next break in ${minsLeft} minutes`;
        } else if (minsLeft === 1) {
          toolTip = `Next break in 1 minute`;
        } else {
          toolTip = `Next break in less than a minute`;
        }
        tray.setImage(getTrayIconPath('active', minsLeft));
      }
    } else {
      toolTip = "Outside of working hours";
      tray.setImage(getTrayIconPath("not-in-working-hours"))
    }
  } else {
    toolTip = "Disabled";
    tray.setImage(getTrayIconPath("disabled"));
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: toolTip,
      visible: breakTime !== null || !inWorkingHours,
      enabled: false,
    },
    {
      label: `Idle`,
      visible: idle,
      enabled: false,
    },
    { type: "separator" },
    {
      label: breaksEnabled ? "Disable" : "Enable",
      click: setBreaksEnabled.bind(null, !breaksEnabled),
    },
    {
      label: "Start break now",
      visible: breakTime !== null && inWorkingHours,
      click: startBreakNow,
    },
    {
      label: "Restart break period",
      visible: breakTime !== null && inWorkingHours,
      click: createBreak.bind(null, false),
    },
    { type: "separator" },
    { label: "Settings...", click: createSettingsWindow },
    { label: "About...", click: createAboutWindow },
    { label: "Quit", click: quit },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(toolTip);
}

export function initTray(): void {
  buildTray();
  setInterval(() => {
    const breakTime = getBreakTime();
    if (breakTime === null) {
      return;
    }

    const minsLeft = breakTime.diff(moment(), "minutes");
    if (minsLeft !== lastMinsLeft) {
      buildTray();
      lastMinsLeft = minsLeft;
    }
  }, 5000);
}
