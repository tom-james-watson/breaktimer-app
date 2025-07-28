import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="border-b border-border" style={style}>
      <nav className="flex items-center justify-between p-4 h-16 min-h-16">
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
      <div className="px-4 pb-4">
        <TabsList
          className={`grid w-full ${
            processEnv.SNAP === undefined ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          <TabsTrigger value="break-settings">General</TabsTrigger>
          <TabsTrigger value="working-hours">Working Hours</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          {processEnv.SNAP === undefined && (
            <TabsTrigger value="system">System</TabsTrigger>
          )}
        </TabsList>
      </div>
    </div>
  );
}
