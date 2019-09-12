import path from 'path'
import {app, Menu, Tray} from 'electron'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {sendIpc} from './ipc'
import {getSettings, setSettings} from './store'
import {createSettingsWindow} from './windows'
import {getBreakTime, checkInWorkingHours} from './breaks'

let tray = null

export function buildTray(): void {
  if (!tray) {
    let imgPath
    if (process.platform === 'darwin') {
      imgPath = process.env.NODE_ENV === 'development' ?
        'resources/tray/tray-IconTemplate.png' :
        path.join(process.resourcesPath, 'app/resources/tray/tray-IconTemplate.png')
    } else {
      imgPath = process.env.NODE_ENV === 'development' ?
        'resources/tray/icon.png' :
        path.join(process.resourcesPath, 'app/resources/tray/icon.png')
    }
    tray = new Tray(imgPath)
  }

  let settings: Settings = getSettings()
  const breaksEnabled = settings.breaksEnabled

  const setBreaksEnabled = (breaksEnabled: boolean): void => {
    settings = getSettings()
    setSettings({...settings, breaksEnabled})
    sendIpc(IpcChannel.GET_SETTINGS_SUCCESS, settings)
    buildTray()
  }

  const quit = (): void => {
    setTimeout(() => {
      app.exit(0)
    })
  }

  const breakTime = getBreakTime()
  const inWorkingHours = checkInWorkingHours()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Next break at ${breakTime && breakTime.format('HH:mm:ss')}`,
      visible: breakTime !== null && inWorkingHours,
      enabled: false
    },
    {
      label: `Outside of working hours`,
      visible: !inWorkingHours,
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
    {label: 'Quit', click: quit}
  ])

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)
}

app.on('ready', buildTray)
