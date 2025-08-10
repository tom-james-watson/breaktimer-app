import { app, shell } from "electron";
import electronDebug from "electron-debug";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { setAutoLauch } from "./lib/auto-launch";
import { initBreaks } from "./lib/breaks";
import "./lib/ipc";
import { showNotification } from "./lib/notifications";
import { getAppInitialized } from "./lib/store";
import { initTray } from "./lib/tray";
import { createSettingsWindow, createSoundsWindow } from "./lib/windows";

const gotTheLock = app.requestSingleInstanceLock();

app.on("second-instance", (event, commandLine, workingDirectory) => {
  log.info("Second instance detected, opening settings window");
  log.info(`Command line: ${commandLine}`);
  log.info(`Working directory: ${workingDirectory}`);
  createSettingsWindow();
});

app.on("activate", () => {
  log.info("App activated, opening settings window");
  createSettingsWindow();
});

if (!gotTheLock) {
  log.info("App already running");
  app.exit();
}

function getDownloadUrl(): string {
  switch (process.platform) {
    case "win32":
      return "https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.exe";
    case "linux":
      return "https://github.com/tom-james-watson/breaktimer-app/releases/latest";
    default:
      throw new Error("Download URL should not be called for macOS");
  }
}

function shouldAutoInstall(): boolean {
  const isAppImage = process.env.APPIMAGE !== undefined;
  const isMac = process.platform === "darwin";

  return isMac || isAppImage;
}

function checkForUpdates(): void {
  log.info("Checking for updates...");
  autoUpdater.logger = log;

  autoUpdater.on("error", (error) => {
    log.error(`Auto updater error: ${error}`);
  });

  if (shouldAutoInstall()) {
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      log.error(`Unable to run auto updater: ${error}`);
    });
  } else {
    autoUpdater.autoDownload = false;

    autoUpdater.on("update-available", (info) => {
      log.info("Update available:", info);

      const downloadUrl = getDownloadUrl();

      showNotification(
        "Update Available",
        "A new version of BreakTimer is available. Click to download.",
        () => {
          shell.openExternal(downloadUrl).catch((error) => {
            log.error(`Failed to open download URL: ${error}`);
          });
        },
        false,
      );
    });

    autoUpdater.checkForUpdates().catch((error) => {
      log.error(`Unable to check for updates: ${error}`);
    });
  }
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
    // Show settings window on first launch instead of notification
    createSettingsWindow();
    // Don't set app as initialized yet - we'll do that after the user dismisses the modal
  } else {
    // App has been initialized before, don't show settings automatically
  }

  initBreaks();
  initTray();
  createSoundsWindow();

  if (process.env.NODE_ENV !== "development") {
    checkForUpdates();
  }
});
