import Store from 'electron-store'
import {Settings, NotificationType, NotificationClick} from '../../types/settings'
import {initBreaks} from './breaks'

const defaultSettings: Settings = {
  breaksEnabled: true,
  notificationType: NotificationType.Popup,
  notificationClick: NotificationClick.Skip,
  breakFrequency: new Date(0, 0, 0, 0, 28),
  breakLength: new Date(0, 0, 0, 0, 2),
  postponeLength: new Date(0, 0, 0, 0, 3),
  workingHoursEnabled: true,
  workingHoursFrom: new Date(0, 0, 0, 9),
  workingHoursTo: new Date(0, 0, 0, 18),
  workingHoursMonday: true,
  workingHoursTuesday: true,
  workingHoursWednesday: true,
  workingHoursThursday: true,
  workingHoursFriday: true,
  workingHoursSaturday: false,
  workingHoursSunday: false,
  idleResetEnabled: false,
  idleResetLength: new Date(0, 0, 0, 0, 5),
  gongEnabled: true,
  breakTitle: 'Time for a break!',
  breakMessage: 'Rest your eyes. Stretch your legs. Breathe. Relax.',
  backgroundColor: '#16a085',
  textColor: '#ffffff',
  endBreakEnabled: true,
}

const store = new Store<Settings>({
  defaults: {
    settings: defaultSettings
  }
})

export function getSettings(): Settings {
  return Object.assign(defaultSettings, store.get('settings')) as Settings
}

export function setSettings(settings: Settings): void {
  store.set({settings})
  initBreaks()
}
