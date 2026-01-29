import { PowerMonitor } from "electron";
import log from "electron-log";
import moment from "moment";
import { ActiveBreak, BreakTime } from "../../types/breaks";
import { IpcChannel } from "../../types/ipc";
import {
  BreakSchedule,
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

// Helper function to strip HTML tags from text
function stripHtml(html: string): string {
  // First convert <br> tags to spaces
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

let powerMonitor: PowerMonitor;
let breakTimes: Record<string, BreakTime> = {};
let havingBreak = false;
let postponedCount = 0;
let idleStart: Date | null = null;
let lockStart: Date | null = null;
let lastTick: Date | null = null;
let startedFromTray = false;
let activeBreak: ActiveBreak | null = null;
let breakEndedByPostpone = false;

let lastCompletedBreakTime: Date = new Date();
let currentBreakStartTime: Date | null = null;
let hasSkippedOrSnoozedSinceLastBreak = false;

export function getBreakTime(): BreakTime {
  return getNextBreakTime();
}

export function getActiveBreak(): ActiveBreak | null {
  return activeBreak;
}

export function getBreakLengthSeconds(): number {
  if (activeBreak) {
    return activeBreak.lengthSeconds;
  }

  const settings: Settings = getSettings();
  const firstSchedule = settings.breakSchedules.find((schedule) => schedule);
  return firstSchedule ? firstSchedule.lengthSeconds : 0;
}

export function getTimeSinceLastBreak(): number | null {
  if (!hasSkippedOrSnoozedSinceLastBreak) {
    return null;
  }

  const now = moment();
  const lastBreak = moment(lastCompletedBreakTime);
  return now.diff(lastBreak, "seconds");
}

export function startBreakTracking(): void {
  currentBreakStartTime = new Date();
}

export function completeBreakTracking(breakDurationMs: number): void {
  if (!currentBreakStartTime) return;

  const requiredSeconds = getBreakLengthSeconds();
  const requiredDurationMs = requiredSeconds * 1000;
  const halfRequiredDuration = requiredDurationMs / 2;

  if (breakDurationMs >= halfRequiredDuration) {
    lastCompletedBreakTime = new Date();
    hasSkippedOrSnoozedSinceLastBreak = false;
    log.info(
      `Break completed [duration=${Math.round(
        breakDurationMs / 1000,
      )}s] [required=${requiredSeconds}s]`,
    );
  } else {
    log.info(
      `Break too short [duration=${Math.round(
        breakDurationMs / 1000,
      )}s] [required=${requiredSeconds}s]`,
    );
  }

  currentBreakStartTime = null;
}

function zeroPad(n: number) {
  const nStr = String(n);
  return nStr.length === 1 ? `0${nStr}` : nStr;
}

function getSecondsFromSettings(seconds: number): number {
  return seconds || 1; // can't be 0
}

function getEnabledSchedules(settings: Settings): BreakSchedule[] {
  return settings.breakSchedules.filter((schedule) => schedule.enabled);
}

function getScheduleById(
  settings: Settings,
  scheduleId: string,
): BreakSchedule | undefined {
  return settings.breakSchedules.find((schedule) => schedule.id === scheduleId);
}

export function getNextBreakInfo(): {
  schedule: BreakSchedule;
  time: moment.Moment;
} | null {
  const settings: Settings = getSettings();
  const schedules = getEnabledSchedules(settings);

  let next: { schedule: BreakSchedule; time: moment.Moment } | null = null;

  for (const schedule of schedules) {
    const nextTime = breakTimes[schedule.id];
    if (!nextTime) continue;
    if (!next || nextTime.isBefore(next.time)) {
      next = { schedule, time: nextTime };
    }
  }

  return next;
}

function getNextBreakTime(): BreakTime {
  const next = getNextBreakInfo();
  return next ? next.time : null;
}

function scheduleAllNextBreaks(fromTime?: moment.Moment): void {
  const settings: Settings = getSettings();
  const schedules = getEnabledSchedules(settings);

  for (const schedule of schedules) {
    scheduleNextBreak(schedule.id, { fromTime });
  }
}

function resetOtherSchedulesFrom(
  fromTime: moment.Moment,
  activeScheduleId: string,
): void {
  const settings: Settings = getSettings();
  const schedules = getEnabledSchedules(settings).filter(
    (schedule) => schedule.id !== activeScheduleId,
  );

  for (const schedule of schedules) {
    scheduleNextBreak(schedule.id, { fromTime });
  }
}

function hasScheduledBreaks(): boolean {
  return Object.values(breakTimes).some((time) => time !== null);
}

function clearScheduledBreaks(): void {
  breakTimes = {};
}

function ensureScheduledBreaks(): void {
  const settings: Settings = getSettings();
  const schedules = getEnabledSchedules(settings);
  const scheduleIds = new Set(schedules.map((schedule) => schedule.id));

  for (const schedule of schedules) {
    if (!breakTimes[schedule.id]) {
      scheduleNextBreak(schedule.id);
    }
  }

  for (const scheduleId of Object.keys(breakTimes)) {
    if (!scheduleIds.has(scheduleId)) {
      delete breakTimes[scheduleId];
    }
  }
}

function getIdleResetSeconds(): number {
  const settings: Settings = getSettings();
  return getSecondsFromSettings(settings.idleResetLengthSeconds);
}

function getBreakSeconds(): number {
  const settings: Settings = getSettings();
  const schedules = getEnabledSchedules(settings);
  if (schedules.length === 0) {
    return getSecondsFromSettings(0);
  }

  const minFrequency = Math.min(
    ...schedules.map((schedule) => schedule.frequencySeconds),
  );
  return getSecondsFromSettings(minFrequency);
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
      "Break automatically detected",
      `Away for ${zeroPad(idleHours)}:${zeroPad(idleMinutes)}:${zeroPad(
        idleSeconds,
      )}`,
    );
  }
}

