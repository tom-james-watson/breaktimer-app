import * as React from "react";
import moment from "moment";
import { ProgressBar, Button, Intent } from "@blueprintjs/core";
import { Settings } from "../../types/settings";
import styles from "./Break.scss";

let rerenderInterval: NodeJS.Timeout;

function pad(num: number): string {
  let out = String(num);
  if (out.length === 1) {
    out = `0${out}`;
  }
  return out;
}

let startSecondsRemaining: number;

export default function Break() {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [hoursRemaining, setHoursRemaining] = React.useState<number | null>(
    null
  );
  const [minutesRemaining, setMinutesRemaining] = React.useState<number | null>(
    null
  );
  const [secondsRemaining, setSecondsRemaining] = React.useState<number | null>(
    null
  );
  const [progress, setProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      setSettings((await ipcRenderer.invokeGetSettings()) as Settings);
      const breakEndTime: string =
        (await ipcRenderer.invokeGetBreakEndTime()) as string;
      startSecondsRemaining = moment(breakEndTime).diff(moment(), "seconds");

      clearInterval(rerenderInterval);
      rerenderInterval = setInterval(() => {
        const now = moment();

        if (now > moment(breakEndTime)) {
          window.close();
        }

        let secondsRemaining = moment(breakEndTime).diff(now, "seconds");
        setProgress(1 - secondsRemaining / startSecondsRemaining);
        setHoursRemaining(Math.floor(secondsRemaining / 3600));
        secondsRemaining %= 3600;
        setMinutesRemaining(Math.floor(secondsRemaining / 60));
        setSecondsRemaining(secondsRemaining % 60);
      }, 1000);
    })();
  }, []);

  if (
    !settings ||
    hoursRemaining === null ||
    minutesRemaining === null ||
    secondsRemaining === null ||
    progress === null
  ) {
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
      <div className={styles.countdown}>
        {`${pad(hoursRemaining)} : ${pad(minutesRemaining)} : ${pad(
          secondsRemaining
        )}`}
      </div>
      <ProgressBar
        value={progress}
        className={styles.progress}
        stripes={false}
      />
      {settings.endBreakEnabled && (
        <Button
          className={styles.endBreak}
          onClick={window.close}
          intent={Intent.PRIMARY}
          autoFocus={true}
        >
          End Break
        </Button>
      )}
    </div>
  );
}
