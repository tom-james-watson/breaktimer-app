import { Button, ButtonGroup, Spinner } from "@blueprintjs/core";
import { motion, useAnimation } from "framer-motion";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { Settings, SoundType } from "../../types/settings";
import * as styles from "./Break.scss";

function formatTimeSinceLastBreak(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""} since last break`;
  } else if (minutes > 0) {
    return `${minutes}m since last break`;
  } else {
    return "Less than 1m since last break";
  }
}

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
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [breakStartTime] = useState(new Date());

  useEffect(() => {
    if (settings.soundType !== SoundType.None) {
      ipcRenderer.invokeStartSound(settings.soundType);
    }

    (async () => {
      const lengthSeconds = await ipcRenderer.invokeGetBreakLength();
      const breakEndTime = moment().add(lengthSeconds, "seconds");

      const startMsRemaining = moment(breakEndTime).diff(
        moment(),
        "milliseconds"
      );

      const tick = () => {
        const now = moment();

        if (now > moment(breakEndTime)) {
          // Track break completion before ending
          const breakDurationMs =
            new Date().getTime() - breakStartTime.getTime();
          ipcRenderer.invokeCompleteBreakTracking(breakDurationMs);
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
        setTimeout(tick, 200);
      };

      tick();
    })();
  }, [onEndBreak, settings, breakStartTime]);

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.5 },
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
            variant="outlined"
            size="large"
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

interface BreakNotificationProps {
  breakTitle: string;
  onCountdownOver: () => void;
  onPostponeBreak: () => void;
  onSkipBreak: () => void;
  onStartBreakNow: () => void;
  postponeBreakEnabled: boolean;
  skipBreakEnabled: boolean;
  timeSinceLastBreak: number | null;
  textColor: string;
  backgroundColor: string;
}

function BreakNotification(props: BreakNotificationProps) {
  const {
    onCountdownOver,
    onPostponeBreak,
    onSkipBreak,
    onStartBreakNow,
    postponeBreakEnabled,
    skipBreakEnabled,
    timeSinceLastBreak,
    textColor,
    backgroundColor,
  } = props;
  const [phase, setPhase] = useState<"grace" | "countdown">("grace");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const startTime = moment();

    const tick = () => {
      const now = moment();
      const elapsed = now.diff(startTime, "seconds");

      if (elapsed < 60) {
        // Grace period - first 60 seconds
        setPhase("grace");
      } else if (elapsed < 120) {
        // Countdown period - next 60 seconds
        setPhase("countdown");
        setSecondsRemaining(120 - elapsed);
      } else {
        // Force break after 2 minutes total
        onCountdownOver();
        return;
      }

      setTimeout(tick, 1000);
    };

    tick();
  }, [onCountdownOver]);

  return (
    <motion.div
      className={styles.breakNotification}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className={styles.notificationContent}>
        <div className={styles.notificationText}>
          <h3 className={styles.notificationTitle}>
            {phase === "grace"
              ? "Take a break when ready..."
              : `Starting break in ${secondsRemaining}s...`}
          </h3>
          {timeSinceLastBreak /** && timeSinceLastBreak > 600 */ && (
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.8 }}>
              {formatTimeSinceLastBreak(timeSinceLastBreak)}
            </p>
          )}
        </div>
        <div className={styles.notificationButtons}>
          <ButtonGroup>
            <Button
              className={styles.actionButton}
              onClick={onStartBreakNow}
              variant="outlined"
              autoFocus={true}
              style={{ color: textColor }}
              endIcon={
                phase === "countdown" ? (
                  <Spinner size={16} value={1 - (60 - secondsRemaining) / 60} />
                ) : undefined
              }
            >
              Start
            </Button>
            {postponeBreakEnabled && (
              <Button
                className={styles.actionButton}
                onClick={onPostponeBreak}
                variant="outlined"
                style={{ color: textColor }}
              >
                Snooze
              </Button>
            )}
            {skipBreakEnabled && (
              <Button
                className={styles.actionButton}
                onClick={onSkipBreak}
                variant="outlined"
                style={{ color: textColor }}
              >
                Skip
              </Button>
            )}
          </ButtonGroup>
        </div>
      </div>
    </motion.div>
  );
}

export default function Break() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [countingDown, setCountingDown] = useState(true);
  const [allowPostpone, setAllowPostpone] = useState<boolean | null>(null);
  const [timeSinceLastBreak, setTimeSinceLastBreak] = useState<number | null>(
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
      const [allowPostpone, settings, timeSince] = await Promise.all([
        ipcRenderer.invokeGetAllowPostpone(),
        ipcRenderer.invokeGetSettings() as Promise<Settings>,
        ipcRenderer.invokeGetTimeSinceLastBreak(),
      ]);

      setAllowPostpone(allowPostpone);
      setSettings(settings);
      setTimeSinceLastBreak(timeSince);

      const newValues = {
        backgroundOpacity: 0.9,
        backdropOpacity: 0,
        width: 500,
        height: 80,
      };
      setAnimValues(newValues);
      controls.start({
        width: 500,
        height: 80,
        transition: { duration: 0.3 },
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

  const handleStartBreakNow = useCallback(() => {
    setCountingDown(false);
  }, []);

  useEffect(() => {
    if (!countingDown) {
      // Resize window to full screen for break phase
      const renderer = ipcRenderer as typeof ipcRenderer & {
        invokeBreakWindowResize?: () => Promise<void>;
      };
      if (renderer.invokeBreakWindowResize) {
        renderer.invokeBreakWindowResize();
      }

      setAnimValues((prev) => ({
        ...prev,
        backgroundOpacity: 1,
        width: 400,
        height: 400,
      }));
      controls.start({
        width: 400,
        height: 400,
        transition: { duration: 0.3 },
      });
    }
  }, [countingDown, controls]);

  useEffect(() => {
    if (closing) {
      setAnimValues((prev) => ({
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

  const handleSkipBreak = useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone();
    setClosing(true);
  }, []);

  const handleEndBreak = useCallback(async () => {
    if (settings && settings?.soundType !== SoundType.None) {
      ipcRenderer.invokeEndSound(settings.soundType);
    }
    setClosing(true);
  }, [settings]);

  if (settings === null || allowPostpone === null) {
    return null;
  }

  if (countingDown) {
    return (
      <div
        className={`bp6-dark ${styles.breakContainer}`}
        style={{ backgroundColor: "transparent" }}
      >
        {ready && !closing && (
          <BreakNotification
            breakTitle={settings.breakTitle}
            onCountdownOver={handleCountdownOver}
            onPostponeBreak={handlePostponeBreak}
            onSkipBreak={handleSkipBreak}
            onStartBreakNow={handleStartBreakNow}
            postponeBreakEnabled={
              settings.postponeBreakEnabled && allowPostpone
            }
            skipBreakEnabled={settings.skipBreakEnabled}
            timeSinceLastBreak={timeSinceLastBreak}
            textColor={settings.textColor}
            backgroundColor={settings.backgroundColor}
          />
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`bp6-dark ${styles.breakContainer}`}
      animate={{ opacity: 1 }}
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
            opacity: animValues.backgroundOpacity,
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: settings.backgroundColor,
          }}
        />
        {ready && !closing && (
          <BreakProgress
            breakMessage={settings.breakMessage}
            endBreakEnabled={settings.endBreakEnabled}
            onEndBreak={handleEndBreak}
            settings={settings}
            textColor={settings.textColor}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
