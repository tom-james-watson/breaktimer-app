import moment, {Moment} from 'moment'
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

function createBreak(isPostpone=false) {
  const settings: Settings = getSettings()

  const freq = new Date(
    isPostpone ? settings.postponeLength : settings.breakFrequency
  )

  breakTime = moment()
    .add(freq.getHours(), 'hours')
    .add(freq.getMinutes(), 'minutes')
    .add(freq.getSeconds(), 'seconds')

  buildTray()
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

export function clearBreakTime(): void {
  if (breakTime) {
    breakTime = null
    havingBreak = false

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
    const breakTimeout = setTimeout(() => {
      // Reset breakTime to now to adjust for the time the warning notification
      // was open
      breakTime = moment()
      createBreakWindows()

      if (settings.gongEnabled) {
        sendIpc(IpcChannel.PLAY_START_GONG)
      }
    }, 5000)

    let body: string | null = null

    if (settings.notificationClick === NotificationClick.Skip) {
      body = 'Click to skip'
    } else if (settings.notificationClick === NotificationClick.Postpone) {
      body = 'Click to postpone'
    }

    showNotification(
      'Break about to start...',
      body,
      (): void => {
        if (settings.notificationClick === NotificationClick.Skip) {
          clearTimeout(breakTimeout)
          breakTime = null
          havingBreak = false
        } else if (settings.notificationClick === NotificationClick.Postpone) {
          clearTimeout(breakTimeout)
          havingBreak = false
          createBreak(true)
        }
      }
    )
  }
}

function checkShouldHaveBreak(): boolean {
  const settings: Settings = getSettings()
  const inWorkingHours = checkInWorkingHours()

  return !havingBreak && settings.breaksEnabled && inWorkingHours
}

function checkBreak(): void {
  const now = moment()

  if (now > breakTime) {
    doBreak()
  }
}

function tick(): void {
  const shouldHaveBreak = checkShouldHaveBreak()

  // TODO:
  // - touch a "last seen" - if it's been more than x mins then the computer
  //   has been asleep - createBreak
  // - monitor for idle - https://electronjs.org/docs/api/power-monitor#powermonitorgetsystemidletime
  // - have a setting for what to do when you click "break about to start" - postpone/skip/nothing

  if (!shouldHaveBreak && !havingBreak && breakTime) {
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
