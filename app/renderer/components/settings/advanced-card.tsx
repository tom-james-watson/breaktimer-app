import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "./settings-card";
import { Settings } from "../../../types/settings";

interface AdvancedCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
  hasPopupBreaks: boolean;
}

export default function AdvancedCard({
  settingsDraft,
  onSwitchChange,
  hasPopupBreaks,
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
            disabled={!hasPopupBreaks}
          />
          <Label>Immediately start breaks</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={settingsDraft.endBreakEnabled}
            onCheckedChange={(checked) =>
              onSwitchChange("endBreakEnabled", checked)
            }
            disabled={!hasPopupBreaks}
          />
          <Label>Allow ending break early</Label>
        </div>
      </div>
    </SettingsCard>
  );
}
