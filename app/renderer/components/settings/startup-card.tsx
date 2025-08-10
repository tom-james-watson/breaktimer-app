import SettingsCard from "./settings-card";
import { Settings } from "../../../types/settings";

interface StartupCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
}

export default function StartupCard({
  settingsDraft,
  onSwitchChange,
}: StartupCardProps) {
  return (
    <SettingsCard
      title="Start at login"
      helperText="Automatically start BreakTimer when you log into your computer."
      toggle={{
        checked: settingsDraft.autoLaunch,
        onCheckedChange: (checked) => onSwitchChange("autoLaunch", checked),
      }}
    />
  );
}
