import { useI18n } from "../../lib/i18n";
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
  const { t } = useI18n();

  return (
    <SettingsCard
      title={t("settings.skip.title")}
      helperText={t("settings.skip.helper")}
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
