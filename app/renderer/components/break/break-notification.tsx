import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import moment from "moment";
import { useEffect, useState } from "react";
import { formatTimeSinceLastBreak } from "./utils";

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
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    const startTime = moment();

    const tick = () => {
      const now = moment();
      const elapsed = now.diff(startTime, "seconds");

      if (elapsed < 60) {
        setPhase("grace");
      } else if (elapsed < 120) {
        setPhase("countdown");
        setSecondsRemaining(120 - elapsed);
      } else {
        onCountdownOver();
        return;
      }

      setTimeout(tick, 1000);
    };

    tick();
  }, [onCountdownOver]);

  return (
    <motion.div
      className="flex flex-col justify-center items-center w-full h-full z-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="flex flex-row justify-between items-center w-full p-8">
        <div className="flex flex-col flex-1 text-left">
          <div className="text-lg font-bold" style={{ color: textColor }}>
            {phase === "grace"
              ? "Take a break when ready..."
              : `Starting break in ${secondsRemaining}s...`}
          </div>
          {timeSinceLastBreak && timeSinceLastBreak > 600 && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                opacity: 0.8,
                color: textColor,
              }}
            >
              {formatTimeSinceLastBreak(timeSinceLastBreak)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="flex gap-2">
            <Button
              className="!bg-transparent hover:!bg-current/10 active:!bg-current/20"
              onClick={onStartBreakNow}
              variant="outline"
              style={{
                color: textColor,
                borderColor: textColor,
              }}
            >
              {phase === "countdown" && (
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="50.27"
                    strokeDashoffset={50.27 * (secondsRemaining / 60)}
                    className="transition-all duration-1000"
                  />
                </svg>
              )}
              Start
            </Button>
            {postponeBreakEnabled && (
              <Button
                className="!bg-transparent hover:!bg-current/10 active:!bg-current/20"
                onClick={onPostponeBreak}
                variant="outline"
                style={{
                  color: textColor,
                  borderColor: textColor,
                }}
              >
                Snooze
              </Button>
            )}
            {skipBreakEnabled && (
              <Button
                className="!bg-transparent hover:!bg-current/10 active:!bg-current/20"
                onClick={onSkipBreak}
                variant="outline"
                style={{
                  color: textColor,
                  borderColor: textColor,
                }}
              >
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
