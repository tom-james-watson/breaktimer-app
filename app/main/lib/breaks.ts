import moment, {Moment} from 'moment'
import {Settings} from '../../types/settings'
import {BreakTime} from '../../types/breaks'
import {getSettings} from './store'
import {buildTray} from './tray'

let breakTime: BreakTime = null
let havingBreak = false

export function getBreakTime(): BreakTime {
  return breakTime
}

function createBreak() {
  const settings: Settings = getSettings()
  const freq = new Date(settings.breakFrequency)

  breakTime = moment()
    .add(freq.getHours(), 'hours')
    .add(freq.getMinutes(), 'minutes')

  buildTray()
}

function checkInWorkingHours(): boolean {
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

function checkShouldHaveBreak(): boolean {
  const settings: Settings = getSettings()
  const inWorkingHours = checkInWorkingHours()

  return !havingBreak && settings.breaksEnabled && inWorkingHours
}

function checkBreak(): void {
  const now = moment()

  console.log({
    now: now.toISOString(),
    breakTime: breakTime.toISOString()
  })

  if (now > breakTime) {
    // TODO - lauch break window / notification
    // Create break window and set havingBreak to true. Set it back to false
    // when window closes and a new break should be created automatically
    console.log('BREAK TIME')
    createBreak()
  }
}

function tick(): void {
  if (!breakTime) {
    return
  }

  const shouldHaveBreak = checkShouldHaveBreak()

  // TODO:
  // - touch a "last seen" - if it's been more than x mins then the computer
  //   has been asleep - createBreak
  // - monitor for idle - https://electronjs.org/docs/api/power-monitor#powermonitorgetsystemidletime

  if (!shouldHaveBreak && breakTime) {
    breakTime = null
    buildTray()
    return
  }

  if (shouldHaveBreak && !breakTime) {
    createBreak()
    return
  }

  checkBreak()
}

setInterval(tick, 1000)

export function initBreaks(): void {
  const settings: Settings = getSettings()

  if (settings.breaksEnabled) {
    createBreak()
  }
}
