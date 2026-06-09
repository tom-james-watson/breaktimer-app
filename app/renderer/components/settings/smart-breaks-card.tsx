import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <SettingsCard
      title={t('smartBreaks')}
      helperText={t('smartBreaksHelper')}
      toggle={{
        checked: settingsDraft.idleResetEnabled,
        onCheckedChange: (checked) =>
          onSwitchChange("idleResetEnabled", checked),
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('minimumIdleTime')}</Label>
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
        <div className="flex items-center space-x-2">
          <Switch
            checked={settingsDraft.idleResetNotification}
            onCheckedChange={(checked) =>
              onSwitchChange("idleResetNotification", checked)
            }
            disabled={!settingsDraft.idleResetEnabled}
          />
          <Label>{t('showIdleNotification')}</Label>
        </div>
      </div>
    </SettingsCard>
  );
}
