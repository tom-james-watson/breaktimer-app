import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <SettingsCard
      title={t('skip')}
      helperText={t('skipHelper')}
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
