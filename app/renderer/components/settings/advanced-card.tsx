import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "./settings-card";
import { NotificationType, Settings } from "../../../types/settings";

interface AdvancedCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
}

export default function AdvancedCard({
  settingsDraft,
  onSwitchChange,
}: AdvancedCardProps) {
  return (
    <SettingsCard title="Advanced">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={settingsDraft.immediatelyStartBreaks}
            onCheckedChange={(checked) =>
              onSwitchChange("immediatelyStartBreaks", checked)
            }
            disabled={settingsDraft.notificationType !== NotificationType.Popup}
          />
          <Label>Immediately start breaks</Label>
        </div>

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
