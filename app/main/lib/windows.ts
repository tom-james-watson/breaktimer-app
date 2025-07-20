import { app, BrowserWindow, screen } from "electron";
import log from "electron-log";
import path from "path";
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
    width: 535,
    minWidth: 535,
    height: 600 + (process.platform === "win32" ? 40 : 0),
    minHeight: 600 + (process.platform === "win32" ? 40 : 0),
    autoHideMenuBar: true,
    icon:
      process.env.NODE_ENV === "development"
        ? path.join(__dirname, "../../../resources/tray/icon.png")
        : path.join(process.resourcesPath, "app/resources/tray/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../../renderer/preload.js"),
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
    },
  });

  soundsWindow.loadURL(getBrowserWindowUrl("sounds"));
}

export function createBreakWindows(): void {
  const displays = screen.getAllDisplays();
  for (const display of displays) {
    const notificationWidth = 500;
    const notificationHeight = 80;
    const breakWindow = new BrowserWindow({
      show: false,
      autoHideMenuBar: true,
      frame: false,
      x: display.bounds.x + display.bounds.width / 2 - notificationWidth / 2,
      y: display.bounds.y + 50,
      width: notificationWidth,
      height: notificationHeight,
      resizable: false,
      focusable: false,
      transparent: true,
      hasShadow: false,
      webPreferences: {
        devTools: true,
        preload: path.join(__dirname, "../../renderer/preload.js"),
      },
    });

    breakWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    breakWindow.setAlwaysOnTop(true);
    breakWindow.setFullScreenable(false);
    breakWindow.moveTop();

    if (process.platform === "darwin") {
      // setVisibleOnAllWorkspaces seems to have a bug that causes the dock to
      // unhide when called.
      app.dock?.hide();
    }

    breakWindow.loadURL(getBrowserWindowUrl("break"));

    breakWindow.on("ready-to-show", () => {
      if (!breakWindow) {
        throw new Error('"breakWindow" is not defined');
      }

      // Show as inactive to avoid stealing focus
      breakWindow.showInactive();
    });

    breakWindow.on("closed", () => {
      if (process.platform === "darwin") {
        // Ensure that focus is returned to the previous app when break windows
        // close.
        app.hide();
      }

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

export function closeBreakWindows(): void {
  const firstWin = breakWindows[0];
  if (!firstWin) return;
  if (!firstWin.closable) return;

  // The window's `.close` cleanup function will do everything else we need
  firstWin.close();
}
