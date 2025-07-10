import {
  Button,
  Collapse,
  FocusStyleManager,
  FormGroup,
  InputGroup,
  Intent,
  OverlaysProvider,
  Slider,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import classnames from "classnames";
import * as React from "react";
import { NotificationType, Settings } from "../../types/settings";
import { toast } from "../toaster";
import BreakTab from "./BreakTab";
import styles from "./Settings.scss";
import SettingsHeader from "./SettingsHeader";
import WorkingHoursSettings from "./WorkingHoursSettings";

const initialDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

FocusStyleManager.onlyShowFocusOnTabs();

export default function SettingsEl() {
  const [settingsDraft, setSettingsDraft] = React.useState<Settings | null>(
    null
  );
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [darkMode, setDarkMode] = React.useState(initialDarkMode);
  const [showAdvancedAppearance, setShowAdvanedAppearance] =
    React.useState(false);

  React.useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        setDarkMode(event.matches);
      });
  }, [setDarkMode]);

  React.useEffect(() => {
    (async () => {
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;
      setSettingsDraft(settings);
      setSettings(settings);
    })();
  }, []);

  const dirty = React.useMemo(() => {
    return JSON.stringify(settingsDraft) !== JSON.stringify(settings);
  }, [settings, settingsDraft]);

  if (settings === null || settingsDraft === null) {
    return null;
  }

  const handleDateChange = (field: keyof Settings, newVal: Date): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: newVal,
    });
  };

  const handleTextChange = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: e.target.value,
    });
  };

  const handleSwitchChange = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: e.target.checked,
    });
  };

  const handleResetColors = (): void => {
    setSettingsDraft({
      ...settingsDraft,
      textColor: "#ffffff",
      backgroundColor: "#16a085",
      backdropColor: "#001914",
      backdropOpacity: 0.7,
    });
  };

  const handleSliderChange = (field: keyof Settings, newVal: number): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: newVal,
    });
  };

  const handleSave = async () => {
    await ipcRenderer.invokeSetSettings(settingsDraft);
    toast("Settings saved", Intent.PRIMARY);
    setSettings(settingsDraft);
  };

  const settingsClassName = classnames(styles.settings, {
    "bp5-dark": darkMode,
    [styles.darkMode]: darkMode,
  });

  return (
    <OverlaysProvider>
      <SettingsHeader
        backgroundColor={settingsDraft.backgroundColor}
        handleSave={handleSave}
        showSave={dirty}
        textColor={settingsDraft.textColor}
      />
      <main className={settingsClassName}>
        <FormGroup className={styles.breaksEnabled}>
          <Switch
            label="Enable breaks"
            checked={settingsDraft.breaksEnabled}
            onChange={handleSwitchChange.bind(null, "breaksEnabled")}
          />
        </FormGroup>
        <div className={styles.tabs}>
          <Tabs defaultSelectedTabId="break-settings">
            <Tab
              id="break-settings"
              title="Breaks"
              panel={<BreakTab setSettingsDraft={setSettingsDraft} dirty={dirty} />}
              className={styles.breakTabs}
            />
            <Tab
              id="working-hours"
              title="Working Hours"
              panel={
                <>
                  <FormGroup>
                    <Switch
                      label="Enable working hours"
                      checked={settingsDraft.workingHoursEnabled}
                      onChange={handleSwitchChange.bind(
                        null,
                        "workingHoursEnabled"
                      )}
                      disabled={!settingsDraft.breaksEnabled}
                    />
                  </FormGroup>
                  <WorkingHoursSettings
                    settingsDraft={settingsDraft}
                    setSettingsDraft={setSettingsDraft}
                  />
                </>
              }
            />
            <Tab
              id="appearance"
              title="Appearance"
              panel={
                <>
                  <Button
                    onClick={() =>
                      setShowAdvanedAppearance(!showAdvancedAppearance)
                    }
                    rightIcon={
                      showAdvancedAppearance ? "chevron-up" : "chevron-down"
                    }
                    outlined
                    className={styles.advanced}
                  >
                    Advanced
                  </Button>
                  <Collapse
                    isOpen={showAdvancedAppearance}
                    className={styles.collapse}
                  >
                    <FormGroup label="Primary color">
                      <InputGroup
                        className={styles.colorPicker}
                        type="color"
                        value={settingsDraft.backgroundColor}
                        onChange={handleTextChange.bind(
                          null,
                          "backgroundColor"
                        )}
                        disabled={!settingsDraft.breaksEnabled}
                      />
                    </FormGroup>
                    <FormGroup label="Text color">
                      <InputGroup
                        className={styles.colorPicker}
                        type="color"
                        value={settingsDraft.textColor}
                        onChange={handleTextChange.bind(null, "textColor")}
                        disabled={!settingsDraft.breaksEnabled}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Switch
                        label="Show backdrop"
                        checked={settingsDraft.showBackdrop}
                        onChange={handleSwitchChange.bind(null, "showBackdrop")}
                        disabled={
                          !settingsDraft.breaksEnabled ||
                          settingsDraft.notificationType !==
                          NotificationType.Popup
                        }
                      />
                    </FormGroup>
                    <FormGroup label="Backdrop color">
                      <InputGroup
                        className={styles.colorPicker}
                        type="color"
                        value={settingsDraft.backdropColor}
                        onChange={handleTextChange.bind(null, "backdropColor")}
                        disabled={!settingsDraft.showBackdrop}
                      />
                    </FormGroup>
                    <FormGroup label="Backdrop opacity">
                      <Slider
                        min={0.2}
                        max={1}
                        stepSize={0.05}
                        labelPrecision={2}
                        labelStepSize={0.2}
                        onChange={handleSliderChange.bind(
                          null,
                          "backdropOpacity"
                        )}
                        value={settingsDraft.backdropOpacity}
                        disabled={!settingsDraft.showBackdrop}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Button onClick={handleResetColors}>Reset colors</Button>
                    </FormGroup>
                  </Collapse>
                </>
              }
            />
            <Tab
              id="idle-reset"
              title="Idle Reset"
              panel={
                <>
                  <FormGroup>
                    <Switch
                      label="Enable idle reset"
                      checked={settingsDraft.idleResetEnabled}
                      onChange={handleSwitchChange.bind(
                        null,
                        "idleResetEnabled"
                      )}
                      disabled={!settingsDraft.breaksEnabled}
                    />
                  </FormGroup>
                  <FormGroup
                    label="Reset break countdown when idle for"
                    labelInfo="(hh:mm:ss)"
                  >
                    <TimePicker
                      onChange={handleDateChange.bind(null, "idleResetLength")}
                      value={new Date(settingsDraft.idleResetLength)}
                      selectAllOnFocus
                      precision={TimePrecision.SECOND}
                      disabled={
                        !settingsDraft.breaksEnabled ||
                        !settingsDraft.idleResetEnabled
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Switch
                      label="Show notification on idle reset"
                      checked={settingsDraft.idleResetNotification}
                      onChange={handleSwitchChange.bind(
                        null,
                        "idleResetNotification"
                      )}
                      disabled={
                        !settingsDraft.breaksEnabled ||
                        !settingsDraft.idleResetEnabled
                      }
                    />
                  </FormGroup>
                </>
              }
            />
            {processEnv.SNAP === undefined && (
              <Tab
                id="system"
                title="System"
                panel={
                  <>
                    <FormGroup>
                      <Switch
                        label="Start at login"
                        checked={settingsDraft.autoLaunch}
                        onChange={handleSwitchChange.bind(null, "autoLaunch")}
                      />
                    </FormGroup>
                  </>
                }
              />
            )}
          </Tabs>
        </div>
      </main>
    </OverlaysProvider>
  );
}
