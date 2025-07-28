import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { NotificationType, Settings, SoundType } from "../../types/settings";
import { toast } from "../toaster";
import AdvancedCard from "./settings/advanced-card";
import AudioCard from "./settings/audio-card";
import BackdropCard from "./settings/backdrop-card";
import BreaksCard from "./settings/breaks-card";
import SettingsCard from "./settings/settings-card";
import SettingsHeader from "./settings/settings-header";
import SkipCard from "./settings/skip-card";
import SmartBreaksCard from "./settings/smart-breaks-card";
import SnoozeCard from "./settings/snooze-card";
import StartupCard from "./settings/startup-card";
import ThemeCard from "./settings/theme-card";
import WorkingHoursSettings from "./settings/working-hours";
import WelcomeModal from "./welcome-modal";

export default function SettingsEl() {
  const [settingsDraft, setSettingsDraft] = useState<Settings | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;
      setSettingsDraft(settings);
      setSettings(settings);
      
      // Check if this is the first time running the app
      const appInitialized = await ipcRenderer.invokeGetAppInitialized();
      setShowWelcomeModal(!appInitialized);
    })();
  }, []);

  const dirty = useMemo(() => {
    return JSON.stringify(settingsDraft) !== JSON.stringify(settings);
  }, [settings, settingsDraft]);

  if (settings === null || settingsDraft === null) {
    return null;
  }

  const handleNotificationTypeChange = (value: string): void => {
    const notificationType = value as NotificationType;
    setSettingsDraft({ ...settingsDraft, notificationType });
  };

  const handleDateChange = (fieldName: string, newVal: Date): void => {
    const seconds =
      newVal.getHours() * 3600 + newVal.getMinutes() * 60 + newVal.getSeconds();

    let secondsField: keyof Settings;
    if (fieldName === "breakFrequency") {
      secondsField = "breakFrequencySeconds";
    } else if (fieldName === "breakLength") {
      secondsField = "breakLengthSeconds";
    } else if (fieldName === "postponeLength") {
      secondsField = "postponeLengthSeconds";
    } else if (fieldName === "idleResetLength") {
      secondsField = "idleResetLengthSeconds";
    } else {
      return;
    }

    setSettingsDraft({
      ...settingsDraft,
      [secondsField]: seconds,
    });
  };

  const handlePostponeLimitChange = (value: string): void => {
    const postponeLimit = Number(value);
    setSettingsDraft({ ...settingsDraft, postponeLimit });
  };

  const handleTextChange = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: e.target.value,
    });
  };

  const handleSwitchChange = (field: string, checked: boolean): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: checked,
    });
  };

  const handleResetColors = (): void => {
    setSettingsDraft({
      ...settingsDraft,
      textColor: "#ffffff",
      backgroundColor: "#16a085",
      backdropOpacity: 0.7,
    });
  };

  const handleSliderChange = (
    field: keyof Settings,
    values: number[],
  ): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: values[0],
    });
  };

  const handleSoundTypeChange = (soundType: SoundType): void => {
    setSettingsDraft({
      ...settingsDraft,
      soundType,
    });
  };

  const handleSave = async () => {
    await ipcRenderer.invokeSetSettings(settingsDraft);
    toast("Settings saved");
    setSettings(settingsDraft);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <Tabs
        defaultValue="break-settings"
        className="w-full h-full flex flex-col"
      >
        <SettingsHeader
          backgroundColor={settingsDraft.backgroundColor}
          handleSave={handleSave}
          showSave={dirty}
          textColor={settingsDraft.textColor}
        />
        <div className="flex-1 overflow-auto p-6 min-h-0">
          <TabsContent value="break-settings" className="m-0 space-y-8">
            <BreaksCard
              settingsDraft={settingsDraft}
              onNotificationTypeChange={handleNotificationTypeChange}
              onDateChange={handleDateChange}
              onTextChange={handleTextChange}
              onSwitchChange={handleSwitchChange}
            />

            <SmartBreaksCard
              settingsDraft={settingsDraft}
              onSwitchChange={handleSwitchChange}
              onDateChange={handleDateChange}
            />

            <SnoozeCard
              settingsDraft={settingsDraft}
              onSwitchChange={handleSwitchChange}
              onDateChange={handleDateChange}
              onPostponeLimitChange={handlePostponeLimitChange}
            />

            <SkipCard
              settingsDraft={settingsDraft}
              onSwitchChange={handleSwitchChange}
            />

            <AdvancedCard
              settingsDraft={settingsDraft}
              onSwitchChange={handleSwitchChange}
            />
          </TabsContent>

          <TabsContent value="working-hours" className="m-0 space-y-6">
            <SettingsCard
              title="Working Hours"
              helperText="Only show breaks during your configured work schedule."
              toggle={{
                checked: settingsDraft.workingHoursEnabled,
                onCheckedChange: (checked) =>
                  handleSwitchChange("workingHoursEnabled", checked),
                disabled: !settingsDraft.breaksEnabled,
              }}
            >
              <WorkingHoursSettings
                settingsDraft={settingsDraft}
                setSettingsDraft={setSettingsDraft}
              />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="customization" className="m-0 space-y-8">
            <ThemeCard
              settingsDraft={settingsDraft}
              onTextChange={handleTextChange}
              onResetColors={handleResetColors}
            />

            <AudioCard
              settingsDraft={settingsDraft}
              onSoundTypeChange={handleSoundTypeChange}
              onSliderChange={handleSliderChange}
            />

            <BackdropCard
              settingsDraft={settingsDraft}
              onSwitchChange={handleSwitchChange}
              onSliderChange={handleSliderChange}
            />
          </TabsContent>

          {processEnv.SNAP === undefined && (
            <TabsContent value="system" className="m-0 space-y-6">
              <StartupCard
                settingsDraft={settingsDraft}
                onSwitchChange={handleSwitchChange}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
    </div>
  );
}
