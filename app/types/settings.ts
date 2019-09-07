export enum NotificationType {
  Notification = "NOTIFICATION",
  Popup = "POPUP"
}

export interface Settings {
  notificationType: NotificationType
  breakFrequency: Date
  breakLength: Date
  postponeLength: Date
  workingHoursEnabled: boolean
  workingHoursFrom: Date
  workingHoursTo: Date
  workingHoursMonday: boolean
  workingHoursTuesday: boolean
  workingHoursWednesday: boolean
  workingHoursThursday: boolean
  workingHoursFriday: boolean
  workingHoursSaturday: boolean
  workingHoursSunday: boolean
  idleResetEnabled: boolean
  idleResetLength: Date
  gongEnabled: boolean
  breakTitle: string
  breakMessage: string
  backgroundColor: string
  textColor: string
  endBreakEnabled: boolean
  skipBreakEnabled: boolean
  postponeBreakEnabled: boolean
}
