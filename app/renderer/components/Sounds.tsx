import { Howl } from "howler";
import * as React from "react";
import { SoundType } from "../../types/settings";

export default function Sounds() {
  const playSound = (type: string, isStart: boolean): void => {
    if (type === SoundType.None) return;
    const sound = new Howl({
      src: [
        `../../renderer/sounds/${type.toLowerCase()}_${
          isStart ? "start" : "end"
        }.wav`,
      ],
    });
    sound.play();
  };

  React.useEffect(() => {
    ipcRenderer.onPlayStartSound((type: string) => {
      playSound(type, true);
    });

    ipcRenderer.onPlayEndSound((type: string) => {
      playSound(type, false);
    });
  }, []);

  return null;
}
