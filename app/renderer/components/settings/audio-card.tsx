import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import SettingsCard from "./settings-card";
import { SoundSelect } from "../sound-select";
import { Settings, SoundType } from "../../../types/settings";

interface AudioCardProps {
  settingsDraft: Settings;
  onSoundTypeChange: (soundType: SoundType) => void;
  onSliderChange: (field: keyof Settings, values: number[]) => void;
}

export default function AudioCard({
  settingsDraft,
  onSoundTypeChange,
  onSliderChange,
}: AudioCardProps) {
  return (
    <SettingsCard title="Audio">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Break sound</Label>
          <SoundSelect
            value={settingsDraft.soundType}
            onChange={onSoundTypeChange}
            volume={settingsDraft.breakSoundVolume}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Break sound volume</Label>
          <div className="px-2">
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[settingsDraft.breakSoundVolume]}
              onValueChange={(values) =>
                onSliderChange("breakSoundVolume", values)
              }
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>0%</span>
              <span>{Math.round(settingsDraft.breakSoundVolume * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
