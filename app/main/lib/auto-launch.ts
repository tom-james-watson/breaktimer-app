import AutoLaunch from 'auto-launch'

const AppLauncher = new AutoLaunch({name: 'BreakTimer'})

export function setAutoLauch(autoLaunch: boolean) {
  if (process.env.NODE_ENV !== 'development') {
    if (autoLaunch) {
      AppLauncher.enable()
    } else {
      AppLauncher.disable()
    }
  }
}
