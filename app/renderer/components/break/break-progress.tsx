import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import moment from "moment";
import { useEffect, useState } from "react";
import { Settings, SoundType } from "../../../types/settings";
import { TimeRemaining } from "./utils";
import { OuterSpinner } from "./outer-spinner";

interface BreakProgressProps {
  breakMessage: string;
  endBreakEnabled: boolean;
  onEndBreak: () => void;
  settings: Settings;
  textColor: string;
}

export function BreakProgress({
  breakMessage,
  endBreakEnabled,
  onEndBreak,
  settings,
  textColor,
}: BreakProgressProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null,
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [breakStartTime] = useState(new Date());

  useEffect(() => {
    if (settings.soundType !== SoundType.None) {
      ipcRenderer.invokeStartSound(
        settings.soundType,
        settings.breakSoundVolume,
      );
    }

    (async () => {
      const lengthSeconds = await ipcRenderer.invokeGetBreakLength();
      const breakEndTime = moment().add(lengthSeconds, "seconds");

      const startMsRemaining = moment(breakEndTime).diff(
        moment(),
        "milliseconds",
      );

      const tick = () => {
        const now = moment();

        if (now > moment(breakEndTime)) {
          // Track break completion before ending
          const breakDurationMs =
            new Date().getTime() - breakStartTime.getTime();
          ipcRenderer.invokeCompleteBreakTracking(breakDurationMs);

          // Play end sound
          if (settings.soundType !== SoundType.None) {
            ipcRenderer.invokeEndSound(
              settings.soundType,
              settings.breakSoundVolume,
            );
          }

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
    <motion.div
      className="flex flex-col justify-center items-center text-center z-10 relative"
      {...fadeIn}
    >
      <OuterSpinner value={progress} textColor={textColor} />
      <div className="z-1">
        <h1
          className="mt-0 mb-8 font-normal text-3xl"
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{
            __html: breakMessage,
          }}
        />
        {endBreakEnabled && (
          <Button
            className="m-4 !bg-transparent hover:!bg-current/10 active:!bg-current/20"
            onClick={onEndBreak}
            variant="outline"
            size="lg"
            style={{
              color: textColor,
              borderColor: textColor,
            }}
          >
            {progress < 0.5 ? "Cancel" : "End"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
