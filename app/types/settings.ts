export enum NotificationType {
  Notification = "NOTIFICATION",
  Popup = "POPUP",
}

export interface Settings {
  autoLaunch: boolean;
  breaksEnabled: boolean;
  notificationType: NotificationType;
  breakFrequency: Date;
  breakLength: Date;
  postponeLength: Date;
  postponeLimit: number;
  workingHoursEnabled: boolean;
  workingHoursFrom: Date;
  workingHoursTo: Date;
  workingHoursMonday: boolean;
  workingHoursTuesday: boolean;
  workingHoursWednesday: boolean;
  workingHoursThursday: boolean;
  workingHoursFriday: boolean;
  workingHoursSaturday: boolean;
  workingHoursSunday: boolean;
  idleResetEnabled: boolean;
  idleResetLength: Date;
  idleResetNotification: boolean;
  gongEnabled: boolean;
  breakTitle: string;
  breakMessage: string;
  backgroundColor: string;
  textColor: string;
  showBackdrop: boolean;
  backdropColor: string;
  backdropOpacity: number;
  endBreakEnabled: boolean;
  skipBreakEnabled: boolean;
  postponeBreakEnabled: boolean;
  halfFullTrayMinutes: number;
  almostEmptyTrayMinutes: number;
}
