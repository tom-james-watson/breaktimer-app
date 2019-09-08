import {ipcMain, IpcMainEvent, BrowserWindow} from 'electron'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {BreakTime} from '../../types/breaks'
import {getWindows} from './windows'
import {getBreakEndTime} from './breaks'
import {getSettings, setSettings} from './store'

export function sendIpc(channel: IpcChannel, ...args: any[]): void {
  const windows: BrowserWindow[] = getWindows()

  console.log(`Send event ${channel}`, args)

  for (const window of windows) {
    if (!window) {
      continue
    }

    window.webContents.send(channel, ...args)
  }
}

ipcMain.on(IpcChannel.GET_SETTINGS, (event: IpcMainEvent): void => {
  console.log(IpcChannel.GET_SETTINGS)

  try {
    const settings: Settings = getSettings()
    event.reply(IpcChannel.GET_SETTINGS_SUCCESS, settings)
  } catch (err)  {
    console.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})

ipcMain.on(IpcChannel.SET_SETTINGS, (event: IpcMainEvent, settings: Settings): void => {
  console.log(IpcChannel.SET_SETTINGS, {settings})
  try {
    setSettings(settings)
    event.reply(IpcChannel.SET_SETTINGS_SUCCESS, settings)
  } catch (err)  {
    console.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})

ipcMain.on(IpcChannel.GET_BREAK_END_TIME, (event: IpcMainEvent): void => {
  console.log(IpcChannel.GET_BREAK_END_TIME)
  try {
    const breakTime: BreakTime = getBreakEndTime()
    event.reply(IpcChannel.GET_BREAK_END_TIME_SUCCESS, breakTime ? breakTime.toISOString() : null)
  } catch (err)  {
    console.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})
