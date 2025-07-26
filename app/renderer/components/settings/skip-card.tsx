import SettingsCard from "./settings-card";
import { Settings } from "../../../types/settings";

interface SkipCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
}

export default function SkipCard({
  settingsDraft,
  onSwitchChange,
}: SkipCardProps) {
  return (
    <SettingsCard
      title="Skip"
      helperText="Allow skipping breaks entirely without rescheduling them."
      toggle={{
        checked:
          settingsDraft.skipBreakEnabled &&
          !settingsDraft.immediatelyStartBreaks,
        onCheckedChange: (checked) =>
          onSwitchChange("skipBreakEnabled", checked),
        disabled: settingsDraft.immediatelyStartBreaks,
      }}
    />
  );
}
