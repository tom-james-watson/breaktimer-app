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
  if (settingsWindow) {
    settingsWindow.show()
    return
  }

  settingsWindow = new BrowserWindow({
    show: false,
    width: 507,
    minWidth: 507,
    height: 630,
    minHeight: 630,
    skipTaskbar: true,
    webPreferences: {
      // This effectively disables the sandbox inside the renderer process and
      // is now turned off by default as of v5. Without this, we cannot access
      // node APIs such as `process` inside the renderer process.
      // In the future, we can use a preload script to pass what we need into
      // the renderer process and turn this setting back off. I haven't done
      // that for now as the webpack build will require some tweaking.
      nodeIntegration: true
    },
  })

  settingsWindow.loadURL(
    process.env.NODE_ENV === 'development' ?
      `file://${__dirname}/../views/app.html?page=settings` :
      `file://${path.join(__dirname, '../views/app.html?page=settings')}`
  )

  settingsWindow.on('ready-to-show', () => {
    if (!settingsWindow) {
      throw new Error('"settingsWindow" is not defined')
    }
    settingsWindow.show()
    settingsWindow.focus()
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
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    },
  })

  soundsWindow.loadURL(
    process.env.NODE_ENV === 'development' ?
      `file://${__dirname}/../views/app.html?page=sounds` :
      `file://${path.join(__dirname, '../views/app.html?page=sounds')}`
  )
}

export function createBreakWindows() {
  const displays = screen.getAllDisplays()

  for (const display of displays) {
    const breakWindow = new BrowserWindow({
      show: false,
      fullscreen: process.platform === 'darwin',
      kiosk: process.platform !== 'darwin',
      skipTaskbar: true,
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.size.width,
      height: display.size.height,
      backgroundColor: '#16a085',
      webPreferences: {
        nodeIntegration: true
      },
    })

    breakWindow.loadURL(
      process.env.NODE_ENV === 'development' ?
        `file://${__dirname}/../views/app.html?page=break` :
        `file://${path.join(__dirname, '../views/app.html?page=break')}`
    )

    breakWindow.on('ready-to-show', () => {
      if (!breakWindow) {
        throw new Error('"breakWindow" is not defined')
      }
      breakWindow.show()
      breakWindow.focus()
    })

    breakWindow.on('closed', () => {
      for (const win of breakWindows) {
        if (!win.isDestroyed()) {
          try {
            win.close()
          } catch (err) {
            console.warn(err)
          }
        }
      }
      breakWindows = []
      clearBreakTime()
    })

    breakWindows.push(breakWindow)
  }
}
