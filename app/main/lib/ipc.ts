import {ipcMain, IpcMainEvent} from 'electron'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {getSettings, setSettings} from './store'

ipcMain.on(IpcChannel.GET_SETTINGS, async (event: IpcMainEvent): Promise<void> => {
  console.log(IpcChannel.GET_SETTINGS)

  try {
    const settings: Settings = await getSettings()
    event.reply(IpcChannel.GET_SETTINGS_SUCCESS, settings)
  } catch (err)  {
    console.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})

ipcMain.on(IpcChannel.SET_SETTINGS, async (event: IpcMainEvent, settings: Settings): Promise<void> => {
  console.log(IpcChannel.SET_SETTINGS, {settings})
  try {
    await setSettings(settings)
    event.reply(IpcChannel.SET_SETTINGS_SUCCESS, settings)
  } catch (err)  {
    console.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})
