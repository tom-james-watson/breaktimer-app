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
    invokeBreakPostpone: () => {
      return ipcRenderer.invoke("BREAK_POSTPONE");
    },
    invokeGetAllowPostpone: () => {
      return ipcRenderer.invoke("ALLOW_POSTPONE_GET");
    },
    invokeGetBreakLength: () => {
      return ipcRenderer.invoke("BREAK_LENGTH_GET");
    },
    invokeGetSettings: () => {
      return ipcRenderer.invoke("SETTINGS_GET");
    },
    invokeEndSound: (type, volume) => {
      return ipcRenderer.invoke("SOUND_END_PLAY", type, volume);
    },
    invokeStartSound: (type, volume) => {
      return ipcRenderer.invoke("SOUND_START_PLAY", type, volume);
    },
    invokeSetSettings: (settings) => {
      return ipcRenderer.invoke("SETTINGS_SET", settings);
    },
    onPlayStartSound: (cb) => {
      ipcRenderer.on("SOUND_START_PLAY", (_event, type, volume) => {
        cb(type, volume);  // Pass both type and volume
      });
    },
    onPlayEndSound: (cb) => {
      ipcRenderer.on("SOUND_END_PLAY", (_event, type, volume) => {
        cb(type, volume);  // Pass both type and volume
      });
    },    
  });
});
