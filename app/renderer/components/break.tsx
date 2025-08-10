import { motion } from "framer-motion";
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
  const [sharedBreakEndTime, setSharedBreakEndTime] = useState<number | null>(
    null,
  );

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

      // Skip the countdown if immediately start breaks is enabled or started from tray
      if (settings.immediatelyStartBreaks || startedFromTray) {
        setCountingDown(false);
      }

      setReady(true);
    };

    // Listen for break start broadcasts from other windows
    const handleBreakStart = (breakEndTime: number) => {
      setSharedBreakEndTime(breakEndTime);
      setCountingDown(false);
    };

    // Listen for break end broadcasts from other windows
    const handleBreakEnd = () => {
      setClosing(true);
    };

    ipcRenderer.onBreakStart(handleBreakStart);
    ipcRenderer.onBreakEnd(handleBreakEnd);

    // Delay or the window displays incorrectly.
    // FIXME: work out why and how to avoid this.
    setTimeout(init, 1000);
  }, []);

  const handleCountdownOver = useCallback(() => {
    setCountingDown(false);
  }, []);

  const handleStartBreakNow = useCallback(async () => {
    await ipcRenderer.invokeBreakStart();
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
    }
  }, [countingDown, settings]);

  useEffect(() => {
    if (closing) {
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [closing]);

  const handlePostponeBreak = useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone("snoozed");
    setClosing(true);
  }, []);

  const handleSkipBreak = useCallback(async () => {
    await ipcRenderer.invokeBreakPostpone("skipped");
    setClosing(true);
  }, []);

  const handleEndBreak = useCallback(async () => {
    // Only play end sound from primary window
    const urlParams = new URLSearchParams(window.location.search);
    const windowId = urlParams.get("windowId");
    const isPrimary = windowId === "0" || windowId === null;

    if (isPrimary && settings && settings?.soundType !== SoundType.None) {
      ipcRenderer.invokeEndSound(settings.soundType, settings.breakSoundVolume);
    }

    // Broadcast to all windows to start their closing animations
    await ipcRenderer.invokeBreakEnd();
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
          animate={{
            opacity: closing ? 0 : settings.backdropOpacity,
          }}
          initial={{ opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: closing ? 0.3 : 0,
          }}
          style={{
            backgroundColor: createDarkerRgba(settings.backgroundColor, 1),
          }}
        />
      )}
      <motion.div
        className="flex flex-col justify-center items-center relative p-6 text-balance focus:outline-none w-[500px] rounded-xl"
        animate={{
          opacity: closing ? 0 : 1,
          y: closing ? -20 : 0,
        }}
        initial={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
        }}
        style={{
          color: settings.textColor,
          backgroundColor: settings.backgroundColor,
        }}
      >
        {ready && (
          <BreakProgress
            breakMessage={settings.breakMessage}
            breakTitle={settings.breakTitle}
            endBreakEnabled={settings.endBreakEnabled}
            onEndBreak={handleEndBreak}
            settings={settings}
            textColor={settings.textColor}
            isClosing={closing}
            sharedBreakEndTime={sharedBreakEndTime}
          />
        )}
      </motion.div>
    </div>
  );
}
