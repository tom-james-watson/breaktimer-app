import { cn } from "@/lib/utils";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

export interface TimeInputProps {
  value: number; // Value in seconds
  onChange: (value: number) => void;
  precision?: "minutes" | "seconds"; // Default is "minutes"
  disabled?: boolean;
  className?: string;
}

export default function TimeInput({
  value,
  onChange,
  precision = "minutes",
  disabled = false,
  className,
}: TimeInputProps) {
  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(() => {
    // Convert seconds to hours, minutes, seconds - pad with leading zeros
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  });

  // Track which field is currently focused to avoid formatting during user input
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Update internal value when external value changes (but not during user input)
  useEffect(() => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    setInternalValue((prev) => ({
      hours:
        focusedField === "hours"
          ? prev.hours
          : hours.toString().padStart(2, "0"),
      minutes:
        focusedField === "minutes"
          ? prev.minutes
          : minutes.toString().padStart(2, "0"),
      seconds:
        focusedField === "seconds"
          ? prev.seconds
          : seconds.toString().padStart(2, "0"),
    }));
  }, [value, precision, focusedField]);

  const handleChange = (
    field: "hours" | "minutes" | "seconds",
    newValue: string,
  ) => {
    const updated = { ...internalValue, [field]: newValue };
    setInternalValue(updated);

    // Convert back to total seconds with validation
    const hours = Math.min(23, Math.max(0, parseInt(updated.hours) || 0));
    const minutes = Math.min(59, Math.max(0, parseInt(updated.minutes) || 0));
    const seconds =
      precision === "seconds"
        ? Math.min(59, Math.max(0, parseInt(updated.seconds) || 0))
        : 0;

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    onChange(totalSeconds);
  };

  const cycleValue = (
    field: "hours" | "minutes" | "seconds",
    direction: "up" | "down",
  ) => {
    const current = parseInt(internalValue[field]) || 0;
    let max = 59;
    if (field === "hours") max = 23;

    let newValue;
    if (direction === "up") {
      newValue = current >= max ? 0 : current + 1;
    } else {
      newValue = current <= 0 ? max : current - 1;
    }

    handleChange(field, newValue.toString().padStart(2, "0"));
  };

  const handleKeyDown = (
    field: "hours" | "minutes" | "seconds",
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      cycleValue(field, "up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cycleValue(field, "down");
    } else if (e.key === "Tab") {
      // Let tab work normally
    } else if (e.key === ":") {
      e.preventDefault();
      // Move to next field when typing colon
      if (field === "hours" && minutesRef.current) {
        minutesRef.current.focus();
        minutesRef.current.select();
      } else if (
        field === "minutes" &&
        precision === "seconds" &&
        secondsRef.current
      ) {
        secondsRef.current.focus();
        secondsRef.current.select();
      }
    } else if (
      e.key === "Backspace" &&
      e.currentTarget.value === "" &&
      e.currentTarget.selectionStart === 0
    ) {
      // Move to previous field when backspacing at the beginning
      e.preventDefault();
      if (field === "minutes" && hoursRef.current) {
        hoursRef.current.focus();
        hoursRef.current.select();
      } else if (field === "seconds" && minutesRef.current) {
        minutesRef.current.focus();
        minutesRef.current.select();
      }
    }
  };

  const handleFocus = (
    field: "hours" | "minutes" | "seconds",
    e: React.FocusEvent<HTMLInputElement>,
  ) => {
    // Track focused field and select all text when focusing
    setFocusedField(field);
    e.target.select();
  };

  const handleBlur = (field: "hours" | "minutes" | "seconds") => {
    // Clear focused field and format the value with leading zeros when focus is lost
    setFocusedField(null);
    const currentValue = internalValue[field];
    const formattedValue = (currentValue || "0").padStart(2, "0");

    if (currentValue !== formattedValue) {
      const updated = { ...internalValue, [field]: formattedValue };
      setInternalValue(updated);
    }
  };

  const handleInputChange = (
    field: "hours" | "minutes" | "seconds",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let rawValue = e.target.value;

    // Only allow digits and limit length
    let cleanValue = rawValue.replace(/[^0-9]/g, "");
    if (cleanValue.length > 2) {
      cleanValue = cleanValue.slice(0, 2);
    }

    // Update internal state - keep the raw value during typing
    const updated = { ...internalValue, [field]: cleanValue };
    setInternalValue(updated);

    // Convert to seconds and call onChange
    const hours = parseInt(updated.hours) || 0;
    const minutes = parseInt(updated.minutes) || 0;
    const seconds =
      precision === "seconds" ? parseInt(updated.seconds) || 0 : 0;

    const totalSeconds = Math.min(
      86399,
      Math.max(0, hours * 3600 + minutes * 60 + seconds),
    );
    onChange(totalSeconds);

    // Auto-advance to next field when 2 digits are entered
    if (cleanValue.length === 2) {
      setTimeout(() => {
        if (field === "hours" && minutesRef.current) {
          minutesRef.current.focus();
          minutesRef.current.select();
        } else if (
          field === "minutes" &&
          precision === "seconds" &&
          secondsRef.current
        ) {
          secondsRef.current.focus();
          secondsRef.current.select();
        }
      }, 0);
    }
  };

  return (
    <div
      className={cn(
        "inline-block border border-input bg-transparent dark:bg-input/30 rounded-md px-3 py-2 text-sm shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        ref={hoursRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={internalValue.hours}
        onChange={(e) => handleInputChange("hours", e)}
        onKeyDown={(e) => handleKeyDown("hours", e)}
        onFocus={(e) => handleFocus("hours", e)}
        onBlur={() => handleBlur("hours")}
        disabled={disabled}
        maxLength={2}
        className="w-6 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
      />
      <span className="text-muted-foreground text-xs self-end">h</span>

      <span className="text-muted-foreground mx-1">:</span>

      <input
        ref={minutesRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={internalValue.minutes}
        onChange={(e) => handleInputChange("minutes", e)}
        onKeyDown={(e) => handleKeyDown("minutes", e)}
        onFocus={(e) => handleFocus("minutes", e)}
        onBlur={() => handleBlur("minutes")}
        disabled={disabled}
        maxLength={2}
        className="w-6 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
      />
      <span className="text-muted-foreground text-xs self-end">m</span>

      {precision === "seconds" && (
        <>
          <span className="text-muted-foreground mx-1">:</span>
          <input
            ref={secondsRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={internalValue.seconds}
            onChange={(e) => handleInputChange("seconds", e)}
            onKeyDown={(e) => handleKeyDown("seconds", e)}
            onFocus={(e) => handleFocus("seconds", e)}
            onBlur={() => handleBlur("seconds")}
            disabled={disabled}
            maxLength={2}
            className="w-6 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
          />
          <span className="text-muted-foreground text-xs self-end">s</span>
        </>
      )}
    </div>
  );
}
