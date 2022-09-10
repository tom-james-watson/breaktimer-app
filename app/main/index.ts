import "regenerator-runtime/runtime";
import "core-js/stable";
import { app } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { 
  initBreaks,
  startBreakNow,
  createBreak,
} from "./lib/breaks";
import {
  getAppInitialized,
  setAppInitialized,
  setBreaksEnabled,
} from "./lib/store";
import { createSoundsWindow, createSettingsWindow } from "./lib/windows";
import { setAutoLauch } from "./lib/auto-launch";
import { showNotification } from "./lib/notifications";
import { initTray } from "./lib/tray";
import "./lib/ipc";

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  const cliArg = process.argv[process.argv.length - 1];

  if (cliArg === "disable") {
    console.log("breaks disabled");
    setBreaksEnabled(false);
  } else if (cliArg === "enable") {
    console.log("breaks enabled");
    setBreaksEnabled(true);
  } else if (cliArg === "restart") {
    console.log("break period restarted");
    createBreak.bind(null, false);
  } else if (cliArg === "start") {
    console.log("break started");
    startBreakNow();
  } else if (process.platform !== "darwin") {
    console.log("app already open, opening settings");
  } else {
    log.info("app already running");
  }
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
  require("electron-debug")();
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
app.on("window-all-closed", (e: Event) => e.preventDefault());

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
    app.dock.hide();
  }

  const appInitialized = getAppInitialized();

  if (!appInitialized) {
    setAutoLauch(true);
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

app.on("second-instance", (_event: Event, argv: string[]) => {
  const cliArg = argv[argv.length - 1];

  if (cliArg === "disable") {
    log.info("Breaks disabled from cli");
    setBreaksEnabled(false);
  } else if (cliArg === "enable") {
    log.info("Breaks enabled from cli");
    setBreaksEnabled(true);
  } else if (cliArg === "restart") {
    console.log("break period restarted");
    createBreak.bind(null, false);
  } else if (cliArg === "start") {
    console.log("break started");
    startBreakNow();
  } else if (process.platform !== "darwin") {
    log.info("App opened second time, opening settings");
    createSettingsWindow();
  }
});
