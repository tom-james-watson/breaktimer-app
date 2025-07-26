import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SettingsCard from "./settings-card";
import { Settings } from "../../../types/settings";

interface ThemeCardProps {
  settingsDraft: Settings;
  onTextChange: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetColors: () => void;
}

export default function ThemeCard({
  settingsDraft,
  onTextChange,
  onResetColors,
}: ThemeCardProps) {
  return (
    <SettingsCard title="Theme">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Primary color</Label>
            <Input
              className="w-20 h-10 rounded cursor-pointer"
              type="color"
              value={settingsDraft.backgroundColor}
              onChange={onTextChange.bind(null, "backgroundColor")}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text color</Label>
            <Input
              className="w-20 h-10 rounded cursor-pointer"
              type="color"
              value={settingsDraft.textColor}
              onChange={onTextChange.bind(null, "textColor")}
            />
          </div>
        </div>
        <Button onClick={onResetColors} variant="outline">
          Reset
        </Button>
      </div>
    </SettingsCard>
  );
}
