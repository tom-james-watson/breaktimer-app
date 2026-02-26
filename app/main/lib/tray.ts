import { app, dialog, Menu, Tray } from "electron";
import log from "electron-log";
import moment from "moment";
import path from "path";
import packageJson from "../../../package.json";
import { translate } from "../../i18n";
import { Settings, UiLanguage } from "../../types/settings";
import {
  checkIdle,
  checkInWorkingHours,
  getBreakTime,
  isHavingBreak,
  startBreakNow,
} from "./breaks";
import {
  getDisableEndTime,
  getSettings,
  setDisableEndTime,
  setSettings,
} from "./store";
import { closeBreakWindows, createSettingsWindow } from "./windows";

let tray: Tray;
let lastMinsLeft = 0;

const rootPath = path.dirname(app.getPath("exe"));
const resourcesPath =
  process.platform === "darwin"
    ? path.resolve(rootPath, "..", "Resources")
    : rootPath;

function checkDisableTimeout() {
  const disableEndTime = getDisableEndTime();

  if (disableEndTime && Date.now() >= disableEndTime) {
    setDisableEndTime(null);
    const settings = getSettings();
    setSettings({ ...settings, breaksEnabled: true });
    buildTray();
  }
}

function getDisableTimeRemaining(language: UiLanguage): string {
  const disableEndTime = getDisableEndTime();
  if (!disableEndTime) {
    return "";
  }

  const remainingMs = disableEndTime - Date.now();
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingDisplayMinutes = remainingMinutes % 60;

  if (remainingMinutes < 1) {
    return translate(language, "tray.disableTime.lessThanMinute");
  } else if (remainingHours > 0) {
    return translate(language, "tray.disableTime.hoursMinutes", {
      hours: remainingHours,
      minutes: remainingDisplayMinutes,
    });
  } else {
    return translate(language, "tray.disableTime.minutes", {
      minutes: remainingMinutes,
    });
  }
}

export function buildTray(): void {
  if (!tray) {
    let imgPath;

    if (process.platform === "darwin") {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/tray-IconTemplate.png"
          : path.join(resourcesPath, "tray", "tray-IconTemplate.png");
    } else {
      imgPath =
        process.env.NODE_ENV === "development"
          ? "resources/tray/icon.png"
          : path.join(app.getAppPath(), "..", "tray", "icon.png");
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
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(settings.language, key, params);
  const breaksEnabled = settings.breaksEnabled;

  const setBreaksEnabled = (breaksEnabled: boolean): void => {
    if (breaksEnabled) {
      log.info("Enabled breaks");
      setDisableEndTime(null);
    } else if (isHavingBreak()) {
      closeBreakWindows();
    }

    settings = getSettings();
    setSettings({ ...settings, breaksEnabled });
    buildTray();
  };

  const disableIndefinitely = (): void => {
    log.info("Disabled breaks indefinitely");
    setBreaksEnabled(false);
  };

  const disableBreaksFor = (duration: number): void => {
    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    const displayMinutes = minutes % 60;

    if (hours > 0) {
      log.info(`Disabled breaks for ${hours}h${displayMinutes}m`);
    } else {
      log.info(`Disabled breaks for ${minutes}m`);
    }

    setBreaksEnabled(false);
    const endTime = Date.now() + duration;
    setDisableEndTime(endTime);
    buildTray();
  };

  const createAboutWindow = (): void => {
    dialog.showMessageBox({
      title: t("tray.about.title"),
      type: "info",
      message: `BreakTimer`,
      detail: t("tray.about.detail", { version: packageJson.version }),
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
  const havingBreak = isHavingBreak();
  const minsLeft = breakTime?.diff(moment(), "minutes");

  let nextBreak = "";

  if (minsLeft !== undefined) {
    if (minsLeft > 1) {
      nextBreak = t("tray.nextBreak.inMinutes", { minutes: minsLeft });
    } else if (minsLeft === 1) {
      nextBreak = t("tray.nextBreak.inOneMinute");
    } else {
      nextBreak = t("tray.nextBreak.lessThanMinute");
    }
  }

  const disableEndTime = getDisableEndTime();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: nextBreak,
      visible:
        breakTime !== null &&
        inWorkingHours &&
        settings.breaksEnabled &&
        !havingBreak,
      enabled: false,
    },
    {
      label: t("tray.disabledFor", {
        time: getDisableTimeRemaining(settings.language),
      }),
      visible: disableEndTime !== null && !breaksEnabled,
      enabled: false,
    },
    {
      label: t("tray.outsideWorkingHours"),
      visible: !inWorkingHours,
      enabled: false,
    },
    {
      label: t("tray.idle"),
      visible: idle,
      enabled: false,
    },
    { type: "separator" },
    {
      label: t("tray.enable"),
      click: setBreaksEnabled.bind(null, true),
      visible: !breaksEnabled,
    },
    {
      label: t("tray.disable"),
      submenu: [
        { label: t("tray.disable.indefinitely"), click: disableIndefinitely },
        {
          label: t("tray.disable.thirtyMinutes"),
          click: () => disableBreaksFor(30 * 60 * 1000),
        },
        {
          label: t("tray.disable.oneHour"),
          click: () => disableBreaksFor(60 * 60 * 1000),
        },
        {
          label: t("tray.disable.twoHours"),
          click: () => disableBreaksFor(2 * 60 * 60 * 1000),
        },
        {
          label: t("tray.disable.fourHours"),
          click: () => disableBreaksFor(4 * 60 * 60 * 1000),
        },
        {
          label: t("tray.disable.restOfDay"),
          click: () => {
            const now = new Date();
            const endOfDay = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
            );
            disableBreaksFor(endOfDay.getTime() - now.getTime());
          },
        },
      ],
      visible: breaksEnabled,
    },
    {
      label: t("tray.startBreakNow"),
      visible: breakTime !== null && inWorkingHours && !havingBreak,
      click: () => {
        log.info("Start break now selected");
        startBreakNow();
      },
    },
    { type: "separator" },
    { label: t("tray.settings"), click: createSettingsWindow },
    { label: t("tray.about"), click: createAboutWindow },
    { label: t("tray.quit"), click: quit },
  ]);

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu);
}

export function initTray(): void {
  buildTray();
  let lastDisableText = getDisableTimeRemaining(getSettings().language);

  setInterval(() => {
    checkDisableTimeout();

    const currentDisableText = getDisableTimeRemaining(getSettings().language);
    if (currentDisableText !== lastDisableText) {
      buildTray();
      lastDisableText = currentDisableText;
    }

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
