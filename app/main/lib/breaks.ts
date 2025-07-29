import { PowerMonitor } from "electron";
import moment from "moment";
import { Breaks, NOW_KEY } from "../../types/breaks";
import { IpcChannel } from "../../types/ipc";
import {
  Break,
  DayConfig,
  NotificationType,
  Settings,
  SoundType,
} from "../../types/settings";
import { sendIpc } from "./ipc";
import { showNotification } from "./notifications";
import { getSettings } from "./store";
import { buildTray } from "./tray";
import { createBreakWindows } from "./windows";

let powerMonitor: PowerMonitor;
let breaks: Breaks;
let havingBreak = false;
let postponedCount = 0;
let idleStart: Date | null = null;
let lockStart: Date | null = null;
let lastTick: Date | null = null;

export function getBreaks(): Breaks {
  return breaks;
}

export function getBreakLength(): Date {
  return getNextBreak().len;
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

function getBreakSeconds(b: Break): number {
  return getSeconds(new Date(b.frequency));
}

export function getNextBreak(): Break {
  const settings: Settings = getSettings();

  let minDiff = Infinity;
  let nextBreakName = "";
  const now = moment();
  for (const [name, breakTime] of Object.entries(breaks)) {
    const diff = breakTime.diff(now, "seconds");
    if (diff < minDiff) {
      minDiff = diff;
      nextBreakName = name;
    }
  }
  if (!nextBreakName) {
    return settings.breaks[0];
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return settings.breaks.find((i) => i.name === nextBreakName)!;
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

export function createBreak(b: Break, isPostpone = false): void {
  if (idleStart) {
    createIdleNotification();
    idleStart = null;
    postponedCount = 0;
  }

  const freq = new Date(isPostpone ? b.postponeLength : b.frequency);
  const breakTimeCandidate = moment()
    .add(freq.getHours(), "hours")
    .add(freq.getMinutes(), "minutes")
    .add(freq.getSeconds(), "seconds");

  if (!breaks || !Object.keys(breaks).length) {
    breaks = { [b.name]: breakTimeCandidate };
  } else {
    breaks[b.name] = breakTimeCandidate;
  }

  buildTray();
}

export function endPopupBreak(b: Break): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createBreak(b);
  havingBreak = false;
  postponedCount = 0;
}

export function getAllowPostpone(): boolean {
  const nextBreak = getNextBreak();
  return !nextBreak.postponeLimit || postponedCount < nextBreak.postponeLimit;
}

export function postponeBreak(): void {
  postponedCount++;
  havingBreak = false;
  const nextBreak = getNextBreak();
  createBreak(nextBreak, true);
}

function doBreak(b: Break): void {
  havingBreak = true;

  const settings: Settings = getSettings();

  if (b.notificationType === NotificationType.Notification) {
    showNotification(b.title, b.message);
    if (settings.soundType !== SoundType.None) {
      sendIpc(IpcChannel.SoundStartPlay, b.soundType);
    }
    havingBreak = false;
    createBreak(b);
  }

  if (b.notificationType === NotificationType.Popup) {
    createBreakWindows(b);
  }
}

export function checkInWorkingHours(): boolean {
  const settings: Settings = getSettings();

  if (!settings.workingHoursEnabled) {
    return true;
  }

  const now = moment();
  const currentMinutes = now.hours() * 60 + now.minutes();
  const dayOfWeek = now.day();

  const dayMap: { [key: number]: DayConfig["key"] } = {
    0: "workingHoursSunday",
    1: "workingHoursMonday",
    2: "workingHoursTuesday",
    3: "workingHoursWednesday",
    4: "workingHoursThursday",
    5: "workingHoursFriday",
    6: "workingHoursSaturday",
  };

  const todaySettings = settings[dayMap[dayOfWeek]];

  if (!todaySettings.enabled) {
    return false;
  }

  return todaySettings.ranges.some(
    (range) =>
      currentMinutes >= range.fromMinutes && currentMinutes <= range.toMinutes
  );
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

function checkBreak(b: Break): void {
  const now = moment();

  if (breaks[b.name] !== null && now > breaks[b.name]) {
    doBreak(b);
  }
}

export function startBreakNow(): void {
  breaks[NOW_KEY] = moment();
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
    const nextBreak = getNextBreak();
    const breakSeconds = getBreakSeconds(nextBreak);
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
      breaks = {};
    } else if (secondsSinceLastTick > getIdleResetSeconds()) {
      //  If idleStart exists, it means we were idle before the computer slept.
      //  If it doesn't exist, count the computer going unresponsive as the
      //  start of the idle period.
      if (!idleStart) {
        lockStart = null;
        idleStart = lastTick;
      }
      createBreak(nextBreak);
    }

    if (!shouldHaveBreak && !havingBreak && Object.keys(breaks)) {
      if (checkIdle()) {
        idleStart = new Date();
      }
      buildTray();
      return;
    }

    //if (shouldHaveBreak) {
    //  createBreak(nextBreak);
    //  return;
    //}

    if (shouldHaveBreak) {
      checkBreak(nextBreak);
    }
  } finally {
    lastTick = new Date();
  }
}

let tickInterval: NodeJS.Timeout;

export function initBreaks(): void {
  powerMonitor = require("electron").powerMonitor;

  const settings: Settings = getSettings();

  breaks = {};
  if (settings.breaksEnabled) {
    settings.breaks.map((b) => createBreak(b));
  }

  if (tickInterval) {
    clearInterval(tickInterval);
  }

  tickInterval = setInterval(tick, 1000);
}
