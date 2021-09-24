import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import log from "electron-log";
import { Settings } from "../../types/settings";
import { IpcChannel } from "../../types/ipc";
import { getWindows } from "./windows";
import { getBreakEndTime } from "./breaks";
import { getSettings, setSettings } from "./store";

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

ipcMain.handle(IpcChannel.SettingsGet, (): Settings => {
  log.info(IpcChannel.SettingsGet);
  return getSettings();
});

ipcMain.handle(
  IpcChannel.SettingsSet,
  (_event: IpcMainInvokeEvent, settings: Settings): void => {
    log.info(IpcChannel.SettingsSet);
    setSettings(settings);
  }
);

ipcMain.handle(IpcChannel.BreakEndTimeGet, (): string => {
  log.info(IpcChannel.BreakEndTimeGet);

  const breakEndTime = getBreakEndTime();

  if (breakEndTime === null) {
    throw new Error("Got null breakEndTime");
  }

  return breakEndTime.toISOString();
});
