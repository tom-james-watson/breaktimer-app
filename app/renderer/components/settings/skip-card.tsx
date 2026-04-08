import SettingsCard from "./settings-card";
import { Settings } from "../../../types/settings";
import { shouldStartBreakImmediately } from "./settings-utils";

interface SkipCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
}

export default function SkipCard({
  settingsDraft,
  onSwitchChange,
}: SkipCardProps) {
  const immediatelyStartBreaks = shouldStartBreakImmediately(settingsDraft);

  return (
    <SettingsCard
      title="Skip"
      helperText="Allow skipping breaks entirely without rescheduling them."
      toggle={{
        checked:
          settingsDraft.skipBreakEnabled &&
          !immediatelyStartBreaks,
        onCheckedChange: (checked) =>
          onSwitchChange("skipBreakEnabled", checked),
        disabled: immediatelyStartBreaks,
      }}
    />
  );
}
