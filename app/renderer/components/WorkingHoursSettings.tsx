import {
  Button,
  Checkbox,
  FormGroup,
  Popover,
  PopoverInteractionKind,
  Switch,
} from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import {
  DayConfig,
  daysConfig,
  defaultWorkingRange,
  Settings,
  WorkingHours,
  WorkingHoursRange,
} from "../../types/settings";
import { useState } from "react";
import * as styles from "./WorkingHoursSettings.scss";

interface WorkingHoursProps {
  settingsDraft: Settings;
  setSettingsDraft: (settingsDraft: Settings) => void;
}

const getTimeFromMinutes = (minutes: number) => {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
};

const getMinutesFromTime = (date: Date) => {
  return date.getHours() * 60 + date.getMinutes();
};

function TimeRange({
  range,
  onChange,
  onRemove,
  onAdd,
  onApplyToAll,
  disabled,
  isFirstRange,
  day,
}: {
  range: WorkingHoursRange;
  onChange: (range: WorkingHoursRange) => void;
  onRemove: () => void;
  onAdd: () => void;
  onApplyToAll: (targetDays: DayConfig[]) => void;
  disabled: boolean;
  isFirstRange: boolean;
  day: DayConfig;
}) {
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
    <div className={styles.timeRange}>
      <TimePicker
        value={getTimeFromMinutes(range.fromMinutes)}
        onChange={(date) => handleTimeChange(true, date)}
        selectAllOnFocus
        disabled={disabled}
      />
      <span>to</span>
      <TimePicker
        value={getTimeFromMinutes(range.toMinutes)}
        onChange={(date) => handleTimeChange(false, date)}
        selectAllOnFocus
        disabled={disabled}
      />
      {isFirstRange && (
        <>
          <Button icon="plus" minimal onClick={onAdd} disabled={disabled} />
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            content={
              <div className={styles.copyPopover}>
                <h4>Copy ranges to:</h4>
                <div className={styles.daysList}>
                  {daysConfig.map((otherDay) => (
                    <Checkbox
                      key={otherDay.key}
                      label={otherDay.label}
                      checked={
                        otherDay.key === day.key ||
                        selectedDays.includes(otherDay)
                      }
                      disabled={otherDay.key === day.key}
                      onChange={() => {
                        if (otherDay.key !== day.key) {
                          setSelectedDays((days) =>
                            days.includes(otherDay)
                              ? days.filter((d) => d !== otherDay)
                              : [...days, otherDay]
                          );
                        }
                      }}
                    />
                  ))}
                </div>
                <div className={styles.popoverButtons}>
                  <Button
                    onClick={() => {
                      onApplyToAll(selectedDays);
                      setSelectedDays([]);
                      setIsPopoverOpen(false);
                    }}
                    disabled={selectedDays.length === 0}
                    outlined
                  >
                    Apply to selected days
                  </Button>
                </div>
              </div>
            }
          >
            <Button
              icon="duplicate"
              minimal
              disabled={disabled}
              title="Copy to other days"
              onClick={() => setIsPopoverOpen(true)}
            />
          </Popover>
        </>
      )}
      {!isFirstRange && (
        <Button icon="cross" minimal onClick={onRemove} disabled={disabled} />
      )}
    </div>
  );
}

function DaySettings({
  day,
  workingHours,
  onChange,
  disabled,
  onApplyToAll,
}: {
  day: DayConfig;
  workingHours: WorkingHours;
  onChange: (workingHours: WorkingHours) => void;
  disabled: boolean;
  onApplyToAll: (targetDays: DayConfig[]) => void;
}) {
  const handleAddRange = () => {
    onChange({
      ...workingHours,
      ranges: [...workingHours.ranges, defaultWorkingRange],
    });
  };

  const handleRangeChange = (index: number, range: WorkingHoursRange) => {
    const newRanges = [...workingHours.ranges];
    newRanges[index] = range;
    onChange({ ...workingHours, ranges: newRanges });
  };

  const handleRemoveRange = (index: number) => {
    if (workingHours.ranges.length <= 1) {
      return;
    }

    const newRanges = workingHours.ranges.filter((_, i) => i !== index);
    onChange({ ...workingHours, ranges: newRanges });
  };

  return (
    <FormGroup>
      <div className={styles.day}>
        <Switch
          className={styles.daySwitch}
          label={day.label}
          checked={workingHours.enabled}
          onChange={(e) =>
            onChange({ ...workingHours, enabled: e.currentTarget.checked })
          }
          disabled={disabled}
        />
        {workingHours.enabled && (
          <>
            <div className={styles.ranges}>
              {workingHours.ranges.map((range, index) => (
                <TimeRange
                  key={index}
                  range={range}
                  onChange={(range) => handleRangeChange(index, range)}
                  onRemove={() => handleRemoveRange(index)}
                  onAdd={handleAddRange}
                  onApplyToAll={onApplyToAll}
                  disabled={disabled || !workingHours.enabled}
                  isFirstRange={index === 0}
                  day={day}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </FormGroup>
  );
}

export default function WorkingHoursSettings({
  settingsDraft,
  setSettingsDraft,
}: WorkingHoursProps) {
  const handleDayChange = (day: DayConfig, workingHours: WorkingHours) => {
    setSettingsDraft({
      ...settingsDraft,
      [day.key]: workingHours,
    });
  };

  const handleApplyToAll = (sourceDay: DayConfig, targetDays: DayConfig[]) => {
    const sourceHours = settingsDraft[sourceDay.key];
    const newDraft = { ...settingsDraft };

    targetDays.forEach((targetDay) => {
      const targetHours = newDraft[targetDay.key];
      newDraft[targetDay.key] = {
        enabled: targetHours.enabled,
        ranges: [...sourceHours.ranges],
      };
    });

    setSettingsDraft(newDraft);
  };

  return (
    <div className={styles.workingHoursSettings}>
      {daysConfig.map((day) => (
        <DaySettings
          key={day.key}
          day={day}
          workingHours={settingsDraft[day.key]}
          onChange={(workingHours) => handleDayChange(day, workingHours)}
          disabled={
            !settingsDraft.breaksEnabled || !settingsDraft.workingHoursEnabled
          }
          onApplyToAll={(targetDays) => handleApplyToAll(day, targetDays)}
        />
      ))}
    </div>
  );
}
