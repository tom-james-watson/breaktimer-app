/**
 * This preload script is run when browser windows are created and allows us to
 * safely expose node/electron APIs to the renderer process.
 *
 * See https://www.electronjs.org/docs/tutorial/context-isolation for more
 * information.
 */

const { contextBridge, ipcRenderer } = require("electron");

console.log("preload");

process.once("loaded", () => {
  console.log("preload loaded");
  contextBridge.exposeInMainWorld("processEnv", { ...process.env });
  contextBridge.exposeInMainWorld("ipcRenderer", {
    invokeGetBreakEndTime: () => {
      return ipcRenderer.invoke("GET_BREAK_END_TIME");
    },
    invokeGetSettings: () => {
      return ipcRenderer.invoke("GET_SETTINGS");
    },
    invokeSetSettings: settings => {
      return ipcRenderer.invoke("SET_SETTINGS", settings);
    },
    onPlayEndGong: cb => {
      ipcRenderer.on("PLAY_END_GONG", cb);
    },
    onPlayStartGong: cb => {
      ipcRenderer.on("PLAY_START_GONG", cb);
    }
  });
});
