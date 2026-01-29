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

export interface BreakSchedule {
  id: string;
  enabled: boolean;
  notificationType: NotificationType;
  frequencySeconds: number;
  lengthSeconds: number;
  title: string;
  message: string;
}

export interface Settings {
  autoLaunch: boolean;
  breaksEnabled: boolean;
  notificationType: NotificationType;
  breakSchedules: BreakSchedule[];
  postponeLengthSeconds: number;
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
  idleResetLengthSeconds: number;
  idleResetNotification: boolean;
  soundType: SoundType;
  breakSoundVolume: number;
  backgroundColor: string;
  textColor: string;
  showBackdrop: boolean;
  backdropOpacity: number;
  endBreakEnabled: boolean;
  skipBreakEnabled: boolean;
  postponeBreakEnabled: boolean;
  immediatelyStartBreaks: boolean;
}

export const defaultWorkingRange: WorkingHoursRange = {
  fromMinutes: 9 * 60, // 09:00
  toMinutes: 18 * 60, // 18:00
};

export const defaultSettings: Settings = {
  autoLaunch: true,
  breaksEnabled: true,
  notificationType: NotificationType.Popup,
  breakSchedules: [
    {
      id: "default",
      enabled: true,
      notificationType: NotificationType.Popup,
      frequencySeconds: 28 * 60,
      lengthSeconds: 2 * 60,
      title: "Time for a break.",
      message: "Rest your eyes.\nStretch your legs.\nBreathe. Relax.",
    },
  ],
  postponeLengthSeconds: 3 * 60,
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
  idleResetLengthSeconds: 5 * 60,
  idleResetNotification: false,
  soundType: SoundType.Gong,
  breakSoundVolume: 1,
  backgroundColor: "#16a085",
  textColor: "#ffffff",
  showBackdrop: true,
  backdropOpacity: 0.7,
  endBreakEnabled: true,
  skipBreakEnabled: false,
  postponeBreakEnabled: true,
  immediatelyStartBreaks: false,
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
