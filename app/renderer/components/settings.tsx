import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { translate } from "../../i18n";
import {
  getDefaultBreakCopy,
  NotificationType,
  Settings,
  SoundType,
  UiLanguage,
} from "../../types/settings";
import { I18nProvider } from "../lib/i18n";
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

function localizeDefaultBreakCopy(
  currentSettings: Settings,
  targetLanguage: UiLanguage,
): Settings {
  const targetDefaults = getDefaultBreakCopy(targetLanguage);
  const otherDefaults = getDefaultBreakCopy(
    targetLanguage === UiLanguage.ZhCN ? UiLanguage.EnUS : UiLanguage.ZhCN,
  );

  const titleTrimmed = currentSettings.breakTitle.trim();
  const messageTrimmed = currentSettings.breakMessage.trim();

  const shouldReplaceTitle =
    titleTrimmed.length === 0 ||
    currentSettings.breakTitle === targetDefaults.title ||
    currentSettings.breakTitle === otherDefaults.title;

  const shouldReplaceMessage =
    messageTrimmed.length === 0 ||
    currentSettings.breakMessage === targetDefaults.message ||
    currentSettings.breakMessage === otherDefaults.message;

  return {
    ...currentSettings,
    language: targetLanguage,
    breakTitle: shouldReplaceTitle
      ? targetDefaults.title
      : currentSettings.breakTitle,
    breakMessage: shouldReplaceMessage
      ? targetDefaults.message
      : currentSettings.breakMessage,
  };
}

export default function SettingsEl() {
  const [settingsDraft, setSettingsDraft] = useState<Settings | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    (async () => {
      const rawSettings = (await ipcRenderer.invokeGetSettings()) as Settings;
      const settings = localizeDefaultBreakCopy(
        rawSettings,
        rawSettings.language,
      );
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

  useEffect(() => {
    if (!settingsDraft) return;
    document.title = translate(settingsDraft.language, "window.settings.title");
  }, [settingsDraft]);

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

  const handleLanguageChange = (language: UiLanguage): void => {
    setSettingsDraft(localizeDefaultBreakCopy(settingsDraft, language));
  };

  const handleSave = async () => {
    await ipcRenderer.invokeSetSettings(settingsDraft);
    toast(translate(settingsDraft.language, "settings.toast.saved"));
    setSettings(settingsDraft);
  };

  return (
    <I18nProvider language={settingsDraft.language}>
      <div className="h-screen w-full flex flex-col bg-background">
        <Tabs
          defaultValue="break-settings"
          className="w-full h-full flex flex-col"
        >
          <SettingsHeader
            handleSave={handleSave}
            showSave={dirty}
            language={settingsDraft.language}
            onLanguageChange={handleLanguageChange}
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
                title={translate(
                  settingsDraft.language,
                  "settings.workingHours.title",
                )}
                helperText={translate(
                  settingsDraft.language,
                  "settings.workingHours.helper",
                )}
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
    </I18nProvider>
  );
}
