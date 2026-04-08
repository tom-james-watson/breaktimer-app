import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "./settings-card";
import TimeInput from "./time-input";
import { NotificationType, Settings } from "../../../types/settings";

interface AdvancedCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
  onDateChange: (fieldName: string, newVal: Date) => void;
}

export default function AdvancedCard({
  settingsDraft,
  onSwitchChange,
  onDateChange,
}: AdvancedCardProps) {
  return (
    <SettingsCard title="Advanced">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={settingsDraft.automaticallyStartBreaks}
            onCheckedChange={(checked) =>
              onSwitchChange("automaticallyStartBreaks", checked)
            }
            disabled={settingsDraft.notificationType !== NotificationType.Popup}
          />
          <Label>Automatically start breaks</Label>
        </div>

        {settingsDraft.automaticallyStartBreaks && (
          <div className="pl-6 space-y-2">
            <Label className="text-sm font-medium">Delay before automatic start</Label>
            <TimeInput
              precision="seconds"
              value={settingsDraft.automaticallyStartBreaksDelaySeconds}
              onChange={(seconds) => {
                const date = new Date();
                date.setHours(Math.floor(seconds / 3600));
                date.setMinutes(Math.floor((seconds % 3600) / 60));
                date.setSeconds(seconds % 60);
                onDateChange("automaticallyStartBreaksDelaySeconds", date);
              }}
              disabled={settingsDraft.notificationType !== NotificationType.Popup}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            checked={settingsDraft.endBreakEnabled}
            onCheckedChange={(checked) =>
              onSwitchChange("endBreakEnabled", checked)
            }
          />
          <Label>Allow ending break early</Label>
        </div>
      </div>
    </SettingsCard>
  );
}
