import {app, Menu, Tray} from 'electron'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {sendIpc} from './ipc'
import {getSettings, setSettings} from './store'
import {createSettingsWindow} from './windows'
import {getBreakTime} from './breaks'

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

  const breakTime = getBreakTime()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Next break at ${breakTime && breakTime.format('HH:mm:ss')}`,
      visible: breakTime !== null,
      enabled: false
    },
    {type: 'separator'},
    {
      label: breaksEnabled ? 'Disable' : 'Enable',
      click: setBreaksEnabled.bind(null, !breaksEnabled)
    },
    {label: 'Restart countdown', enabled: false},
    {label: 'Start break now', enabled: false},
    {type: 'separator'},
    {label: 'Settings', click: createSettingsWindow},
    {label: 'Quit', click: app.quit}
  ])

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)
}

app.on('ready', buildTray)
