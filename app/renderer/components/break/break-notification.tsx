import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import moment from "moment";
import { useEffect, useState } from "react";
import { formatTimeSinceLastBreak } from "./utils";

const GRACE_PERIOD_MS = 60000;
const TOTAL_COUNTDOWN_MS = 120000;

interface BreakNotificationProps {
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

export function BreakNotification({
  onCountdownOver,
  onPostponeBreak,
  onSkipBreak,
  onStartBreakNow,
  postponeBreakEnabled,
  skipBreakEnabled,
  timeSinceLastBreak,
  textColor,
  backgroundColor,
}: BreakNotificationProps) {
  const [phase, setPhase] = useState<"grace" | "countdown">("grace");
  const [msRemaining, setMsRemaining] = useState<number>(0);

  useEffect(() => {
    const startTime = moment();
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const now = moment();
      const elapsedMs = now.diff(startTime, "milliseconds");

      if (elapsedMs < GRACE_PERIOD_MS) {
        setPhase("grace");
      } else if (elapsedMs < TOTAL_COUNTDOWN_MS) {
        setPhase("countdown");
        setMsRemaining(TOTAL_COUNTDOWN_MS - elapsedMs);
      } else {
        onCountdownOver();
        return;
      }

      timeoutId = setTimeout(tick, 100);
    };

    tick();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [onCountdownOver]);

  const secondsRemaining = Math.ceil(msRemaining / 1000);
  const countdownDurationMs = TOTAL_COUNTDOWN_MS - GRACE_PERIOD_MS;
  const progressValue =
    phase === "countdown"
      ? ((countdownDurationMs - msRemaining) / countdownDurationMs) * 100
      : 0;

  return (
    <motion.div
      className="flex flex-col w-full h-full z-20 rounded-xl overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {phase === "countdown" && (
        <div
          className="absolute inset-0 transition-all duration-75 ease-linear"
          style={{
            background: textColor,
            opacity: 0.15,
            width: `${progressValue}%`,
            left: 0,
            top: 0,
          }}
        />
      )}
      <div className="flex justify-between items-center px-6 py-2 h-full">
        <div className="flex flex-col justify-center">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ color: textColor }}
          >
            {phase === "grace"
              ? "Start your break when ready..."
              : `Break starting in ${secondsRemaining}s...`}
          </h2>
          {timeSinceLastBreak && (
            <p
              className="text-sm opacity-80 font-medium"
              style={{ color: textColor }}
            >
              {formatTimeSinceLastBreak(timeSinceLastBreak)}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3 relative z-10">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-md"
              style={{ backgroundColor }}
            />
            <Button
              className="!bg-transparent hover:!bg-black/10 active:!bg-black/20 border-white/20 relative z-10"
              onClick={onStartBreakNow}
              variant="outline"
              style={{
                color: textColor,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              Start
            </Button>
          </div>
          {postponeBreakEnabled && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-md"
                style={{ backgroundColor }}
              />
              <Button
                className="!bg-transparent hover:!bg-black/10 active:!bg-black/20 border-white/20 relative z-10"
                onClick={onPostponeBreak}
                variant="outline"
                style={{
                  color: textColor,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                Snooze
              </Button>
            </div>
          )}
          {skipBreakEnabled && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-md"
                style={{ backgroundColor }}
              />
              <Button
                className="!bg-transparent hover:!bg-black/10 active:!bg-black/20 border-white/20 relative z-10"
                onClick={onSkipBreak}
                variant="outline"
                style={{
                  color: textColor,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                Skip
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
