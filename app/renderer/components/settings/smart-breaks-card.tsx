import { Label } from "@/components/ui/label";
import SettingsCard from "./settings-card";
import TimeInput from "./time-input";
import { Settings } from "../../../types/settings";

interface SmartBreaksCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
  onDateChange: (fieldName: string, newVal: Date) => void;
}

export default function SmartBreaksCard({
  settingsDraft,
  onSwitchChange,
  onDateChange,
}: SmartBreaksCardProps) {
  return (
    <SettingsCard
      title="Smart Breaks: Inactivity"
      helperText="Automatically detect natural breaks and reset the break timer."
      toggle={{
        checked: settingsDraft.idleResetEnabled,
        onCheckedChange: (checked) =>
          onSwitchChange("idleResetEnabled", checked),
      }}
    >
      <div className="space-y-2">
        <Label className="text-sm font-medium">Minimum idle time</Label>
        <TimeInput
          precision="seconds"
          value={settingsDraft.idleResetLengthSeconds}
          onChange={(seconds) => {
            const date = new Date();
            date.setHours(Math.floor(seconds / 3600));
            date.setMinutes(Math.floor((seconds % 3600) / 60));
            date.setSeconds(seconds % 60);
            onDateChange("idleResetLength", date);
          }}
          disabled={!settingsDraft.idleResetEnabled}
        />
      </div>
    </SettingsCard>
  );
}
