import moment, { Moment } from "moment";
import { PowerMonitor } from "electron";
import {
  Settings,
  NotificationType,
  NotificationClick,
} from "../../types/settings";
import { BreakTime } from "../../types/breaks";
import { IpcChannel } from "../../types/ipc";
import { sendIpc } from "./ipc";
import { getSettings } from "./store";
import { buildTray } from "./tray";
import { showNotification } from "./notifications";
import { createBreakWindows } from "./windows";

let powerMonitor: PowerMonitor;
let breakTime: BreakTime = null;
let havingBreak = false;
let postponedCount = 0;
let idleStart: Date | null = null;
let lockStart: Date | null = null;
let lastTick: Date | null = null;

export function getBreakTime(): BreakTime {
  return breakTime;
}

export function getBreakEndTime(): BreakTime {
  if (!breakTime) {
    return null;
  }

  const settings: Settings = getSettings();
  const length = new Date(settings.breakLength);

  return moment(breakTime)
    .add(length.getHours(), "hours")
    .add(length.getMinutes(), "minutes")
    .add(length.getSeconds(), "seconds");
}

function zeroPad(n: number) {
  const nStr = String(n);
  return nStr.length === 1 ? `0${nStr}` : nStr;
}

function getSeconds(date: Date): number {
  return (
    date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds() || 1
  ); // can't be 0
}

function getIdleResetSeconds(): number {
  const settings: Settings = getSettings();
  return getSeconds(new Date(settings.idleResetLength));
}

function getBreakSeconds(): number {
  const settings: Settings = getSettings();
  return getSeconds(new Date(settings.breakFrequency));
}

function createIdleNotification() {
  const settings: Settings = getSettings();

  if (!settings.idleResetEnabled || idleStart === null) {
    return;
  }

  let idleSeconds = Number(((+new Date() - +idleStart) / 1000).toFixed(0));
  let idleMinutes = 0;
  let idleHours = 0;

  if (idleSeconds > 60) {
    idleMinutes = Math.floor(idleSeconds / 60);
    idleSeconds -= idleMinutes * 60;
  }

  if (idleMinutes > 60) {
    idleHours = Math.floor(idleMinutes / 60);
    idleMinutes -= idleHours * 60;
  }

  if (settings.idleResetNotification) {
    showNotification(
      "Break countdown reset",
      `Idle for ${zeroPad(idleHours)}:${zeroPad(idleMinutes)}:${zeroPad(
        idleSeconds
      )}`
    );
  }
}

export function createBreak(isPostpone = false): void {
  const settings: Settings = getSettings();

  if (idleStart) {
    createIdleNotification();
    idleStart = null;
    postponedCount = 0;
  }

  const freq = new Date(
    isPostpone ? settings.postponeLength : settings.breakFrequency
  );

  breakTime = moment()
    .add(freq.getHours(), "hours")
    .add(freq.getMinutes(), "minutes")
    .add(freq.getSeconds(), "seconds");

  buildTray();
}

function beginPopupBreak(): void {
  const settings: Settings = getSettings();

  // Reset breakTime to now to adjust for the time the warning notification
  // was open
  breakTime = moment();
  createBreakWindows();

  if (settings.gongEnabled) {
    sendIpc(IpcChannel.GongStartPlay);
  }
}

export function endPopupBreak(): void {
  if (breakTime) {
    breakTime = null;
    havingBreak = false;
    postponedCount = 0;

    const settings: Settings = getSettings();

    if (settings.gongEnabled) {
      // For some reason the end gong sounds completely distorted on macOS.
      // Let's just play the start gong again as a workaround for now.
      // sendIpc(IpcChannel.PLAY_END_GONG)
      sendIpc(IpcChannel.GongStartPlay);
    }
  }
}

function doBreak(): void {
  havingBreak = true;

  const settings: Settings = getSettings();

  if (settings.notificationType === NotificationType.Notification) {
    showNotification(settings.breakTitle, settings.breakMessage);
    if (settings.gongEnabled) {
      sendIpc(IpcChannel.GongStartPlay);
    }
    havingBreak = false;
    createBreak();
  }

  if (settings.notificationType === NotificationType.Popup) {
    const breakTimeout = setTimeout(beginPopupBreak, 5000);

    let body = "";

    const allowSkip = settings.notificationClick === NotificationClick.Skip;
    const allowPostpone =
      settings.notificationClick === NotificationClick.Postpone &&
      (!settings.postponeLimit || postponedCount < settings.postponeLimit);

    if (allowSkip) {
      body = "Click to skip";
    } else if (allowPostpone) {
      body = "Click to postpone";
    }

    showNotification("Break about to start...", body, (): void => {
      if (allowSkip) {
        clearTimeout(breakTimeout);
        breakTime = null;
        havingBreak = false;
      } else if (allowPostpone) {
        postponedCount++;
        clearTimeout(breakTimeout);
        havingBreak = false;
        createBreak(true);
      }
    });
  }
}

