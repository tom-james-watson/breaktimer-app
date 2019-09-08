import * as React from 'react'
import {ipcRenderer, IpcRendererEvent} from 'electron'
import moment from 'moment'
import {Button, Intent} from "@blueprintjs/core"
import {IpcChannel} from "../../types/ipc"
import {Settings} from "../../types/settings"
import {toast} from "../toaster"
const styles = require('./Break.scss')

let rerenderInterval

function pad(num: number): string {
  let out = String(num)
  if (out.length === 1) {
    out = `0${out}`
  }
  return out
}

export default function Sounds() {
  const [settings, setSettings] = React.useState<Settings>(null)
  const [hoursRemaining, setHoursRemaining] = React.useState<number | null>(null)
  const [minutesRemaining, setMinutesRemaining] = React.useState<number | null>(null)
  const [secondsRemaining, setSecondsRemaining] = React.useState<number | null>(null)

  React.useEffect(() => {
    ipcRenderer.on(IpcChannel.GET_SETTINGS_SUCCESS, (event: IpcRendererEvent, settings: Settings) => {
      setSettings(settings)
      ipcRenderer.send(IpcChannel.GET_BREAK_END_TIME)
    })

    ipcRenderer.on(IpcChannel.GET_BREAK_END_TIME_SUCCESS, (event: IpcRendererEvent, breakEndTime: string) => {
      clearInterval(rerenderInterval)
      rerenderInterval = setInterval(() => {
        const now = moment()
        let secondsRemaining = moment(breakEndTime).diff(now, 'seconds')
        setHoursRemaining(Math.floor(secondsRemaining / 3600))
        secondsRemaining %= 3600
        setMinutesRemaining(Math.floor(secondsRemaining / 60))
        setSecondsRemaining(secondsRemaining % 60)
      }, 1000)
    })

    ipcRenderer.on(IpcChannel.ERROR, (event: IpcRendererEvent, error: string) => {
      toast(error, Intent.DANGER)
    })

    ipcRenderer.send(IpcChannel.GET_SETTINGS)
  }, [])

  if (!settings || hoursRemaining === null || minutesRemaining === null || secondsRemaining === null) {
    return null
  }

  console.log({hoursRemaining, minutesRemaining, secondsRemaining})

  return (
    <div className={styles.break}>
      <h1 className={styles.breakTitle}>{settings.breakTitle}</h1>
      <h3>{settings.breakMessage}</h3>
      <div className={styles.countdown}>
        {`${pad(hoursRemaining)} : ${pad(minutesRemaining)}: ${pad(secondsRemaining)}`}
      </div>
      {settings.endBreakEnabled && (
        <Button className={styles.endBreak} onClick={window.close} intent={Intent.DANGER}>
          End Break
        </Button>
      )}
    </div>
  )
}
