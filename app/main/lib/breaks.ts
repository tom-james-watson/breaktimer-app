import moment, {Moment} from 'moment'
import {powerMonitor} from 'electron'
import {Settings, NotificationType, NotificationClick} from '../../types/settings'
import {BreakTime} from '../../types/breaks'
import {IpcChannel} from '../../types/ipc'
import {sendIpc} from './ipc'
import {getSettings} from './store'
import {buildTray} from './tray'
import {showNotification} from './notifications'
import {createBreakWindows} from './windows'

let breakTime: BreakTime = null
let havingBreak = false
let postponedCount = 0
let idleStart: Date = null

export function getBreakTime(): BreakTime {
  return breakTime
}

export function getBreakEndTime(): BreakTime {
  if (!breakTime) {
    return null
  }

  const settings: Settings = getSettings()
  const length = new Date(settings.breakLength)

  return moment(breakTime)
    .add(length.getHours(), 'hours')
    .add(length.getMinutes(), 'minutes')
    .add(length.getSeconds(), 'seconds')
}

function zeroPad(n) {
  n = String(n)
  return n.length === 1 ? `0${n}` : n
}

function createIdleNotification() {
  const settings: Settings = getSettings()

  const now = new Date()

  let idleSeconds = Number(((+now - +idleStart) / 1000).toFixed(0))
  let idleMinutes = 0
  let idleHours = 0

  if (idleSeconds > 60) {
    idleMinutes = Math.floor(idleSeconds / 60)
    idleSeconds -= idleMinutes * 60
  }

  if (idleMinutes > 60) {
    idleHours = Math.floor(idleMinutes / 60)
    idleMinutes -= idleHours * 60
  }

  if (settings.idleResetNotification) {
    showNotification(
      'Break countdown reset',
      `Idle for ${zeroPad(idleHours)}:${zeroPad(idleMinutes)}:${zeroPad(idleSeconds)}`
    )
  }
}

export function createBreak(isPostpone=false) {
  const settings: Settings = getSettings()

  if (idleStart) {
    createIdleNotification()
    idleStart = null
    postponedCount = 0
  }

  const freq = new Date(
    isPostpone ? settings.postponeLength : settings.breakFrequency
  )

  breakTime = moment()
    .add(freq.getHours(), 'hours')
    .add(freq.getMinutes(), 'minutes')
    .add(freq.getSeconds(), 'seconds')

  buildTray()
}

function beginPopupBreak(): void {
  const settings: Settings = getSettings()

  // Reset breakTime to now to adjust for the time the warning notification
  // was open
  breakTime = moment()
  createBreakWindows()

  if (settings.gongEnabled) {
    sendIpc(IpcChannel.PLAY_START_GONG)
  }
}

export function endPopupBreak(): void {
  if (breakTime) {
    breakTime = null
    havingBreak = false
    postponedCount = 0

    const settings: Settings = getSettings()

    if (settings.gongEnabled) {
      // For some reason the end gong sounds completely distorted on macOS.
      // Let's just play the start gong again as a workaround for now.
      // sendIpc(IpcChannel.PLAY_END_GONG)
      sendIpc(IpcChannel.PLAY_START_GONG)
    }
  }
}

function doBreak(): void {
  havingBreak = true

  const settings: Settings = getSettings()

  if (settings.notificationType === NotificationType.Notification) {
    showNotification(
      settings.breakTitle,
      settings.breakMessage
    )
    if (settings.gongEnabled) {
      sendIpc(IpcChannel.PLAY_START_GONG)
    }
    havingBreak = false
    createBreak()
  }

  if (settings.notificationType === NotificationType.Popup) {
    const breakTimeout = setTimeout(beginPopupBreak, 5000)

    let body: string | null = null

    const allowSkip = settings.notificationClick === NotificationClick.Skip
    const allowPostpone = (
      settings.notificationClick === NotificationClick.Postpone &&
      (!settings.postponeLimit || postponedCount < settings.postponeLimit)
    )

    if (allowSkip) {
      body = 'Click to skip'
    } else if (allowPostpone) {
      body = 'Click to postpone'
    }

    showNotification(
      'Break about to start...',
      body,
      (): void => {
        if (allowSkip) {
          clearTimeout(breakTimeout)
          breakTime = null
          havingBreak = false
        } else if (allowPostpone) {
          postponedCount++
          clearTimeout(breakTimeout)
          havingBreak = false
          createBreak(true)
        }
      }
    )
  }
}

export function checkInWorkingHours(): boolean {
  const settings: Settings = getSettings()

  if (!settings.workingHoursEnabled) {
    return true
  }

  const now = moment()

  const days = {
    1: settings.workingHoursMonday,
    2: settings.workingHoursTuesday,
    3: settings.workingHoursWednesday,
    4: settings.workingHoursThursday,
    5: settings.workingHoursFriday,
    6: settings.workingHoursSaturday,
    7: settings.workingHoursSunday,
  }

  const isWorkingDay = days[now.day()]

  if (!isWorkingDay) {
    return false
  }

  let hoursFrom: Date | Moment = new Date(settings.workingHoursFrom)
  let hoursTo: Date | Moment = new Date(settings.workingHoursTo)
  hoursFrom = moment()
    .set('hours', hoursFrom.getHours())
    .set('minutes', hoursFrom.getMinutes())
    .set('seconds', 0)
  hoursTo = moment()
    .set('hours', hoursTo.getHours())
    .set('minutes', hoursTo.getMinutes())
    .set('seconds', 0)

  if (now < hoursFrom) {
    return false
  }

  if (now > hoursTo) {
    return false
  }

  return true
}

enum IdleState {
  Active = "active",
  Idle = "idle",
  Locked = "locked",
  Unknown = "unknown"
}

export function checkIdle(): boolean {
  const settings: Settings = getSettings()
  const idleResetLength = new Date(settings.idleResetLength)
  const idleSeconds = (
    (idleResetLength.getHours() * 60 * 60) +
    (idleResetLength.getMinutes() * 60) +
    (idleResetLength.getSeconds())
  )
  const state: IdleState = powerMonitor.getSystemIdleState(idleSeconds) as IdleState

  return !([IdleState.Active, IdleState.Unknown].includes(state))
}

function checkShouldHaveBreak(): boolean {
  const settings: Settings = getSettings()
  const inWorkingHours = checkInWorkingHours()
  const idle = checkIdle()

  return !havingBreak && settings.breaksEnabled && inWorkingHours && !idle
}

function checkBreak(): void {
  const now = moment()

  if (now > breakTime) {
    doBreak()
  }
}

export function startBreakNow(): void {
  breakTime = moment()
}

function tick(): void {
  const shouldHaveBreak = checkShouldHaveBreak()

  if (!shouldHaveBreak && !havingBreak && breakTime) {
    if (checkIdle()) {
      idleStart = new Date()
    }
    breakTime = null
    buildTray()
    return
  }

  if (shouldHaveBreak && !breakTime) {
    createBreak()
    return
  }

  if (shouldHaveBreak) {
    checkBreak()
  }
}

setInterval(tick, 1000)

export function initBreaks(): void {
  const settings: Settings = getSettings()

  if (settings.breaksEnabled) {
    createBreak()
  }
}
