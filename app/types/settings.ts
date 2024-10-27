export enum NotificationType {
  Notification = "NOTIFICATION",
  Popup = "POPUP",
}

export interface WorkingHoursRange {
  fromMinutes: number;
  toMinutes: number;
}

export interface WorkingHours {
  enabled: boolean;
  ranges: WorkingHoursRange[];
}

export enum SoundType {
  None = "NONE",
  Gong = "GONG",
  Blip = "BLIP",
  Bloop = "BLOOP",
  Ping = "PING",
  Scifi = "SCIFI",
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
  workingHoursMonday: WorkingHours;
  workingHoursTuesday: WorkingHours;
  workingHoursWednesday: WorkingHours;
  workingHoursThursday: WorkingHours;
  workingHoursFriday: WorkingHours;
  workingHoursSaturday: WorkingHours;
  workingHoursSunday: WorkingHours;
  idleResetEnabled: boolean;
  idleResetLength: Date;
  idleResetNotification: boolean;
  soundType: SoundType;
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
  respectDnd: boolean;
}

export const defaultWorkingRange: WorkingHoursRange = {
  fromMinutes: 9 * 60, // 09:00
  toMinutes: 18 * 60, // 18:00
};

export const defaultSettings: Settings = {
  autoLaunch: true,
  breaksEnabled: true,
  notificationType: NotificationType.Popup,
  breakFrequency: new Date(0, 0, 0, 0, 28),
  breakLength: new Date(0, 0, 0, 0, 2),
  postponeLength: new Date(0, 0, 0, 0, 3),
  postponeLimit: 0,
  workingHoursEnabled: true,
  workingHoursMonday: {
    enabled: true,
    ranges: [defaultWorkingRange],
  },
  workingHoursTuesday: {
    enabled: true,
    ranges: [defaultWorkingRange],
  },
  workingHoursWednesday: {
    enabled: true,
    ranges: [defaultWorkingRange],
  },
  workingHoursThursday: {
    enabled: true,
    ranges: [defaultWorkingRange],
  },
  workingHoursFriday: {
    enabled: true,
    ranges: [defaultWorkingRange],
  },
  workingHoursSaturday: {
    enabled: false,
    ranges: [defaultWorkingRange],
  },
  workingHoursSunday: {
    enabled: false,
    ranges: [defaultWorkingRange],
  },
  idleResetEnabled: true,
  idleResetLength: new Date(0, 0, 0, 0, 5),
  idleResetNotification: false,
  soundType: SoundType.Gong,
  breakTitle: "Time for a break!",
  breakMessage: "Rest your eyes. Stretch your legs. Breathe. Relax.",
  backgroundColor: "#16a085",
  backdropColor: "#001914",
  textColor: "#ffffff",
  showBackdrop: true,
  backdropOpacity: 0.7,
  endBreakEnabled: true,
  skipBreakEnabled: false,
  postponeBreakEnabled: true,
  respectDnd: true,
};

export interface DayConfig {
  key:
    | "workingHoursMonday"
    | "workingHoursTuesday"
    | "workingHoursWednesday"
    | "workingHoursThursday"
    | "workingHoursFriday"
    | "workingHoursSaturday"
    | "workingHoursSunday";
  label: string;
}

export const daysConfig: DayConfig[] = [
  { key: "workingHoursMonday", label: "Monday" },
  { key: "workingHoursTuesday", label: "Tuesday" },
  { key: "workingHoursWednesday", label: "Wednesday" },
  { key: "workingHoursThursday", label: "Thursday" },
  { key: "workingHoursFriday", label: "Friday" },
  { key: "workingHoursSaturday", label: "Saturday" },
  { key: "workingHoursSunday", label: "Sunday" },
];
