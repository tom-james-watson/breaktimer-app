/**
 * This preload script is run when browser windows are created and allows us to
 * safely expose node/electron APIs to the renderer process.
 *
 * See https://www.electronjs.org/docs/tutorial/context-isolation for more
 * information.
 */

const { contextBridge, ipcRenderer } = require("electron");

process.once("loaded", () => {
  contextBridge.exposeInMainWorld("processEnv", { ...process.env });
  contextBridge.exposeInMainWorld("ipcRenderer", {
    invokeGetBreakLength: () => {
      return ipcRenderer.invoke("BREAK_LENGTH_GET");
    },
    invokeGetSettings: () => {
      return ipcRenderer.invoke("SETTINGS_GET");
    },
    invokeGongEndPlay: () => {
      return ipcRenderer.invoke("GONG_END_PLAY");
    },
    invokeGongStartPlay: () => {
      return ipcRenderer.invoke("GONG_START_PLAY");
    },
    invokeSetSettings: (settings) => {
      return ipcRenderer.invoke("SETTINGS_SET", settings);
    },
    onPlayEndGong: (cb) => {
      ipcRenderer.on("GONG_END_PLAY", cb);
    },
    onPlayStartGong: (cb) => {
      ipcRenderer.on("GONG_START_PLAY", cb);
    },
  });
});
