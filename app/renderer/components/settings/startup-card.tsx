import { useI18n } from "../../lib/i18n";
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
  const { t } = useI18n();

  return (
    <SettingsCard
      title={t("settings.startup.title")}
      helperText={t("settings.startup.helper")}
      toggle={{
        checked: settingsDraft.autoLaunch,
        onCheckedChange: (checked) => onSwitchChange("autoLaunch", checked),
      }}
    />
  );
}
