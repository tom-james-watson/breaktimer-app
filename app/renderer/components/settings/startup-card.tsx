import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <SettingsCard
      title={t('startAtLogin')}
      helperText={t('startAtLoginHelper')}
      toggle={{
        checked: settingsDraft.autoLaunch,
        onCheckedChange: (checked) => onSwitchChange("autoLaunch", checked),
      }}
    />
  );
}
