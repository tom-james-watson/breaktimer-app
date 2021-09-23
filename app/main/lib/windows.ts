import path from "path";
import { screen, BrowserWindow } from "electron";
import { Settings } from "../../types/settings";
import { getSettings } from "./store";
import { endPopupBreak } from "./breaks";

let settingsWindow: BrowserWindow | null = null;
let soundsWindow: BrowserWindow | null = null;
let breakWindows: BrowserWindow[] = [];

const getBrowserWindowUrl = (page: "settings" | "sounds" | "break"): string => {
  return `file://${path.join(
    __dirname,
    `../views/${process.env.NODE_ENV}.html?page=${page}`
  )}`;
};

export function getWindows(): BrowserWindow[] {
  const windows = [];
  if (settingsWindow !== null) {
    windows.push(settingsWindow);
  }
  if (soundsWindow !== null) {
    windows.push(soundsWindow);
  }
  windows.push(...breakWindows);
  return windows;
}

export function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.show();
    return;
  }

  settingsWindow = new BrowserWindow({
    show: false,
    width: 507,
    minWidth: 507,
    height: process.platform === "win32" ? 700 : 660,
    minHeight: process.platform === "win32" ? 700 : 660,
    autoHideMenuBar: true,
    icon:
      process.env.NODE_ENV === "development"
        ? path.join(__dirname, "../../../resources/tray/icon.png")
        : path.join(process.resourcesPath, "app/resources/tray/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../../renderer/preload.js"),
      nativeWindowOpen: true,
    },
  });

  settingsWindow.loadURL(getBrowserWindowUrl("settings"));

  settingsWindow.on("ready-to-show", () => {
    if (!settingsWindow) {
      throw new Error('"settingsWindow" is not defined');
    }
    settingsWindow.show();
    settingsWindow.focus();
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

export function createSoundsWindow(): void {
  soundsWindow = new BrowserWindow({
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "../../renderer/preload.js"),
      nativeWindowOpen: true,
    },
  });

  soundsWindow.loadURL(getBrowserWindowUrl("sounds"));
}

export function createBreakWindows(): void {
  const displays = screen.getAllDisplays();
  const settings: Settings = getSettings();

  for (const display of displays) {
    const breakWindow = new BrowserWindow({
      show: false,
      fullscreen: process.platform === "darwin",
      alwaysOnTop: true,
      skipTaskbar: true,
      autoHideMenuBar: true,
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.size.width,
      height: display.size.height,
      backgroundColor: settings.backgroundColor,
      webPreferences: {
        preload: path.join(__dirname, "../../renderer/preload.js"),
        nativeWindowOpen: true,
      },
    });

    breakWindow.loadURL(getBrowserWindowUrl("break"));

    breakWindow.on("ready-to-show", () => {
      if (!breakWindow) {
        throw new Error('"breakWindow" is not defined');
      }
      breakWindow.show();
      breakWindow.focus();

      // If we set this in the browser window options then we get a crash on
      // Ubuntu 20.10. Setting kiosk once the window is ready seems to avoid
      // this.
      if (process.platform !== "darwin") {
        breakWindow.setKiosk(true);
      }
    });

    breakWindow.on("closed", () => {
      for (const win of breakWindows) {
        if (!win.isDestroyed()) {
          try {
            win.close();
          } catch (err) {
            console.warn(err);
          }
        }
      }
      breakWindows = [];
      endPopupBreak();
    });

    breakWindows.push(breakWindow);
  }
}
