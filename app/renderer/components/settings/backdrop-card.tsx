import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import SettingsCard from "./settings-card";
import { NotificationType, Settings } from "../../../types/settings";

interface BackdropCardProps {
  settingsDraft: Settings;
  onSwitchChange: (field: string, checked: boolean) => void;
  onSliderChange: (field: keyof Settings, values: number[]) => void;
}

export default function BackdropCard({
  settingsDraft,
  onSwitchChange,
  onSliderChange,
}: BackdropCardProps) {
  return (
    <SettingsCard
      title="Backdrop"
      helperText="Show a colored overlay behind break windows to limit distractions."
      toggle={{
        checked: settingsDraft.showBackdrop,
        onCheckedChange: (checked) => onSwitchChange("showBackdrop", checked),
        disabled: settingsDraft.notificationType !== NotificationType.Popup,
      }}
    >
      <div className="space-y-2">
        <Label className="text-sm font-medium">Opacity</Label>
        <div className="px-2">
          <Slider
            min={0.2}
            max={1}
            step={0.05}
            value={[settingsDraft.backdropOpacity]}
            onValueChange={(values) =>
              onSliderChange("backdropOpacity", values)
            }
            disabled={!settingsDraft.showBackdrop}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>20%</span>
            <span>{Math.round(settingsDraft.backdropOpacity * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
