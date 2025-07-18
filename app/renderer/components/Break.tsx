import { Button, ButtonGroup, ControlGroup, Spinner } from "@blueprintjs/core";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Settings, SoundType } from "../../types/settings";
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
    <div className={`bp6-spinner ${styles.outerSpinner}`}>
      <svg width="400" height="400" strokeWidth="2" viewBox="2 2 96 96">
        <path
          className="bp6-spinner-track"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          style={{ stroke: "none" }}
        ></path>
        <path
          className="bp6-spinner-head"
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
    useState<TimeRemaining | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (settings.soundType !== SoundType.None) {
      ipcRenderer.invokeStartSound(settings.soundType);
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

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.5 }
  };

  if (timeRemaining === null || progress === null) {
    return null;
  }

  return (
    <motion.div className={styles.breakProgress} {...fadeIn}>
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
    </motion.div>
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
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
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

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.5 }
  };

  if (progress === null) {
    return null;
  }

  return (
    <motion.div className={styles.breakCountdown} {...fadeIn}>
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
    </motion.div>
  );
}

export default function Break() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [countingDown, setCountingDown] = useState(true);
  const [allowPostpone, setAllowPostpone] = useState<boolean | null>(
    null
  );
  const [ready, setReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const controls = useAnimation();
  const [animValues, setAnimValues] = useState({
    width: 0,
    height: 0,
    backgroundOpacity: 0,
    backdropOpacity: 0,
  });

  useEffect(() => {
    const init = async () => {
      const [allowPostpone, settings] = await Promise.all([
        ipcRenderer.invokeGetAllowPostpone(),
        ipcRenderer.invokeGetSettings() as Promise<Settings>,
      ]);

      setAllowPostpone(allowPostpone);
      setSettings(settings);

      const newValues = {
        backgroundOpacity: 0.8,
        backdropOpacity: 1,
        width: 250,
        height: 250,
      };
      setAnimValues(newValues);
      controls.start({
        width: 250,
        height: 250,
        transition: { duration: 0.3 }
      });

      // Skip the countdown if these are disabled
      if (
        !settings.skipBreakEnabled &&
        !(settings.postponeBreakEnabled && allowPostpone)
      ) {
        setCountingDown(false);
      }

      setReady(true);
    };

    // Delay or the window displays incorrectly.
    // FIXME: work out why and how to avoid this.
    setTimeout(init, 1000);
  }, [controls]);

  const handleCountdownOver = useCallback(() => {
    setCountingDown(false);
  }, []);

  useEffect(() => {
    if (!countingDown) {
      setAnimValues(prev => ({
        ...prev,
        backgroundOpacity: 1,
        width: 400,
        height: 400,
      }));
      controls.start({ width: 400, height: 400, transition: { duration: 0.3 } });
    }
  }, [countingDown, controls]);

  useEffect(() => {
    if (closing) {
      setAnimValues(prev => ({
        ...prev,
        backgroundOpacity: 0,
        width: 0,
        height: 0,
      }));
      controls.start({ width: 0, height: 0, transition: { duration: 0.5 } });
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [controls, closing]);

  const handlePostponeBreak = useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone();
    setClosing(true);
  }, []);

  const handleSkipBreak = useCallback(() => {
    setClosing(true);
  }, []);

  const handleEndBreak = useCallback(() => {
    if (settings && settings?.soundType !== SoundType.None) {
      ipcRenderer.invokeEndSound(settings.soundType);
    }
    setClosing(true);
  }, [settings]);

  if (settings === null || allowPostpone === null) {
    return null;
  }

  return (
    <motion.div
      className={`bp6-dark ${styles.breakContainer}`}
      animate={{ opacity: animValues.backdropOpacity }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: settings.showBackdrop
          ? createRgba(settings.backdropColor, settings.backdropOpacity)
          : "initial",
      }}
    >
      <motion.div
        className={styles.break}
        animate={{ width: animValues.width, height: animValues.height }}
        initial={{ width: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          color: settings.textColor,
        }}
      >
        <motion.div
          className={styles.background}
          animate={{ 
            width: animValues.width, 
            height: animValues.height,
            opacity: animValues.backgroundOpacity
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
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
      </motion.div>
    </motion.div>
  );
}
