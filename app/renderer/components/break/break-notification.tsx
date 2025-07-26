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

  const progressValue =
    phase === "countdown" ? ((60 - secondsRemaining) / 60) * 100 : 0;

  return (
    <motion.div
      className="flex flex-col w-full h-full z-20 rounded-xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Progress bar at top */}
      {phase === "countdown" && (
        <div className="absolute top-0 left-0 w-full h-1 z-10">
          <div
            className="w-full h-1 rounded-none overflow-hidden"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <div
              className="h-full transition-all duration-300 ease-out opacity-80"
              style={{
                backgroundColor: textColor,
                width: `${progressValue}%`,
              }}
            />
          </div>
        </div>
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

        {/* Action buttons */}
        <div className="flex justify-center gap-3">
          <Button
            className="!bg-transparent hover:!bg-white/10 active:!bg-white/20 border-white/20"
            onClick={onStartBreakNow}
            variant="outline"
            style={{
              color: textColor,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            Start
          </Button>
          {postponeBreakEnabled && (
            <Button
              className="!bg-transparent hover:!bg-white/10 active:!bg-white/20 border-white/20"
              onClick={onPostponeBreak}
              variant="outline"
              style={{
                color: textColor,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              Snooze
            </Button>
          )}
          {skipBreakEnabled && (
            <Button
              className="!bg-transparent hover:!bg-white/10 active:!bg-white/20 border-white/20"
              onClick={onSkipBreak}
              variant="outline"
              style={{
                color: textColor,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
