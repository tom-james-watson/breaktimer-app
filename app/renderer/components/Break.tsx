import * as React from "react";
import moment from "moment";
import { ProgressBar, Button, Intent } from "@blueprintjs/core";
import { Settings } from "../../types/settings";
import styles from "./Break.scss";

function pad(num: number): string {
  let out = String(num);
  if (out.length === 1) {
    out = `0${out}`;
  }
  return out;
}

let startSecondsRemaining: number;

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Break() {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [timeRemaining, setTimeRemaining] =
    React.useState<TimeRemaining | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      setSettings((await ipcRenderer.invokeGetSettings()) as Settings);
      const breakEndTime: string =
        (await ipcRenderer.invokeGetBreakEndTime()) as string;
      startSecondsRemaining = moment(breakEndTime).diff(moment(), "seconds");

      const tick = () => {
        const now = moment();

        if (now > moment(breakEndTime)) {
          window.close();
        }

        const secondsRemaining = moment(breakEndTime).diff(now, "seconds");
        setProgress(1 - secondsRemaining / startSecondsRemaining);
        setTimeRemaining({
          hours: Math.floor(secondsRemaining / 3600),
          minutes: Math.floor(secondsRemaining / 60),
          seconds: secondsRemaining % 60,
        });
        setTimeout(tick, 1000);
      };

      tick();
    })();
  }, []);

  if (settings === null || timeRemaining === null || progress === null) {
    return null;
  }

  const style = {
    color: settings.textColor,
    backgroundColor: settings.backgroundColor,
  };

  return (
    <div className={styles.break} style={style}>
      <h1
        className={styles.breakTitle}
        dangerouslySetInnerHTML={{ __html: settings.breakTitle }}
      />
      <h3
        className={styles.breakMessage}
        dangerouslySetInnerHTML={{ __html: settings.breakMessage }}
      />
      <h1 className={styles.countdown}>
        {`${pad(timeRemaining.hours)} : ${pad(timeRemaining.minutes)} : ${pad(
          timeRemaining.seconds
        )}`}
      </h1>
      <ProgressBar
        value={progress}
        className={styles.progress}
        stripes={false}
      />
      {settings.endBreakEnabled && (
        <Button
          className={styles.endBreak}
          onClick={window.close}
          intent={Intent.NONE}
          autoFocus={true}
        >
          End Break
        </Button>
      )}
    </div>
  );
}
