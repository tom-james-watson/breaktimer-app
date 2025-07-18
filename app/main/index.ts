import "core-js/stable";
import { app } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import "regenerator-runtime/runtime";
import electronDebug from "electron-debug";
import { setAutoLauch } from "./lib/auto-launch";
import { initBreaks } from "./lib/breaks";
import "./lib/ipc";
import { showNotification } from "./lib/notifications";
import { getAppInitialized, setAppInitialized } from "./lib/store";
import { initTray } from "./lib/tray";
import { createSettingsWindow, createSoundsWindow } from "./lib/windows";

const gotTheLock = app.requestSingleInstanceLock();

app.on("second-instance", () => {
  createSettingsWindow();
});

if (!gotTheLock) {
  log.info("app already running");
  app.exit();
}

function checkForUpdates(): void {
  log.info("Checking for updates...");
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();
}

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  electronDebug();
}

// function installExtensions() {
//   const installer = require('electron-devtools-installer')
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS
//   const extensions = ['REACT_DEVELOPER_TOOLS']
//
//   return Promise.all(
//     extensions.map(name => installer.default(installer[name], forceDownload))
//   ).catch(console.log)
// }

// Don't exit on close all windows - live in tray
app.on("window-all-closed", () => {
  // Pass
});

app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    // Extensions are broken on electron 10
    // await installExtensions()
  }

  // Required for notifications to work on windows
  if (process.platform === "win32") {
    app.setAppUserModelId("com.tomjwatson.breaktimer");
  }

  if (process.platform === "darwin") {
    app.dock?.hide();
  }

  const appInitialized = getAppInitialized();

  if (!appInitialized) {
    if (process.env.NODE_ENV !== "development") {
      setAutoLauch(true);
    }
    showNotification(
      "BreakTimer runs in the background",
      "The app can be accessed via the system tray",
      undefined,
      false
    );
    setAppInitialized();
  }

  initBreaks();
  initTray();
  createSoundsWindow();

  if (process.env.NODE_ENV !== "development" && process.platform !== "win32") {
    checkForUpdates();
  }
});
