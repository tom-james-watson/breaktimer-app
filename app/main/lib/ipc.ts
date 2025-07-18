import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import log from "electron-log";
import { IpcChannel } from "../../types/ipc";
import { Settings, SoundType } from "../../types/settings";
import { getAllowPostpone, getBreakLengthSeconds, postponeBreak } from "./breaks";
import { getSettings, setSettings } from "./store";
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

ipcMain.handle(IpcChannel.BreakPostpone, (): void => {
  log.info(IpcChannel.BreakPostpone);
  postponeBreak();
});

ipcMain.handle(
  IpcChannel.SoundStartPlay,
  (_event: IpcMainInvokeEvent, type: SoundType): void => {
    log.info(IpcChannel.SoundStartPlay);
    sendIpc(IpcChannel.SoundStartPlay, type);
  }
);

ipcMain.handle(
  IpcChannel.SoundEndPlay,
  (_event: IpcMainInvokeEvent, type: SoundType): void => {
    log.info(IpcChannel.SoundEndPlay);
    sendIpc(IpcChannel.SoundEndPlay, type);
  }
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
  }
);

ipcMain.handle(IpcChannel.BreakLengthGet, (): number => {
  log.info(IpcChannel.BreakLengthGet);
  return getBreakLengthSeconds();
});