export function scheduleNextBreak(
  scheduleId: string,
  options: { isPostpone?: boolean; fromTime?: moment.Moment } = {},
): void {
  const settings: Settings = getSettings();
  const schedule = getScheduleById(settings, scheduleId);

  if (!schedule || !schedule.enabled) {
    breakTimes[scheduleId] = null;
    return;
  }

  if (idleStart) {
    createIdleNotification();
    idleStart = null;
    postponedCount = 0;

    lastCompletedBreakTime = new Date();
    hasSkippedOrSnoozedSinceLastBreak = false;
    log.info("Break auto-detected via idle reset");
  }

  const seconds = options.isPostpone
    ? settings.postponeLengthSeconds
    : schedule.frequencySeconds;

  const baseTime = options.fromTime ?? moment();
  breakTimes[schedule.id] = baseTime.clone().add(seconds, "seconds");

  log.info(
    `Scheduling next break [scheduleId=${schedule.id}] [isPostpone=${options.isPostpone ?? false}] [seconds=${seconds}] [postponeLength=${settings.postponeLengthSeconds}] [frequency=${schedule.frequencySeconds}] [scheduledFor=${breakTimes[schedule.id]?.format("HH:mm:ss")}]`,
  );

  buildTray();
}

export function endPopupBreak(): void {
  log.info("Break ended");
  const now = moment();
  havingBreak = false;
  startedFromTray = false;
  const shouldResetOtherSchedules = !breakEndedByPostpone;

  const activeScheduleId = activeBreak?.scheduleId ?? null;
  if (activeScheduleId) {
    const existingBreakTime = breakTimes[activeScheduleId];

    // If there's no future break scheduled, create a normal break
    if (!existingBreakTime || existingBreakTime <= now) {
      postponedCount = 0;
      breakTimes[activeScheduleId] = null;
      scheduleNextBreak(activeScheduleId);
    }
    // If there's already a future break scheduled (from snooze/skip), keep it
    if (shouldResetOtherSchedules) {
      resetOtherSchedulesFrom(now, activeScheduleId);
    }
  } else if (shouldResetOtherSchedules) {
    scheduleAllNextBreaks(now);
  }

  breakEndedByPostpone = false;
  activeBreak = null;

  buildTray();
}

export function getAllowPostpone(): boolean {
  const settings = getSettings();
  return !settings.postponeLimit || postponedCount < settings.postponeLimit;
}

