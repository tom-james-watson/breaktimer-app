import { Button } from "@/components/ui/button";

interface Props {
  backgroundColor: string;
  handleSave: () => void;
  showSave: boolean;
  textColor: string;
}

export default function SettingsHeader(props: Props) {
  const { backgroundColor, handleSave, showSave, textColor } = props;

  const style = {
    color: textColor,
    backgroundColor,
  };

  return (
    <nav
      className="flex items-center justify-between p-4 shadow-none border-b border-border h-16 min-h-16"
      style={style}
    >
      <div className="flex items-center">
        <h1 className="text-2xl font-bold" style={{ color: textColor }}>
          Settings
        </h1>
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
