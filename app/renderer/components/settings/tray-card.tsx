import { FormGroup } from "@/components/ui/form-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MonochromeIconVariant,
  Settings,
  TrayTextMode,
} from "../../../types/settings";
import SettingsCard from "./settings-card";

interface TrayCardProps {
  settingsDraft: Settings;
  onMonochromeIconVariantChange: (value: string) => void;
  onSwitchChange: (field: string, checked: boolean) => void;
  onTrayTextModeChange: (value: string) => void;
}

function MonochromeIconCard({
  settingsDraft,
  onSwitchChange,
  onMonochromeIconVariantChange,
}: Pick<
  TrayCardProps,
  "settingsDraft" | "onSwitchChange" | "onMonochromeIconVariantChange"
>) {
  return (
    <SettingsCard
      title="Monochrome Tray Icon"
      helperText="Use a monochrome icon in the system tray. Recommended for light or dark panels."
      toggle={{
        checked: settingsDraft.monochromeIcon,
        onCheckedChange: (checked) =>
          onSwitchChange("monochromeIcon", checked),
      }}
    >
      <FormGroup label="Icon color">
        <Select
          value={settingsDraft.monochromeIconVariant}
          disabled={!settingsDraft.monochromeIcon}
          onValueChange={onMonochromeIconVariantChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MonochromeIconVariant.Auto}>
              Auto (follow system theme)
            </SelectItem>
            <SelectItem value={MonochromeIconVariant.Dark}>
              Always dark
            </SelectItem>
            <SelectItem value={MonochromeIconVariant.Light}>
              Always light
            </SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>
    </SettingsCard>
  );
}

function MenuBarTextCard({
  settingsDraft,
  onSwitchChange,
  onTrayTextModeChange,
}: Pick<
  TrayCardProps,
  "settingsDraft" | "onSwitchChange" | "onTrayTextModeChange"
>) {
  return (
    <SettingsCard
      title="Menu Bar Text"
      helperText="Show timing information next to the menu bar icon."
      toggle={{
        checked: settingsDraft.trayTextEnabled,
        onCheckedChange: (checked) =>
          onSwitchChange("trayTextEnabled", checked),
      }}
    >
      <FormGroup label="Text">
        <Select
          value={settingsDraft.trayTextMode}
          disabled={!settingsDraft.trayTextEnabled}
          onValueChange={onTrayTextModeChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TrayTextMode.TimeToNextBreak}>
              Time to next break
            </SelectItem>
            <SelectItem value={TrayTextMode.TimeSinceLastBreak}>
              Time since last break
            </SelectItem>
          </SelectContent>
        </Select>
      </FormGroup>
    </SettingsCard>
  );
}

export default function TrayCard(props: TrayCardProps) {
  return (
    <>
      {processPlatform === "linux" && <MonochromeIconCard {...props} />}
      {processPlatform == "darwin" && <MenuBarTextCard {...props} />}
    </>
  );
}
