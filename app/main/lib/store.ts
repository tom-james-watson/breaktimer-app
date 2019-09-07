import Store from 'electron-store'
import {Settings, NotificationType} from '../../types/settings'

const store = new Store<Settings>({
  defaults: {
    settings: {
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
  }
})

export async function getSettings(): Promise<Settings> {
  return store.get('settings') as Settings
}

export async function setSettings(settings: Settings): Promise<void> {
  return store.set({settings})
}
