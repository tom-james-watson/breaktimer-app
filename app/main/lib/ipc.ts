import {ipcMain, IpcMainEvent, BrowserWindow} from 'electron'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {getSettingsWindow} from './windows'
import {getSettings, setSettings} from './store'

export function sendIpc(channel: IpcChannel, ...args: any[]): void {
  const settingsWindow: BrowserWindow = getSettingsWindow()

  if (!settingsWindow) {
    console.warn(`Can't send event ${channel}, no main window open`)
    return
  }

  console.log(`Send event ${channel}`, args)

  settingsWindow.webContents.send(channel, ...args)
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
