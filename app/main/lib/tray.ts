import {app, Menu, Tray} from 'electron'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {sendIpc} from './ipc'
import {getSettings, setSettings} from './store'
import {createSettingsWindow} from './windows'

let tray = null

export function buildTray(): void {
  if (!tray) {
    tray = new Tray('app/main/icon.png')
  }

  let settings: Settings = getSettings()
  const breaksEnabled = settings.breaksEnabled

  const setBreaksEnabled = (breaksEnabled: boolean): void => {
    settings = getSettings()
    setSettings({...settings, breaksEnabled})
    sendIpc(IpcChannel.GET_SETTINGS_SUCCESS, settings)
    buildTray()
  }

  const contextMenu = Menu.buildFromTemplate([
    {label: 'Settings', click: createSettingsWindow},
    {type: 'separator'},
    {
      label: breaksEnabled ? 'Disable breaks' : 'Enable breaks',
      click: setBreaksEnabled.bind(null, !breaksEnabled)
    },
    {label: 'Restart countdown'},
    {label: 'Start break now'},
    {type: 'separator'},
    {label: 'Quit', click: app.quit}
  ])

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)
}

app.on('ready', buildTray)
