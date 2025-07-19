export enum IpcChannel {
  AllowPostponeGet = "ALLOW_POSTPONE_GET",
  BreakLengthGet = "BREAK_LENGTH_GET",
  BreakPostpone = "BREAK_POSTPONE",
  BreakWindowResize = "BREAK_WINDOW_RESIZE",
  BreakTrackingComplete = "BREAK_TRACKING_COMPLETE",
  Error = "ERROR",
  SoundEndPlay = "SOUND_END_PLAY",
  SoundStartPlay = "SOUND_START_PLAY",
  SettingsGet = "SETTINGS_GET",
  SettingsSet = "SETTINGS_SET",
  TimeSinceLastBreakGet = "TIME_SINCE_LAST_BREAK_GET",
}
