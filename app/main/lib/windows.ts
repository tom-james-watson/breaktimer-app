import path from 'path'
import {screen, BrowserWindow} from 'electron'
import MenuBuilder from './menu'
import {clearBreakTime} from './breaks'

let settingsWindow: BrowserWindow = null
let soundsWindow: BrowserWindow = null
let breakWindows: BrowserWindow[] = []

export function getWindows(): BrowserWindow[] {
  return [settingsWindow, soundsWindow, ...breakWindows]
}

export function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    show: false,
    width: 440,
    minWidth: 440,
    height: 630,
    minHeight: 630,
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

export function createSoundsWindow() {
  soundsWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'icon.png')
  })

  soundsWindow.loadURL(
    process.env.NODE_ENV === 'development' ?
      `file://${__dirname}/../views/app.html?page=sounds` :
      `file://${path.join(__dirname, '../views/app.html?page=sounds')}`
  )

  soundsWindow.on('closed', () => {
    console.error('Sounds window closed unexpectedly')
    createSoundsWindow()
  })
}

export function createBreakWindows() {
  const displays = screen.getAllDisplays()

  for (const display of displays) {
    const breakWindow = new BrowserWindow({
      show: true,
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.size.width,
      height: display.size.height,
      // resizable: false,
      // movable: false,
      // alwaysOnTop: true,
      // skipTaskbar: true,
      // frame: false,
      backgroundColor: '#16a085',
      kiosk: true,
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

    breakWindow.loadURL(
      process.env.NODE_ENV === 'development' ?
        `file://${__dirname}/../views/app.html?page=break` :
        `file://${path.join(__dirname, '../views/app.html?page=break')}`
    )

    breakWindow.webContents.on('did-finish-load', () => {
      if (!breakWindow) {
        throw new Error('"breakWindow" is not defined')
      }
      if (process.env.START_MINIMIZED) {
        breakWindow.minimize()
      } else {
        breakWindow.show()
        breakWindow.focus()
      }
    })

    breakWindow.on('closed', () => {
      for (const win of breakWindows) {
        if (!win.isDestroyed()) {
          win.close()
        }
      }
      breakWindows = []
      clearBreakTime()
    })

    breakWindows.push(breakWindow)
  }
}
