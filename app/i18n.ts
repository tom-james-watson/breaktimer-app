import { UiLanguage } from "./types/settings";

export type TranslateParams = Record<string, string | number>;

const translations: Record<UiLanguage, Record<string, string>> = {
  [UiLanguage.ZhCN]: {
    "language.chinese": "中文",
    "language.english": "English",

    "settings.title": "设置",
    "settings.save": "保存",
    "settings.tab.general": "常规",
    "settings.tab.workingHours": "工作时段",
    "settings.tab.customization": "外观与声音",
    "settings.tab.system": "系统",
    "settings.toast.saved": "设置已保存",

    "settings.workingHours.title": "工作时段",
    "settings.workingHours.helper": "仅在你配置的工作时段内显示休息提醒。",

    "settings.breaks.title": "休息提醒",
    "settings.breaks.type": "类型",
    "settings.breaks.type.popup": "弹窗提醒",
    "settings.breaks.type.notification": "系统通知",
    "settings.breaks.frequency": "频率",
    "settings.breaks.length": "时长",
    "settings.breaks.titleField": "标题",
    "settings.breaks.message": "内容",
    "settings.breaks.messagePlaceholder": "输入你的休息提示内容...",

    "settings.smart.title": "智能休息",
    "settings.smart.helper": "自动识别自然休息并重置休息计时器。",
    "settings.smart.minimumIdleTime": "最小空闲时长",
    "settings.smart.showNotification": "自动识别休息时显示通知",

    "settings.snooze.title": "稍后提醒",
    "settings.snooze.helper": "忙碌时可将休息提醒稍后。",
    "settings.snooze.length": "时长",
    "settings.snooze.limit": "次数限制",
    "settings.snooze.noLimit": "不限",

    "settings.skip.title": "跳过休息",
    "settings.skip.helper": "允许跳过本次休息且不重新排期。",

    "settings.advanced.title": "高级",
    "settings.advanced.immediatelyStartBreaks": "立即开始休息",
    "settings.advanced.endBreakEarly": "允许提前结束休息",

    "settings.theme.title": "主题",
    "settings.theme.primaryColor": "主色",
    "settings.theme.textColor": "文字颜色",
    "settings.theme.reset": "重置",

    "settings.audio.title": "声音",
    "settings.audio.breakSound": "休息提示音",
    "settings.audio.breakSoundVolume": "提示音音量",

    "settings.backdrop.title": "背景遮罩",
    "settings.backdrop.helper": "在休息窗口后显示有色遮罩，减少干扰。",
    "settings.backdrop.opacity": "不透明度",

    "settings.startup.title": "开机启动",
    "settings.startup.helper": "登录电脑时自动启动番茄钟。",

    "settings.sound.none": "无",
    "settings.sound.gong": "锣声",
    "settings.sound.blip": "Blip",
    "settings.sound.bloop": "Bloop",
    "settings.sound.ping": "Ping",
    "settings.sound.scifi": "科幻",

    "welcome.title": "BreakTimer 会在后台运行",
    "welcome.description": "你可以通过系统托盘访问应用。",
    "welcome.confirm": "明白了，开始使用",

    "workingHours.to": "至",
    "workingHours.copyToOtherDaysTitle": "复制到其他日期",
    "workingHours.copyRangesTo": "复制时间段到：",
    "workingHours.apply": "应用",

    "day.monday": "周一",
    "day.tuesday": "周二",
    "day.wednesday": "周三",
    "day.thursday": "周四",
    "day.friday": "周五",
    "day.saturday": "周六",
    "day.sunday": "周日",

    "break.notification.grace": "准备好后开始休息...",
    "break.notification.countdown": "{seconds} 秒后开始休息...",
    "break.notification.start": "开始",
    "break.notification.snooze": "稍后",
    "break.notification.skip": "跳过",
    "break.progress.cancel": "取消休息",
    "break.progress.end": "结束休息",
    "break.timeSince.hoursMinutes": "距离上次休息 {hours}小时 {minutes}分钟",
    "break.timeSince.hours": "距离上次休息 {hours}小时",
    "break.timeSince.minutes": "距离上次休息 {minutes}分钟",
    "break.timeSince.lessThanMinute": "距离上次休息不足 1 分钟",

    "time.unit.hoursShort": "时",
    "time.unit.minutesShort": "分",
    "time.unit.secondsShort": "秒",

    "tray.nextBreak.inMinutes": "{minutes} 分钟后休息",
    "tray.nextBreak.inOneMinute": "1 分钟后休息",
    "tray.nextBreak.lessThanMinute": "不到 1 分钟后休息",
    "tray.disabledFor": "已禁用 {time}",
    "tray.outsideWorkingHours": "当前不在工作时段",
    "tray.idle": "当前空闲",
    "tray.enable": "启用",
    "tray.disable": "禁用...",
    "tray.disable.indefinitely": "一直禁用",
    "tray.disable.thirtyMinutes": "30 分钟",
    "tray.disable.oneHour": "1 小时",
    "tray.disable.twoHours": "2 小时",
    "tray.disable.fourHours": "4 小时",
    "tray.disable.restOfDay": "今天剩余时间",
    "tray.startBreakNow": "立即开始休息",
    "tray.settings": "设置...",
    "tray.about": "关于...",
    "tray.quit": "退出",
    "tray.disableTime.lessThanMinute": "<1分",
    "tray.disableTime.hoursMinutes": "{hours}小时 {minutes}分钟",
    "tray.disableTime.minutes": "{minutes}分钟",
    "tray.about.title": "关于",
    "tray.about.detail":
      "版本：{version}\n\n网站：\nhttps://breaktimer.app\n\n源码：\nhttps://github.com/tom-james-watson/breaktimer-app\n\n遵循 GPL-3.0-or-later 许可协议发布。",

    "notification.breakDetected.title": "自动识别到休息",
    "notification.breakDetected.body": "已离开 {time}",
    "notification.timeForBreak": "该休息一下了！",

    "window.settings.title": "番茄钟 - 设置",
    "dialog.close": "关闭",
  },
  [UiLanguage.EnUS]: {
    "language.chinese": "Chinese",
    "language.english": "English",

    "settings.title": "Settings",
    "settings.save": "Save",
    "settings.tab.general": "General",
    "settings.tab.workingHours": "Working Hours",
    "settings.tab.customization": "Customization",
    "settings.tab.system": "System",
    "settings.toast.saved": "Settings saved",

    "settings.workingHours.title": "Working Hours",
    "settings.workingHours.helper":
      "Only show breaks during your configured work schedule.",

    "settings.breaks.title": "Breaks",
    "settings.breaks.type": "Type",
    "settings.breaks.type.popup": "Popup break",
    "settings.breaks.type.notification": "Simple notification",
    "settings.breaks.frequency": "Frequency",
    "settings.breaks.length": "Length",
    "settings.breaks.titleField": "Title",
    "settings.breaks.message": "Message",
    "settings.breaks.messagePlaceholder": "Enter your break message...",

    "settings.smart.title": "Smart Breaks",
    "settings.smart.helper":
      "Automatically detect natural breaks and reset the break timer.",
    "settings.smart.minimumIdleTime": "Minimum idle time",
    "settings.smart.showNotification":
      "Show notification when break automatically detected",

    "settings.snooze.title": "Snooze",
    "settings.snooze.helper": "Snoozing allows you to postpone breaks when busy.",
    "settings.snooze.length": "Length",
    "settings.snooze.limit": "Limit",
    "settings.snooze.noLimit": "No limit",

    "settings.skip.title": "Skip",
    "settings.skip.helper":
      "Allow skipping breaks entirely without rescheduling them.",

    "settings.advanced.title": "Advanced",
    "settings.advanced.immediatelyStartBreaks": "Immediately start breaks",
    "settings.advanced.endBreakEarly": "Allow ending break early",

    "settings.theme.title": "Theme",
    "settings.theme.primaryColor": "Primary color",
    "settings.theme.textColor": "Text color",
    "settings.theme.reset": "Reset",

    "settings.audio.title": "Audio",
    "settings.audio.breakSound": "Break sound",
    "settings.audio.breakSoundVolume": "Break sound volume",

    "settings.backdrop.title": "Backdrop",
    "settings.backdrop.helper":
      "Show a colored overlay behind break windows to limit distractions.",
    "settings.backdrop.opacity": "Opacity",

    "settings.startup.title": "Start at login",
    "settings.startup.helper":
      "Automatically start BreakTimer when you log into your computer.",

    "settings.sound.none": "None",
    "settings.sound.gong": "Gong",
    "settings.sound.blip": "Blip",
    "settings.sound.bloop": "Bloop",
    "settings.sound.ping": "Ping",
    "settings.sound.scifi": "Sci-fi",

    "welcome.title": "BreakTimer runs in the background",
    "welcome.description": "The app can be accessed via your system tray.",
    "welcome.confirm": "Understood, let's go!",

    "workingHours.to": "to",
    "workingHours.copyToOtherDaysTitle": "Copy to other days",
    "workingHours.copyRangesTo": "Copy ranges to:",
    "workingHours.apply": "Apply",

    "day.monday": "Monday",
    "day.tuesday": "Tuesday",
    "day.wednesday": "Wednesday",
    "day.thursday": "Thursday",
    "day.friday": "Friday",
    "day.saturday": "Saturday",
    "day.sunday": "Sunday",

    "break.notification.grace": "Start your break when ready...",
    "break.notification.countdown": "Break starting in {seconds}s...",
    "break.notification.start": "Start",
    "break.notification.snooze": "Snooze",
    "break.notification.skip": "Skip",
    "break.progress.cancel": "Cancel Break",
    "break.progress.end": "End Break",
    "break.timeSince.hoursMinutes":
      "{hours}h {minutes}m since last break",
    "break.timeSince.hours": "{hours}h since last break",
    "break.timeSince.minutes": "{minutes}m since last break",
    "break.timeSince.lessThanMinute": "Less than 1m since last break",

    "time.unit.hoursShort": "h",
    "time.unit.minutesShort": "m",
    "time.unit.secondsShort": "s",

    "tray.nextBreak.inMinutes": "Next break in {minutes} minutes",
    "tray.nextBreak.inOneMinute": "Next break in 1 minute",
    "tray.nextBreak.lessThanMinute": "Next break in less than a minute",
    "tray.disabledFor": "Disabled for {time}",
    "tray.outsideWorkingHours": "Outside of working hours",
    "tray.idle": "Idle",
    "tray.enable": "Enable",
    "tray.disable": "Disable...",
    "tray.disable.indefinitely": "Indefinitely",
    "tray.disable.thirtyMinutes": "30 minutes",
    "tray.disable.oneHour": "1 hour",
    "tray.disable.twoHours": "2 hours",
    "tray.disable.fourHours": "4 hours",
    "tray.disable.restOfDay": "Rest of day",
    "tray.startBreakNow": "Start break now",
    "tray.settings": "Settings...",
    "tray.about": "About...",
    "tray.quit": "Quit",
    "tray.disableTime.lessThanMinute": "<1m",
    "tray.disableTime.hoursMinutes": "{hours}h {minutes}m",
    "tray.disableTime.minutes": "{minutes}m",
    "tray.about.title": "About",
    "tray.about.detail":
      "Build: {version}\n\nWebsite:\nhttps://breaktimer.app\n\nSource Code:\nhttps://github.com/tom-james-watson/breaktimer-app\n\nDistributed under GPL-3.0-or-later license.",

    "notification.breakDetected.title": "Break automatically detected",
    "notification.breakDetected.body": "Away for {time}",
    "notification.timeForBreak": "Time for a break!",

    "window.settings.title": "BreakTimer - Settings",
    "dialog.close": "Close",
  },
};

