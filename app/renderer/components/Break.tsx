import { Button, ButtonGroup, ControlGroup, Spinner } from "@blueprintjs/core";
import moment from "moment";
import * as React from "react";
import { animated, config, useSpring } from "react-spring";
import { Settings } from "../../types/settings";
import styles from "./Break.scss";

const COUNTDOWN_SECS = 10;
const TICK_MS = 200;

function createRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

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
    <div className={`bp5-spinner ${styles.outerSpinner}`}>
      <svg width="400" height="400" strokeWidth="2" viewBox="2 2 96 96">
        <path
          className="bp5-spinner-track"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          style={{ stroke: "none" }}
        ></path>
        <path
          className="bp5-spinner-head"
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
  settings: Settings;
  textColor: string;
}

function BreakProgress(props: BreakProgressProps) {
  const { breakMessage, endBreakEnabled, onEndBreak, settings, textColor } =
    props;
  const [timeRemaining, setTimeRemaining] =
    React.useState<TimeRemaining | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (settings.gongEnabled) {
      ipcRenderer.invokeGongStartPlay();
    }

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
  }, [onEndBreak, settings]);

  const fadeIn = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: config.slow,
    delay: 500,
  });

  if (timeRemaining === null || progress === null) {
    return null;
  }

  return (
    <animated.div className={styles.breakProgress} style={fadeIn}>
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
            outlined
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

  const fadeIn = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: config.slow,
    delay: 500,
  });

  if (progress === null) {
    return null;
  }

  return (
    <animated.div className={styles.breakCountdown} style={fadeIn}>
      <h2
        className={styles.breakTitle}
        dangerouslySetInnerHTML={{ __html: breakTitle }}
      />
      {(skipBreakEnabled || postponeBreakEnabled) && (
        <ControlGroup>
          <ButtonGroup>
            {skipBreakEnabled && (
              <Button
                className={styles.actionButton}
                onClick={onSkipBreak}
                icon={<Spinner value={1 - progress} size={16} />}
                outlined
                autoFocus={true}
                style={{ color: textColor }}
              >
                Skip
              </Button>
            )}
            {postponeBreakEnabled && (
              <Button
                className={styles.actionButton}
                onClick={onPostponeBreak}
                icon={<Spinner value={1 - progress} size={16} />}
                outlined
                autoFocus={true}
                style={{ color: textColor }}
              >
                Snooze
              </Button>
            )}
          </ButtonGroup>
        </ControlGroup>
      )}
    </animated.div>
  );
}

export default function Break() {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [countingDown, setCountingDown] = React.useState(true);
  const [allowPostpone, setAllowPostpone] = React.useState<boolean | null>(
    null
  );
  const [ready, setReady] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [anim, animApi] = useSpring(() => ({
    width: 0,
    height: 0,
    backgroundOpacity: 0,
    backdropOpacity: 0,
  }));

  React.useEffect(() => {
    setTimeout(async () => {
      animApi({
        backgroundOpacity: 0.8,
        backdropOpacity: 1,
        width: 250,
        height: 250,
      });
      const allowPostpone = await ipcRenderer.invokeGetAllowPostpone();
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;

      // Skip the countdown if these are disabled
      if (
        !settings.skipBreakEnabled &&
        !(settings.postponeBreakEnabled && allowPostpone)
      ) {
        setCountingDown(false);
      }

      setAllowPostpone(await ipcRenderer.invokeGetAllowPostpone());
      setSettings(settings);
      setReady(true);
    }, 1000);
  }, [animApi]);

  const handleCountdownOver = React.useCallback(() => {
    setCountingDown(false);
  }, []);

  React.useEffect(() => {
    if (!countingDown) {
      animApi({ backgroundOpacity: 1, width: 400, height: 400 });
    }
  }, [countingDown, animApi]);

  React.useEffect(() => {
    if (closing) {
      animApi({ backgroundOpacity: 0, width: 0, height: 0 });
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [animApi, closing]);

  const handlePostponeBreak = React.useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone();
    setClosing(true);
  }, []);

  const handleSkipBreak = React.useCallback(() => {
    setClosing(true);
  }, []);

  const handleEndBreak = React.useCallback(() => {
    if (settings?.gongEnabled) {
      // For some reason the end gong sometimes sounds very distorted, so just
      // reuse the start gong.
      ipcRenderer.invokeGongStartPlay();
    }
    setClosing(true);
  }, [settings]);

  if (settings === null || allowPostpone === null) {
    return null;
  }

  return (
    <animated.div
      className={`bp5-dark ${styles.breakContainer}`}
      style={{
        backgroundColor: settings.showBackdrop
          ? createRgba(settings.backdropColor, settings.backdropOpacity)
          : "initial",
        opacity: anim.backdropOpacity,
      }}
    >
      <animated.div
        className={styles.break}
        style={{
          width: anim.width,
          height: anim.height,
          color: settings.textColor,
        }}
      >
        <animated.div
          className={styles.background}
          style={{
            width: anim.width,
            height: anim.height,
            opacity: anim.backgroundOpacity,
            backgroundColor: settings.backgroundColor,
          }}
        />
        {ready && !closing && (
          <>
            {countingDown ? (
              <BreakCountdown
                breakTitle={settings.breakTitle}
                onCountdownOver={handleCountdownOver}
                onPostponeBreak={handlePostponeBreak}
                onSkipBreak={handleSkipBreak}
                postponeBreakEnabled={
                  settings.postponeBreakEnabled && allowPostpone
                }
                skipBreakEnabled={settings.skipBreakEnabled}
                textColor={settings.textColor}
              />
            ) : (
              <BreakProgress
                breakMessage={settings.breakMessage}
                endBreakEnabled={settings.endBreakEnabled}
                onEndBreak={handleEndBreak}
                settings={settings}
                textColor={settings.textColor}
              />
            )}
          </>
        )}
      </animated.div>
    </animated.div>
  );
}
