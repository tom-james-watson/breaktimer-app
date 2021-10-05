import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import log from "electron-log";
import { Settings } from "../../types/settings";
import { IpcChannel } from "../../types/ipc";
import { getWindows } from "./windows";
import { getBreakLength, getAllowPostpone, postponeBreak } from "./breaks";
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

ipcMain.handle(IpcChannel.AllowPostponeGet, (): boolean => {
  log.info(IpcChannel.AllowPostponeGet);
  return getAllowPostpone();
});

ipcMain.handle(IpcChannel.BreakPostpone, (): void => {
  log.info(IpcChannel.BreakPostpone);
  postponeBreak();
});

ipcMain.handle(IpcChannel.GongStartPlay, (): void => {
  log.info(IpcChannel.GongStartPlay);
  sendIpc(IpcChannel.GongStartPlay);
});

ipcMain.handle(IpcChannel.GongEndPlay, (): void => {
  log.info(IpcChannel.GongEndPlay);
  sendIpc(IpcChannel.GongEndPlay);
});

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

ipcMain.handle(IpcChannel.BreakLengthGet, (): Date => {
  log.info(IpcChannel.BreakLengthGet);
  return getBreakLength();
});
