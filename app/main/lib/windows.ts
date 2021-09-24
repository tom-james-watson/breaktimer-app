import path from "path";
import { screen, BrowserWindow } from "electron";
import log from "electron-log";
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
      devTools: false,
      preload: path.join(__dirname, "../../renderer/preload.js"),
      nativeWindowOpen: true,
    },
  });

  soundsWindow.loadURL(getBrowserWindowUrl("sounds"));
}

export function createBreakWindows(): void {
  const displays = screen.getAllDisplays();
  for (const display of displays) {
    const size = 400;
    const breakWindow = new BrowserWindow({
      show: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      frame: false,
      x: display.workArea.x + display.workArea.width - size - 50,
      y: display.workArea.y + display.workArea.height - size - 50,
      width: size,
      height: size,
      focusable: false,
      transparent: true,
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
    });

    breakWindow.on("closed", () => {
      for (const win of breakWindows) {
        if (!win.isDestroyed()) {
          try {
            win.close();
          } catch (err) {
            log.warn(err);
          }
        }
      }
      breakWindows = [];
      endPopupBreak();
    });

    breakWindows.push(breakWindow);
  }
}
