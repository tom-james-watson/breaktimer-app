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
  const [msRemaining, setMsRemaining] = useState<number>(0);

  useEffect(() => {
    const startTime = moment();
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const now = moment();
      const elapsedMs = now.diff(startTime, "milliseconds");

      if (elapsedMs < 60000) {
        setPhase("grace");
      } else if (elapsedMs < 120000) {
        setPhase("countdown");
        setMsRemaining(120000 - elapsedMs);
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
  const progressValue =
    phase === "countdown" ? ((120000 - msRemaining) / 60000) * 100 : 0;

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
          <div className="relative">
            {/* Circular progress border */}
            {phase === "countdown" && (
              <div
                className="absolute rounded-md"
                style={{
                  top: "-0.5px",
                  right: "-0.5px",
                  bottom: "-0.5px",
                  left: "-0.5px",
                  background: `conic-gradient(from 0deg at 50% 50%, ${textColor} 0deg, ${textColor} ${(progressValue / 100) * 360}deg, transparent ${(progressValue / 100) * 360}deg, transparent 360deg)`,
                  padding: "2.5px",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                }}
              />
            )}
            <Button
              className="!bg-transparent hover:!bg-white/15 active:!bg-white/25 border-white/20 relative z-10"
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
            <Button
              className="!bg-transparent hover:!bg-white/15 active:!bg-white/25 border-white/20"
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
              className="!bg-transparent hover:!bg-white/15 active:!bg-white/25 border-white/20"
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
