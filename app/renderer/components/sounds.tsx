import { Howl } from "howler";
import { useEffect } from "react";
import { SoundType } from "../../types/settings";

export default function Sounds() {
  const playSound = (
    type: string,
    isStart: boolean,
    volume: number = 1,
  ): void => {
    if (type === SoundType.None) return;
    const sound = new Howl({
      src: [`./sounds/${type.toLowerCase()}_${isStart ? "start" : "end"}.wav`],
      volume,
    });
    sound.play();
  };

  useEffect(() => {
    ipcRenderer.onPlayStartSound((type: string, volume: number = 1) => {
      playSound(type, true, volume);
    });

    ipcRenderer.onPlayEndSound((type: string, volume: number = 1) => {
      playSound(type, false, volume);
    });
  }, []);

  return null;
}