const dayKeyToTranslationKey = {
  workingHoursMonday: "day.monday",
  workingHoursTuesday: "day.tuesday",
  workingHoursWednesday: "day.wednesday",
  workingHoursThursday: "day.thursday",
  workingHoursFriday: "day.friday",
  workingHoursSaturday: "day.saturday",
  workingHoursSunday: "day.sunday",
} as const;

export function normalizeLanguage(language?: string): UiLanguage {
  return language === UiLanguage.EnUS ? UiLanguage.EnUS : UiLanguage.ZhCN;
}

export function translate(
  language: string | UiLanguage | undefined,
  key: string,
  params?: TranslateParams,
): string {
  const normalizedLanguage = normalizeLanguage(language);
  const table = translations[normalizedLanguage];
  const fallbackTable = translations[UiLanguage.EnUS];
  const template = table[key] ?? fallbackTable[key] ?? key;

  if (!params) {
    return template;
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token) => {
    if (params[token] === undefined) {
      return match;
    }
    return String(params[token]);
  });
}

export function getDayLabel(
  dayKey: string,
  language: string | UiLanguage | undefined,
): string {
  const key =
    dayKeyToTranslationKey[dayKey as keyof typeof dayKeyToTranslationKey];
  return key ? translate(language, key) : dayKey;
}
