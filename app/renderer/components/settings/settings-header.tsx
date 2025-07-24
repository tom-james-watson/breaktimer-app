import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Props {
  backgroundColor: string;
  handleSave: () => void;
  showSave: boolean;
  textColor: string;
  breaksEnabled: boolean;
  onBreaksEnabledChange: (checked: boolean) => void;
}

export default function SettingsHeader(props: Props) {
  const {
    backgroundColor,
    handleSave,
    showSave,
    textColor,
    breaksEnabled,
    onBreaksEnabledChange,
  } = props;

  const style = {
    color: textColor,
    backgroundColor,
  };

  return (
    <nav
      className="flex items-center justify-between p-4 shadow-none border-b border-border h-16 min-h-16"
      style={style}
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold" style={{ color: textColor }}>
          <strong>BreakTimer</strong>
        </h1>
        <Switch
          checked={breaksEnabled}
          onCheckedChange={onBreaksEnabledChange}
          className="scale-125"
        />
      </div>
      {showSave && (
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={handleSave}
            className="!bg-transparent hover:!bg-current/10 active:!bg-current/20"
            style={{ color: textColor, borderColor: textColor }}
          >
            Save
          </Button>
        </div>
      )}
    </nav>
  );
}
