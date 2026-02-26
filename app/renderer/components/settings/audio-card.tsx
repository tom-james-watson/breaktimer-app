import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "../../lib/i18n";
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
  const { t } = useI18n();

  return (
    <SettingsCard title={t("settings.audio.title")}>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("settings.audio.breakSound")}
          </Label>
          <SoundSelect
            value={settingsDraft.soundType}
            onChange={onSoundTypeChange}
            volume={settingsDraft.breakSoundVolume}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("settings.audio.breakSoundVolume")}
          </Label>
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
