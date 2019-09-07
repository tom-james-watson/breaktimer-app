import path from 'path'
import {BrowserWindow} from 'electron'
import MenuBuilder from './menu'

let settingsWindow: BrowserWindow = null

export function getSettingsWindow(): BrowserWindow {
  return settingsWindow
}

export function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    show: false,
    width: 440,
    minWidth: 440,
    height: 625,
    minHeight: 625,
    webPreferences: {
      // This effectively disables the sandbox inside the renderer process and
      // is now turned off by default as of v5. Without this, we cannot access
      // node APIs such as `process` inside the renderer process.
      // In the future, we can use a preload script to pass what we need into
      // the renderer process and turn this setting back off. I haven't done
      // that for now as the webpack build will require some tweaking.
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'icon.png')
  })

  settingsWindow.loadURL(
    process.env.NODE_ENV === 'development' ?
      `file://${__dirname}/../views/app.html?page=settings` :
      `file://${path.join(__dirname, '../views/app.html?page=settings')}`
  )

  settingsWindow.webContents.on('did-finish-load', () => {
    if (!settingsWindow) {
      throw new Error('"settingsWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      settingsWindow.minimize()
    } else {
      settingsWindow.show()
      settingsWindow.focus()
    }
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  const menuBuilder = new MenuBuilder(settingsWindow)
  menuBuilder.buildMenu()
}
