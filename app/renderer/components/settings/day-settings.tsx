import { FormGroup } from "@/components/ui/form-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DayConfig,
  defaultWorkingRange,
  WorkingHours,
  WorkingHoursRange,
} from "../../../types/settings";
import TimeRange from "./time-range";

interface DaySettingsProps {
  day: DayConfig;
  workingHours: WorkingHours;
  onChange: (workingHours: WorkingHours) => void;
  disabled: boolean;
  onApplyToAll: (targetDays: DayConfig[]) => void;
}

export default function DaySettings({
  day,
  workingHours,
  onChange,
  disabled,
  onApplyToAll,
}: DaySettingsProps) {
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
      <div className="flex gap-8">
        <div className="w-30 h-10 flex items-center space-x-2">
          <Switch
            checked={workingHours.enabled}
            onCheckedChange={(checked) =>
              onChange({ ...workingHours, enabled: checked })
            }
            disabled={disabled}
          />
          <Label>{day.label}</Label>
        </div>
        {workingHours.enabled && (
          <>
            <div className="flex flex-col gap-2 mb-0">
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
