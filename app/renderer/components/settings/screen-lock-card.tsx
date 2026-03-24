import SettingsCard from "./settings-card";
import { Settings } from "../../../types/settings";

interface ScreenLockCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
}

export default function ScreenLockCard({
  settingsDraft,
  onSwitchChange,
}: ScreenLockCardProps) {
  return (
    <SettingsCard
      title="Screen Lock Reset"
      helperText="Reset the break timer when your screen is locked and unlocked."
      toggle={{
        checked: settingsDraft.resetOnScreenLock,
        onCheckedChange: (checked) =>
          onSwitchChange("resetOnScreenLock", checked),
      }}
    />
  );
}