export function postponeBreak(action = "snoozed"): void {
  if (!activeBreak) {
    return;
  }

  postponedCount++;
  havingBreak = false;
  hasSkippedOrSnoozedSinceLastBreak = true;
  log.info(
    `Break ${action} [count=${postponedCount}] [scheduleId=${activeBreak.scheduleId}]`,
  );

  if (action === "skipped") {
    log.info("Creating break with normal frequency");
    scheduleNextBreak(activeBreak.scheduleId);
  } else {
    log.info("Creating break with postpone length");
    scheduleNextBreak(activeBreak.scheduleId, { isPostpone: true });
  }

  resetOtherSchedulesFrom(moment(), activeBreak.scheduleId);
  breakEndedByPostpone = true;
}

function doBreak(scheduleId: string): void {
  havingBreak = true;
  startBreakTracking();

  const settings: Settings = getSettings();
  const schedule = getScheduleById(settings, scheduleId);

  if (!schedule) {
    log.warn(`Skipping break; schedule not found [scheduleId=${scheduleId}]`);
    havingBreak = false;
    return;
  }

  activeBreak = {
    scheduleId: schedule.id,
    title: schedule.title,
    message: schedule.message,
    lengthSeconds: schedule.lengthSeconds,
  };

  log.info(
    `Break started [type=${settings.notificationType}] [scheduleId=${schedule.id}]`,
  );

  if (settings.notificationType === NotificationType.Notification) {
    showNotification(schedule.title, stripHtml(schedule.message));
    if (settings.soundType !== SoundType.None) {
      sendIpc(
        IpcChannel.SoundStartPlay,
        settings.soundType,
        settings.breakSoundVolume,
      );
    }
    havingBreak = false;
    activeBreak = null;
    scheduleNextBreak(schedule.id);
  }

  if (settings.notificationType === NotificationType.Popup) {
    createBreakWindows();
  }

  buildTray();
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
      currentMinutes >= range.fromMinutes && currentMinutes <= range.toMinutes,
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
    getIdleResetSeconds(),
  ) as IdleState;

  if (state === IdleState.Locked) {
    if (!lockStart) {
      lockStart = new Date();
      return false;
    } else {
      const lockSeconds = Number(
        ((+new Date() - +lockStart) / 1000).toFixed(0),
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

export function isHavingBreak(): boolean {
  return havingBreak;
}

function checkShouldHaveBreak(): boolean {
  const settings: Settings = getSettings();
  const inWorkingHours = checkInWorkingHours();
  const idle = checkIdle();
  const hasSchedules = getEnabledSchedules(settings).length > 0;

  return (
    !havingBreak &&
    settings.breaksEnabled &&
    inWorkingHours &&
    !idle &&
    hasSchedules
  );
}

function checkBreak(): void {
  const now = moment();
  const nextBreak = getNextBreakInfo();

  if (nextBreak && now > nextBreak.time) {
    doBreak(nextBreak.schedule.id);
  }
}

export function startBreakNow(scheduleId?: string): void {
  const settings: Settings = getSettings();
  const nextScheduleId = scheduleId ?? getNextBreakInfo()?.schedule.id;
  const fallbackScheduleId =
    nextScheduleId ?? getEnabledSchedules(settings)[0]?.id;

  if (!fallbackScheduleId) {
    return;
  }

  startedFromTray = true;
  doBreak(fallbackScheduleId);
}

export function wasStartedFromTray(): boolean {
  return startedFromTray;
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
      clearScheduledBreaks();
    } else if (secondsSinceLastTick > getIdleResetSeconds()) {
      //  If idleStart exists, it means we were idle before the computer slept.
      //  If it doesn't exist, count the computer going unresponsive as the
      //  start of the idle period.
      if (!idleStart) {
        lockStart = null;
        idleStart = lastTick;
      }
      scheduleAllNextBreaks();
    }

    if (!shouldHaveBreak && !havingBreak && hasScheduledBreaks()) {
      if (checkIdle()) {
        const idleResetSeconds = getIdleResetSeconds();
        // Calculate when idle actually started by subtracting idle duration
        idleStart = new Date(Date.now() - idleResetSeconds * 1000);
      }
      clearScheduledBreaks();
      buildTray();
      return;
    }

    if (shouldHaveBreak) {
      ensureScheduledBreaks();
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
    clearScheduledBreaks();
    scheduleAllNextBreaks();
  } else {
    clearScheduledBreaks();
  }

  if (tickInterval) {
    clearInterval(tickInterval);
  }

  tickInterval = setInterval(tick, 1000);
}
