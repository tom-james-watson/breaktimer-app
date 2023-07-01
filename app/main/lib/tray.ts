import path from "path";
import moment from "moment";
import { app, dialog, Menu, Tray } from "electron";
import packageJson from "../../../package.json";
import { Settings } from "../../types/settings";
import { getSettings, setSettings } from "./store";
import { createSettingsWindow } from "./windows";
import {
  getBreakTime,
  checkInWorkingHours,
  checkIdle,
  startBreakNow,
  createBreak,
} from "./breaks";

let tray: Tray;
let lastMinsLeft = 0;

export function buildTray(): void {
  if (!tray) {
    let imgPath;
    if (process.platform === "darwin") {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/tray-IconTemplate.png"
          : path.join(
              process.resourcesPath,
              "app/resources/tray/tray-IconTemplate.png"
            );
    } else {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/icon.png"
          : path.join(process.resourcesPath, "app/resources/tray/icon.png");
    }
    tray = new Tray(imgPath);

    // On windows, context menu will not show on left click by default
    if (process.platform === "win32") {
      tray.on("click", () => {
        tray.popUpContextMenu();
      });
    }
  }

  let settings: Settings = getSettings();
  const breaksEnabled = settings.breaksEnabled;

  const setBreaksEnabled = (breaksEnabled: boolean): void => {
    settings = getSettings();
    setSettings({ ...settings, breaksEnabled });
    buildTray();
  };

  const createAboutWindow = (): void => {
    dialog.showMessageBox({
      title: "关于",
      type: "info",
      message: `BreakTimer`,
      detail: `版本： ${packageJson.version}\n\n官网:\nhttps://breaktimer.app\n\n源代码:\nhttps://github.com/tom-james-watson/breaktimer-app\n\nDistributed under GPL-3.0-or-later license.`,
    });
  };

  const quit = (): void => {
    setTimeout(() => {
      app.exit(0);
    });
  };

  const breakTime = getBreakTime();
  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();
  const minsLeft = breakTime?.diff(moment(), "minutes");

  let nextBreak = "";

  if (minsLeft !== undefined) {
    if (minsLeft > 1) {
      nextBreak = `下次休息在 ${minsLeft} 分钟后`;
    } else if (minsLeft === 1) {
      nextBreak = `下次休息在1分钟后`;
    } else {
      nextBreak = `下一次休息在不到1分钟内`;
    }
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: nextBreak,
      visible: breakTime !== null && inWorkingHours,
      enabled: false,
    },
    {
      label: `未在工作时间`,
      visible: !inWorkingHours,
      enabled: false,
    },
    {
      label: `Idle`,
      visible: idle,
      enabled: false,
    },
    { type: "separator" },
    {
      label: breaksEnabled ? "禁用" : "开启",
      click: setBreaksEnabled.bind(null, !breaksEnabled),
    },
    {
      label: "现在开始休息",
      visible: breakTime !== null && inWorkingHours,
      click: startBreakNow,
    },
    {
      label: "重置休息时间",
      visible: breakTime !== null && inWorkingHours,
      click: createBreak.bind(null, false),
    },
    { type: "separator" },
    { label: "设置", click: createSettingsWindow },
    { label: "关于", click: createAboutWindow },
    { label: "退出", click: quit },
  ]);

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu);
}

export function initTray(): void {
  buildTray();
  setInterval(() => {
    const breakTime = getBreakTime();
    if (breakTime === null) {
      return;
    }

    const minsLeft = breakTime.diff(moment(), "minutes");
    if (minsLeft !== lastMinsLeft) {
      buildTray();
      lastMinsLeft = minsLeft;
    }
  }, 5000);
}
