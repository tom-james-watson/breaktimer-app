import {app} from 'electron'
import {autoUpdater} from 'electron-updater'
import log from 'electron-log'
import {initBreaks} from './lib/breaks'
import {getAppInitialized, setAppInitialized} from './lib/store'
import {createSoundsWindow} from './lib/windows'
import {setAutoLauch} from './lib/auto-launch'
import './lib/ipc'
import './lib/tray'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log)
}

// Don't exit on close all windows - live in tray
app.on('window-all-closed', e => e.preventDefault())

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  // Required for notifications to work on windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('org.tom-james-watson.breaktimer')
  }

  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  const appInitialized = getAppInitialized()

  if (!appInitialized) {
    setAutoLauch(true)
    setAppInitialized()
  }

  initBreaks()
  createSoundsWindow()

  if (process.env.NODE_ENV !== 'development') {
    // eslint-disable-next-line
    new AppUpdater()
  }
})
