import log from "electron-log";
import { platform } from "os";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let windowsFocusAssist: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let windowsQuietHours: any;

if (platform() === "win32") {
  windowsFocusAssist = require("windows-focus-assist");
  windowsQuietHours = require("windows-quiet-hours");
}

export function checkDoNotDisturb(): boolean {
  try {
    if (platform() === "win32" && windowsFocusAssist && windowsQuietHours) {
      let focusAssist = 0;
      try {
        focusAssist = windowsFocusAssist.getFocusAssist().value;
      } catch (e) {
        focusAssist = -1;
      }

      const quietHours = windowsQuietHours.getIsQuietHours();
      return quietHours || (focusAssist !== -1 && focusAssist !== 0);
    }

    // I can't find a stable solution for macOS or linux
    return false;
  } catch (error) {
    log.error(
      "Error checking DND state:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}
