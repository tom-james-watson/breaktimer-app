import * as React from 'react'
import {ipcRenderer} from 'electron'
import {Howl} from 'howler'
import {IpcChannel} from "../../types/ipc"

export default function Sounds() {
  const playSound = (path: string): void => {
    const sound = new Howl({src: [path]})
    sound.play()
  }

  React.useEffect(() => {
    ipcRenderer.on(IpcChannel.PLAY_START_GONG, (): void=> {
      playSound('../../renderer/sounds/gong_start.wav')
    })
    ipcRenderer.on(IpcChannel.PLAY_END_GONG, (): void=> {
      playSound('../../renderer/sounds/gong_end.wav')
    })
  }, [])

  return null
}
