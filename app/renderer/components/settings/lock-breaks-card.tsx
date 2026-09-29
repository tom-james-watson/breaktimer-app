import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "./settings-card";
import TimeInput from "./time-input";
import { Settings } from "../../../types/settings";

interface LockBreaksCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
  onDateChange: (fieldName: string, newVal: Date) => void;
  onUseCustomTimeChange: (checked: boolean) => void;
}

export default function LockBreaksCard({
  settingsDraft,
  onSwitchChange,
  onDateChange,
  onUseCustomTimeChange,
}: LockBreaksCardProps) {
  const derivedSeconds = Math.round((settingsDraft.breakLengthSeconds * 2) / 3);
  const lockLengthSeconds = settingsDraft.lockUseCustomTime
    ? settingsDraft.lockCustomLengthSeconds
    : derivedSeconds;

  return (
    <SettingsCard
      title="Smart Breaks: Screen Lock"
      helperText="Count locking your screen as a break, independent of general inactivity."
      toggle={{
        checked: settingsDraft.lockScreenAsBreakEnabled,
        onCheckedChange: (checked) =>
          onSwitchChange("lockScreenAsBreakEnabled", checked),
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Minimum screen lock time
          </Label>
          <TimeInput
            precision="seconds"
            value={lockLengthSeconds}
            onChange={(seconds) => {
              const date = new Date();
              date.setHours(Math.floor(seconds / 3600));
              date.setMinutes(Math.floor((seconds % 3600) / 60));
              date.setSeconds(seconds % 60);
              onDateChange("lockCustomLength", date);
            }}
            disabled={
              !settingsDraft.lockScreenAsBreakEnabled ||
              !settingsDraft.lockUseCustomTime
            }
          />
          <p className="text-sm text-muted-foreground">
            Screen locks shorter than this will not count as breaks. Defaults to
            two-thirds of your break length.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settingsDraft.lockUseCustomTime}
            onCheckedChange={onUseCustomTimeChange}
            disabled={!settingsDraft.lockScreenAsBreakEnabled}
          />
          <Label>Use custom time</Label>
        </div>
      </div>
    </SettingsCard>
  );
}
