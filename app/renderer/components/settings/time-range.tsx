import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, Plus, X } from "lucide-react";
import { useState } from "react";
import {
  DayConfig,
  daysConfig,
  WorkingHoursRange,
} from "../../../types/settings";
import TimeInput from "./time-input";
import {
  getMinutesFromTime,
  getTimeFromMinutes,
  minutesToSeconds,
  secondsToMinutes,
} from "./working-hours-utils";

interface TimeRangeProps {
  range: WorkingHoursRange;
  onChange: (range: WorkingHoursRange) => void;
  onRemove: () => void;
  onAdd: () => void;
  onApplyToAll: (targetDays: DayConfig[]) => void;
  disabled: boolean;
  isFirstRange: boolean;
  day: DayConfig;
}

export default function TimeRange({
  range,
  onChange,
  onRemove,
  onAdd,
  onApplyToAll,
  disabled,
  isFirstRange,
  day,
}: TimeRangeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayConfig[]>([]);

  const handleTimeChange = (isStart: boolean, date: Date) => {
    const minutes = getMinutesFromTime(date);
    if (isStart) {
      if (minutes >= range.toMinutes) {
        onChange({
          fromMinutes: minutes,
          toMinutes: minutes + 30,
        });
      } else {
        onChange({
          ...range,
          fromMinutes: minutes,
        });
      }
    } else {
      if (minutes <= range.fromMinutes) {
        return;
      }
      onChange({
        ...range,
        toMinutes: minutes,
      });
    }
  };

  return (
    <div className="flex items-center gap-3 mb-0">
      <TimeInput
        precision="minutes"
        value={minutesToSeconds(range.fromMinutes)}
        onChange={(seconds) => {
          const minutes = secondsToMinutes(seconds);
          const date = getTimeFromMinutes(minutes);
          handleTimeChange(true, date);
        }}
        disabled={disabled}
      />
      <span className="text-muted-foreground">to</span>
      <TimeInput
        precision="minutes"
        value={minutesToSeconds(range.toMinutes)}
        onChange={(seconds) => {
          const minutes = secondsToMinutes(seconds);
          const date = getTimeFromMinutes(minutes);
          handleTimeChange(false, date);
        }}
        disabled={disabled}
      />
      <div className="flex items-center gap-2">
        {isFirstRange && (
          <div className="flex items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={onAdd}
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={disabled}
                  title="Copy to other days"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-38"
                side="bottom"
                align="start"
                sideOffset={4}
                avoidCollisions={true}
                collisionPadding={32}
              >
                <h4 className="font-semibold mb-3 text-sm">Copy ranges to:</h4>
                <div className="flex flex-col gap-2 mb-4">
                  {daysConfig.map((otherDay) => (
                    <div
                      key={otherDay.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`day-${otherDay.key}`}
                        checked={
                          otherDay.key === day.key ||
                          selectedDays.includes(otherDay)
                        }
                        disabled={otherDay.key === day.key}
                        onCheckedChange={() => {
                          if (otherDay.key !== day.key) {
                            setSelectedDays((days) =>
                              days.includes(otherDay)
                                ? days.filter((d) => d !== otherDay)
                                : [...days, otherDay],
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`day-${otherDay.key}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {otherDay.label}
                      </label>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    onApplyToAll(selectedDays);
                    setSelectedDays([]);
                    setIsPopoverOpen(false);
                  }}
                  disabled={selectedDays.length === 0}
                  variant="outline"
                >
                  Apply
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        )}
        {!isFirstRange && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
