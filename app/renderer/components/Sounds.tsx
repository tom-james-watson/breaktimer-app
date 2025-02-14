import { Howl } from "howler";
import * as React from "react";
import { SoundType } from "../../types/settings";

export default function Sounds() {
  // Update playSound to accept volume as an argument
  const playSound = (type: string, isStart: boolean, volume: number): void => {
    if (type === SoundType.None) return;


    const sound = new Howl({
      src: [
        `../../renderer/sounds/${type.toLowerCase()}_${isStart ? "start" : "end"}.wav`,
      ],
      volume: volume, // Use the passed volume
    });
    sound.play();
  };

  React.useEffect(() => {
    ipcRenderer.onPlayStartSound((type: string, volume: number) => {
      playSound(type, true, volume); // Start sound with passed volume
    });

    ipcRenderer.onPlayEndSound((type: string, volume: number) => {
      playSound(type, false, volume); // End sound with passed volume
    });
  }, []);

  return null;
}
