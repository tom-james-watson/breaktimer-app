import Store from 'electron-store'
import {Settings, NotificationType} from '../../types/settings'

const defaultSettings: Settings = {
  breaksEnabled: true,
  notificationType: NotificationType.Popup,
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
  skipBreakEnabled: true,
  postponeBreakEnabled: true
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
  return store.set({settings})
}
