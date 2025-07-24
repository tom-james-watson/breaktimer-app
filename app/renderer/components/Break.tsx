import { motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Settings, SoundType } from "../../types/settings";
import { BreakNotification } from "./break/break-notification";
import { BreakProgress } from "./break/break-progress";
import { createDarkerRgba } from "./break/utils";

export default function Break() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [countingDown, setCountingDown] = useState(true);
  const [allowPostpone, setAllowPostpone] = useState<boolean | null>(null);
  const [timeSinceLastBreak, setTimeSinceLastBreak] = useState<number | null>(
    null,
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
      const [allowPostpone, settings, timeSince, startedFromTray] =
        await Promise.all([
          ipcRenderer.invokeGetAllowPostpone(),
          ipcRenderer.invokeGetSettings() as Promise<Settings>,
          ipcRenderer.invokeGetTimeSinceLastBreak(),
          ipcRenderer.invokeWasStartedFromTray(),
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

      // Skip the countdown if immediately start breaks is enabled or started from tray
      if (settings.immediatelyStartBreaks || startedFromTray) {
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
        backdropOpacity: settings?.showBackdrop ? settings.backdropOpacity : 0,
        width: 400,
        height: 400,
      }));
      controls.start({
        width: 400,
        height: 400,
        transition: { duration: 0.3 },
      });
    }
  }, [countingDown, controls, settings]);

  useEffect(() => {
    if (closing) {
      setAnimValues((prev) => ({
        ...prev,
        backgroundOpacity: 0,
        backdropOpacity: 0,
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
    await ipcRenderer.invokeBreakPostpone("snoozed");
    setClosing(true);
  }, []);

  const handleSkipBreak = useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone("skipped");
    setClosing(true);
  }, []);

  const handleEndBreak = useCallback(async () => {
    // Play end sound for manual break ending (Cancel/End buttons)
    if (settings && settings?.soundType !== SoundType.None) {
      ipcRenderer.invokeEndSound(settings.soundType, settings.breakSoundVolume);
    }
    setClosing(true);
  }, [settings]);

  if (settings === null || allowPostpone === null) {
    return null;
  }

  if (countingDown) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: "transparent" }}
      >
        {ready && !closing && (
          <BreakNotification
            onCountdownOver={handleCountdownOver}
            onPostponeBreak={handlePostponeBreak}
            onSkipBreak={handleSkipBreak}
            onStartBreakNow={handleStartBreakNow}
            postponeBreakEnabled={
              settings.postponeBreakEnabled &&
              allowPostpone &&
              !settings.immediatelyStartBreaks
            }
            skipBreakEnabled={
              settings.skipBreakEnabled && !settings.immediatelyStartBreaks
            }
            timeSinceLastBreak={timeSinceLastBreak}
            textColor={settings.textColor}
            backgroundColor={settings.backgroundColor}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center relative">
      {settings.showBackdrop && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: animValues.backdropOpacity }}
          initial={{ opacity: 0 }}
          transition={{ duration: closing ? 0.5 : 0.3 }}
          style={{
            backgroundColor: createDarkerRgba(settings.backgroundColor, 1),
          }}
        />
      )}
      <motion.div
        className="flex flex-col justify-center items-center text-center relative p-10 text-balance focus:outline-none"
        animate={{ width: animValues.width, height: animValues.height }}
        initial={{ width: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          color: settings.textColor,
        }}
      >
        <motion.div
          className="absolute top-0 right-0 bottom-0 left-0 rounded-full"
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
    </div>
  );
}
