import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const customStyle = {
    backgroundColor: settingsDraft.backgroundColor,
    color: settingsDraft.textColor,
  };

  return (
    <div className="rounded-lg border border-border p-4" style={customStyle}>
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-base font-semibold"
          style={{ color: settingsDraft.textColor }}
        >
          Theme
        </h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              className="text-sm font-medium"
              style={{ color: settingsDraft.textColor }}
            >
              Primary color
            </Label>
            <input
              className="w-20 h-10 rounded cursor-pointer border appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded"
              style={{
                backgroundColor: settingsDraft.backgroundColor,
                borderColor: `${settingsDraft.textColor}4D`, // 30% opacity
              }}
              type="color"
              value={settingsDraft.backgroundColor}
              onChange={onTextChange.bind(null, "backgroundColor")}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-sm font-medium"
              style={{ color: settingsDraft.textColor }}
            >
              Text color
            </Label>
            <input
              className="w-20 h-10 rounded cursor-pointer border border-border appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded"
              style={{ backgroundColor: settingsDraft.textColor }}
              type="color"
              value={settingsDraft.textColor}
              onChange={onTextChange.bind(null, "textColor")}
            />
          </div>
        </div>
        <Button
          onClick={onResetColors}
          variant="outline"
          style={{
            color: settingsDraft.textColor,
            borderColor: `${settingsDraft.textColor}4D`, // 30% opacity
          }}
          className="!bg-transparent hover:!bg-current/10 active:!bg-current/20"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
