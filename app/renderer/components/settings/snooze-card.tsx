import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingsCard from "./settings-card";
import TimeInput from "./time-input";
import { Settings } from "../../../types/settings";
import { shouldStartBreakImmediately } from "./settings-utils";

interface SnoozeCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
  onDateChange: (fieldName: string, newVal: Date) => void;
  onPostponeLimitChange: (value: string) => void;
}

export default function SnoozeCard({
  settingsDraft,
  onSwitchChange,
  onDateChange,
  onPostponeLimitChange,
}: SnoozeCardProps) {
  const immediatelyStartBreaks = shouldStartBreakImmediately(settingsDraft);

  return (
    <SettingsCard
      title="Snooze"
      helperText="Snoozing allows you to postpone breaks when busy."
      toggle={{
        checked:
          settingsDraft.postponeBreakEnabled &&
          !immediatelyStartBreaks,
        onCheckedChange: (checked) =>
          onSwitchChange("postponeBreakEnabled", checked),
        disabled: immediatelyStartBreaks,
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Length</Label>
          <TimeInput
            precision="seconds"
            value={settingsDraft.postponeLengthSeconds}
            onChange={(seconds) => {
              const date = new Date();
              date.setHours(Math.floor(seconds / 3600));
              date.setMinutes(Math.floor((seconds % 3600) / 60));
              date.setSeconds(seconds % 60);
              onDateChange("postponeLength", date);
            }}
            disabled={
              !settingsDraft.postponeBreakEnabled ||
              immediatelyStartBreaks
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Limit</Label>
          <Select
            value={settingsDraft.postponeLimit.toString()}
            onValueChange={onPostponeLimitChange}
            disabled={
              !settingsDraft.postponeBreakEnabled ||
              immediatelyStartBreaks
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="0">No limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SettingsCard>
  );
}
