import {app, Menu, Tray} from 'electron'
import {createSettingsWindow} from './windows'

let appIcon = null

app.on('ready', () => {
  appIcon = new Tray('app/main/icon.png')

  const contextMenu = Menu.buildFromTemplate([
    {label: 'Settings', click: createSettingsWindow},
    {type: 'separator'},
    {label: 'Restart countdown'},
    {label: 'Start break now'},
    {type: 'separator'},
    {label: 'Quit', click: app.quit}
  ])

  // Call this again for Linux because we modified the context menu
  appIcon.setContextMenu(contextMenu)
})