interface Days {
  0: boolean;
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
  6: boolean;
}

export function checkInWorkingHours(): boolean {
  const settings: Settings = getSettings();

  if (!settings.workingHoursEnabled) {
    return true;
  }

  const now = moment();

  const days: Days = {
    0: settings.workingHoursSunday,
    1: settings.workingHoursMonday,
    2: settings.workingHoursTuesday,
    3: settings.workingHoursWednesday,
    4: settings.workingHoursThursday,
    5: settings.workingHoursFriday,
    6: settings.workingHoursSaturday,
  };

  const isWorkingDay = days[now.day() as keyof Days];

  if (!isWorkingDay) {
    return false;
  }

  let hoursFrom: Date | Moment = new Date(settings.workingHoursFrom);
  let hoursTo: Date | Moment = new Date(settings.workingHoursTo);
  hoursFrom = moment()
    .set("hours", hoursFrom.getHours())
    .set("minutes", hoursFrom.getMinutes())
    .set("seconds", 0);
  hoursTo = moment()
    .set("hours", hoursTo.getHours())
    .set("minutes", hoursTo.getMinutes())
    .set("seconds", 0);

  if (now < hoursFrom) {
    return false;
  }

  if (now > hoursTo) {
    return false;
  }

  return true;
}

enum IdleState {
  Active = "active",
  Idle = "idle",
  Locked = "locked",
  Unknown = "unknown",
}

export function checkIdle(): boolean {
  const settings: Settings = getSettings();

  const state: IdleState = powerMonitor.getSystemIdleState(
    getIdleResetSeconds()
  ) as IdleState;

  if (state === IdleState.Locked) {
    if (!lockStart) {
      lockStart = new Date();
      return false;
    } else {
      const lockSeconds = Number(
        ((+new Date() - +lockStart) / 1000).toFixed(0)
      );
      return lockSeconds > getIdleResetSeconds();
    }
  }

  lockStart = null;

  if (!settings.idleResetEnabled) {
    return false;
  }

  return state === IdleState.Idle;
}

function checkShouldHaveBreak(): boolean {
  const settings: Settings = getSettings();
  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();

  return !havingBreak && settings.breaksEnabled && inWorkingHours && !idle;
}

function checkBreak(): void {
  const now = moment();

  if (breakTime !== null && now > breakTime) {
    doBreak();
  }
}

export function startBreakNow(): void {
  breakTime = moment();
}

function tick(): void {
  try {
    const shouldHaveBreak = checkShouldHaveBreak();

    // This can happen if the computer is put to sleep. In this case, we want
    // to skip the break if the time the computer was unresponsive was greater
    // than the idle reset.
    const secondsSinceLastTick = lastTick
      ? Math.abs(+new Date() - +lastTick) / 1000
      : 0;
    const breakSeconds = getBreakSeconds();
    const lockSeconds = lockStart && Math.abs(+new Date() - +lockStart) / 1000;

    if (lockStart && lockSeconds !== null && lockSeconds > breakSeconds) {
      // The computer has been locked for longer than the break period. In this
      // case, it's not particularly helpful to show an idle reset
      // notification, so unset idle start
      idleStart = null;
      lockStart = null;
    } else if (secondsSinceLastTick > breakSeconds) {
      // The computer has been slept for longer than the break period. In this
      // case, it's not particularly helpful to show an idle reset
      // notification, so just reset the break
      lockStart = null;
      breakTime = null;
    } else if (secondsSinceLastTick > getIdleResetSeconds()) {
      //  If idleStart exists, it means we were idle before the computer slept.
      //  If it doesn't exist, count the computer going unresponsive as the
      //  start of the idle period.
      if (!idleStart) {
        lockStart = null;
        idleStart = lastTick;
      }
      createBreak();
    }

    if (!shouldHaveBreak && !havingBreak && breakTime) {
      if (checkIdle()) {
        idleStart = new Date();
      }
      breakTime = null;
      buildTray();
      return;
    }

    if (shouldHaveBreak && !breakTime) {
      createBreak();
      return;
    }

    if (shouldHaveBreak) {
      checkBreak();
    }
  } finally {
    lastTick = new Date();
  }
}

let tickInterval: NodeJS.Timeout;

export function initBreaks(): void {
  powerMonitor = require("electron").powerMonitor;

  const settings: Settings = getSettings();

  if (settings.breaksEnabled) {
    createBreak();
  }

  if (tickInterval) {
    clearInterval(tickInterval);
  }

  tickInterval = setInterval(tick, 1000);
}
