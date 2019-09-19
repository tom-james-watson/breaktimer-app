import Store from 'electron-store'
import {Settings, NotificationType, NotificationClick} from '../../types/settings'
import {setAutoLauch} from './auto-launch'
import {initBreaks} from './breaks'

const defaultSettings: Settings = {
  autoLaunch: true,
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
  idleResetEnabled: true,
  idleResetLength: new Date(0, 0, 0, 0, 5),
  gongEnabled: true,
  breakTitle: 'Time for a break!',
  breakMessage: 'Rest your eyes. Stretch your legs. Breathe. Relax.',
  backgroundColor: '#16a085',
  textColor: '#ffffff',
  endBreakEnabled: true,
}

interface IStore {
  settings: Settings
  appInitialized: boolean
}

const store = new Store<IStore>({
  defaults: {
    settings: defaultSettings,
    appInitialized: false
  }
})

export function getSettings(): Settings {
  return Object.assign(defaultSettings, store.get('settings')) as Settings
}

export function setSettings(settings: Settings): void {
  const currentSettings = getSettings()

  if (currentSettings.autoLaunch !== settings.autoLaunch) {
    setAutoLauch(settings.autoLaunch)
  }

  store.set({settings})
  initBreaks()
}

export function getAppInitialized(): boolean {
  return store.get('appInitialized') as boolean
}

export function setAppInitialized(): void {
  store.set({appInitialized: true})
}
