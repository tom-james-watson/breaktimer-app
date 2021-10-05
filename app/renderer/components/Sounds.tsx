import * as React from "react";
import { Howl } from "howler";

export default function Sounds() {
  const playSound = (path: string): void => {
    const sound = new Howl({ src: [path] });
    sound.play();
  };

  React.useEffect(() => {
    ipcRenderer.onPlayStartGong(() => {
      playSound("../../renderer/sounds/gong_start.wav");
    });
    ipcRenderer.onPlayEndGong(() => {
      playSound("../../renderer/sounds/gong_end.wav");
    });
  }, []);

  return null;
}
