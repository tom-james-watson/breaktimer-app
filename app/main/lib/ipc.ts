import { BrowserWindow, ipcMain, IpcMainInvokeEvent, screen } from "electron";
import log from "electron-log";
import { IpcChannel } from "../../types/ipc";
import { Settings, SoundType } from "../../types/settings";
import {
  completeBreakTracking,
  getAllowPostpone,
  getBreakLengthSeconds,
  getTimeSinceLastBreak,
  postponeBreak,
  wasStartedFromTray,
} from "./breaks";
import {
  getSettings,
  setSettings,
  getAppInitialized,
  setAppInitialized,
} from "./store";
import { getWindows } from "./windows";

export function sendIpc(channel: IpcChannel, ...args: unknown[]): void {
  const windows: BrowserWindow[] = getWindows();

  log.info(`Send event ${channel}`, args);

  for (const window of windows) {
    if (!window) {
      continue;
    }

    window.webContents.send(channel, ...args);
  }
}

ipcMain.handle(IpcChannel.AllowPostponeGet, (): boolean => {
  log.info(IpcChannel.AllowPostponeGet);
  return getAllowPostpone();
});

ipcMain.handle(
  IpcChannel.BreakPostpone,
  (_event: IpcMainInvokeEvent, action?: string): void => {
    log.info(IpcChannel.BreakPostpone);
    postponeBreak(action);
  },
);

ipcMain.handle(
  IpcChannel.SoundStartPlay,
  (event: IpcMainInvokeEvent, type: SoundType, volume: number = 1): void => {
    sendIpc(IpcChannel.SoundStartPlay, type, volume);
  },
);

ipcMain.handle(
  IpcChannel.SoundEndPlay,
  (event: IpcMainInvokeEvent, type: SoundType, volume: number = 1): void => {
    sendIpc(IpcChannel.SoundEndPlay, type, volume);
  },
);

ipcMain.handle(IpcChannel.SettingsGet, (): Settings => {
  log.info(IpcChannel.SettingsGet);
  return getSettings();
});

ipcMain.handle(
  IpcChannel.SettingsSet,
  (_event: IpcMainInvokeEvent, settings: Settings): void => {
    log.info(IpcChannel.SettingsSet);
    setSettings(settings);
  },
);

ipcMain.handle(IpcChannel.BreakLengthGet, (): number => {
  log.info(IpcChannel.BreakLengthGet);
  return getBreakLengthSeconds();
});

ipcMain.handle(
  IpcChannel.BreakWindowResize,
  (event: IpcMainInvokeEvent): void => {
    log.info(IpcChannel.BreakWindowResize);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      const display = screen.getDisplayNearestPoint(window.getBounds());
      const settings = getSettings();

      if (settings.showBackdrop) {
        // Fullscreen for backdrop mode
        window.setSize(display.bounds.width, display.bounds.height);
        window.setPosition(display.bounds.x, display.bounds.y);
      } else {
        // Centered window for no backdrop mode
        const windowWidth = 500;
        const windowHeight = 300;
        const centerX =
          display.bounds.x + display.bounds.width / 2 - windowWidth / 2;
        const centerY =
          display.bounds.y + display.bounds.height / 2 - windowHeight / 2;

        window.setSize(windowWidth, windowHeight);
        window.setPosition(centerX, centerY);
      }
    }
  },
);

ipcMain.handle(IpcChannel.TimeSinceLastBreakGet, (): number | null => {
  log.info(IpcChannel.TimeSinceLastBreakGet);
  return getTimeSinceLastBreak();
});

ipcMain.handle(
  IpcChannel.BreakTrackingComplete,
  (event: IpcMainInvokeEvent, breakDurationMs: number): void => {
    log.info(IpcChannel.BreakTrackingComplete, breakDurationMs);
    completeBreakTracking(breakDurationMs);
  },
);

ipcMain.handle(IpcChannel.WasStartedFromTrayGet, (): boolean => {
  log.info(IpcChannel.WasStartedFromTrayGet);
  return wasStartedFromTray();
});

ipcMain.handle(IpcChannel.AppInitializedGet, (): boolean => {
  log.info(IpcChannel.AppInitializedGet);
  return getAppInitialized();
});

ipcMain.handle(IpcChannel.AppInitializedSet, (): void => {
  log.info(IpcChannel.AppInitializedSet);
  setAppInitialized();
});
