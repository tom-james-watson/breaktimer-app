import * as React from "react";
import moment from "moment";
import { Button, Spinner } from "@blueprintjs/core";
import { useSpring, animated, config } from "react-spring";
import { Settings } from "../../types/settings";
import styles from "./Break.scss";

const COUNTDOWN_SECS = 10;
const TICK_MS = 200;

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

interface SpinnerProps {
  value: number;
  textColor: string;
}

function OuterSpinner(props: SpinnerProps) {
  const { textColor, value } = props;

  return (
    <div className={`bp3-spinner ${styles.outerSpinner}`}>
      <svg width="400" height="400" strokeWidth="2" viewBox="2 2 96 96">
        <path
          className="bp3-spinner-track"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          style={{ stroke: "none" }}
        ></path>
        <path
          className="bp3-spinner-head"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          pathLength="100"
          strokeDasharray="100 100"
          strokeDashoffset={100 - 100 * value}
          style={{ stroke: textColor }}
        ></path>
      </svg>
    </div>
  );
}

interface BreakProgressProps {
  breakMessage: string;
  endBreakEnabled: boolean;
  onEndBreak: () => void;
  textColor: string;
}

function BreakProgress(props: BreakProgressProps) {
  const { breakMessage, endBreakEnabled, onEndBreak, textColor } = props;
  const [timeRemaining, setTimeRemaining] =
    React.useState<TimeRemaining | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    ipcRenderer.invokeGongStartPlay();

    (async () => {
      const length = new Date(await ipcRenderer.invokeGetBreakLength());
      const breakEndTime = moment()
        .add(length.getHours(), "hours")
        .add(length.getMinutes(), "minutes")
        .add(length.getSeconds(), "seconds");

      const startMsRemaining = moment(breakEndTime).diff(
        moment(),
        "milliseconds"
      );

      const tick = () => {
        const now = moment();

        if (now > moment(breakEndTime)) {
          onEndBreak();
          return;
        }

        const msRemaining = moment(breakEndTime).diff(now, "milliseconds");
        setProgress(1 - msRemaining / startMsRemaining);
        setTimeRemaining({
          hours: Math.floor(msRemaining / 1000 / 3600),
          minutes: Math.floor(msRemaining / 1000 / 60),
          seconds: (msRemaining / 1000) % 60,
        });
        setTimeout(tick, TICK_MS);
      };

      tick();
    })();
  }, [onEndBreak]);

  const fadeIn = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: config.slow,
  });

  if (timeRemaining === null || progress === null) {
    return null;
  }

  return (
    <animated.div className={styles.break} style={fadeIn}>
      <OuterSpinner value={progress} textColor={textColor} />
      <div className={styles.progressContent}>
        <h1
          className={styles.breakMessage}
          dangerouslySetInnerHTML={{ __html: breakMessage }}
        />
        {endBreakEnabled && (
          <Button
            className={styles.actionButton}
            onClick={onEndBreak}
            minimal
            autoFocus={true}
            style={{ color: textColor }}
          >
            End
          </Button>
        )}
      </div>
    </animated.div>
  );
}

interface BreakCountdownProps {
  breakTitle: string;
  onCountdownOver: () => void;
  onPostponeBreak: () => void;
  onSkipBreak: () => void;
  postponeBreakEnabled: boolean;
  skipBreakEnabled: boolean;
  textColor: string;
}

function BreakCountdown(props: BreakCountdownProps) {
  const {
    breakTitle,
    onCountdownOver,
    onPostponeBreak,
    onSkipBreak,
    postponeBreakEnabled,
    skipBreakEnabled,
    textColor,
  } = props;
  const [progress, setProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      const countdownEndTime = moment().add(COUNTDOWN_SECS, "seconds");

      const tick = () => {
        const now = moment();

        if (now > countdownEndTime) {
          onCountdownOver();
          return;
        }

        const msRemaining = countdownEndTime.diff(now, "milliseconds");
        setProgress(1 - msRemaining / 1000 / COUNTDOWN_SECS);
        setTimeout(tick, TICK_MS);
      };

      tick();
    })();
  }, [onCountdownOver]);

  if (progress === null) {
    return null;
  }

  return (
    <>
      <h1
        className={styles.breakTitle}
        dangerouslySetInnerHTML={{ __html: breakTitle }}
      />
      {(skipBreakEnabled || postponeBreakEnabled) && (
        <div>
          {skipBreakEnabled && (
            <Button
              className={styles.actionButton}
              onClick={onSkipBreak}
              minimal
              autoFocus={true}
              style={{ color: textColor }}
              icon={<Spinner value={1 - progress} size={16} />}
            >
              Skip
            </Button>
          )}
          {postponeBreakEnabled && (
            <Button
              className={styles.actionButton}
              onClick={onPostponeBreak}
              autoFocus={true}
              minimal
              style={{ color: textColor }}
              icon={<Spinner value={1 - progress} size={16} />}
            >
              Postpone
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default function Break() {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [countingDown, setCountingDown] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;

      // Skip the countdown if these are disabled
      if (!settings.skipBreakEnabled && !settings.postponeBreakEnabled) {
        setCountingDown(false);
      }

      setSettings(settings);
    })();
  }, []);

  const handleCountdownOver = React.useCallback(() => {
    setCountingDown(false);
  }, []);

  const handlePostponeBreak = React.useCallback(() => {
    // TODO - implement
    console.log("postpone break");
  }, []);

  const handleSkipBreak = React.useCallback(() => {
    window.close();
  }, []);

  const handleEndBreak = React.useCallback(() => {
    // For some reason the end gong sometimes sounds very distorted.
    ipcRenderer.invokeGongStartPlay();
    window.close();
  }, []);

  const fadeIn = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    delay: 300,
    config: config.molasses,
  });

  if (settings === null) {
    return null;
  }

  const style = {
    color: settings.textColor,
    backgroundColor: settings.backgroundColor,
  };

  return (
    <animated.div className={styles.break} style={{ ...fadeIn, ...style }}>
      {countingDown ? (
        <BreakCountdown
          breakTitle={settings.breakTitle}
          onCountdownOver={handleCountdownOver}
          onPostponeBreak={handlePostponeBreak}
          onSkipBreak={handleSkipBreak}
          postponeBreakEnabled={settings.postponeBreakEnabled}
          skipBreakEnabled={settings.skipBreakEnabled}
          textColor={settings.textColor}
        />
      ) : (
        <BreakProgress
          breakMessage={settings.breakMessage}
          endBreakEnabled={settings.endBreakEnabled}
          onEndBreak={handleEndBreak}
          textColor={settings.textColor}
        />
      )}
    </animated.div>
  );
}
