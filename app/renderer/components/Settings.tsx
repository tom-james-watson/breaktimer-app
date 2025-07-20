import {
  Button,
  Collapse,
  FocusStyleManager,
  FormGroup,
  HTMLSelect,
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
import { useEffect, useMemo, useState } from "react";
import { NotificationType, Settings } from "../../types/settings";
import { toast } from "../toaster";
import * as styles from "./Settings.scss";
import SettingsHeader from "./SettingsHeader";
import { SoundSelect } from "./SoundSelect";
import WorkingHoursSettings from "./WorkingHoursSettings";

const initialDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

FocusStyleManager.onlyShowFocusOnTabs();

export default function SettingsEl() {
  const [settingsDraft, setSettingsDraft] = useState<Settings | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [showAdvancedBreaks, setShowAdvanedBreaks] = useState(false);
  const [showAdvancedAppearance, setShowAdvanedAppearance] = useState(false);

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        setDarkMode(event.matches);
      });
  }, [setDarkMode]);

  useEffect(() => {
    (async () => {
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;
      setSettingsDraft(settings);
      setSettings(settings);
    })();
  }, []);

  const dirty = useMemo(() => {
    return JSON.stringify(settingsDraft) !== JSON.stringify(settings);
  }, [settings, settingsDraft]);

  if (settings === null || settingsDraft === null) {
    return null;
  }

  const handleNotificationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const notificationType = e.target.value as NotificationType;
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

  const handlePostponeLimitChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const postponeLimit = Number(e.target.value);
    setSettingsDraft({ ...settingsDraft, postponeLimit });
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
    "bp6-dark": darkMode,
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
              panel={
                <>
                  <FormGroup label="Notify me with">
                    <HTMLSelect
                      value={settingsDraft.notificationType}
                      options={[
                        {
                          value: NotificationType.Popup,
                          label: "Popup break",
                        },
                        {
                          value: NotificationType.Notification,
                          label: "Simple notification",
                        },
                      ]}
                      onChange={handleNotificationTypeChange}
                      disabled={!settingsDraft.breaksEnabled}
                    />
                  </FormGroup>
                  <FormGroup label="Break frequency" labelInfo="(hh:mm:ss)">
                    <TimePicker
                      onChange={handleDateChange.bind(null, "breakFrequency")}
                      value={
                        new Date(
                          0,
                          0,
                          0,
                          Math.floor(
                            settingsDraft.breakFrequencySeconds / 3600
                          ),
                          Math.floor(
                            (settingsDraft.breakFrequencySeconds % 3600) / 60
                          ),
                          settingsDraft.breakFrequencySeconds % 60
                        )
                      }
                      selectAllOnFocus
                      precision={TimePrecision.SECOND}
                      disabled={!settingsDraft.breaksEnabled}
                    />
                  </FormGroup>
                  <FormGroup label="Break length" labelInfo="(hh:mm:ss)">
                    <TimePicker
                      onChange={handleDateChange.bind(null, "breakLength")}
                      value={
                        new Date(
                          0,
                          0,
                          0,
                          Math.floor(settingsDraft.breakLengthSeconds / 3600),
                          Math.floor(
                            (settingsDraft.breakLengthSeconds % 3600) / 60
                          ),
                          settingsDraft.breakLengthSeconds % 60
                        )
                      }
                      selectAllOnFocus
                      precision={TimePrecision.SECOND}
                      disabled={
                        !settingsDraft.breaksEnabled ||
                        settingsDraft.notificationType !==
                          NotificationType.Popup
                      }
                    />
                  </FormGroup>
                  <Button
                    onClick={() => setShowAdvanedBreaks(!showAdvancedBreaks)}
                    rightIcon={
                      showAdvancedBreaks ? "chevron-up" : "chevron-down"
                    }
                    outlined
                    className={styles.advanced}
                  >
                    Advanced
                  </Button>
                  <Collapse
                    isOpen={showAdvancedBreaks}
                    className={styles.collapse}
                  >
                    <FormGroup>
                      <Switch
                        label="Allow skip break"
                        checked={settingsDraft.skipBreakEnabled}
                        onChange={handleSwitchChange.bind(
                          null,
                          "skipBreakEnabled"
                        )}
                        disabled={!settingsDraft.breaksEnabled}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Switch
                        label="Allow snooze break"
                        checked={settingsDraft.postponeBreakEnabled}
                        onChange={handleSwitchChange.bind(
                          null,
                          "postponeBreakEnabled"
                        )}
                        disabled={!settingsDraft.breaksEnabled}
                      />
                    </FormGroup>
                    <FormGroup label="Snooze length" labelInfo="(hh:mm:ss)">
                      <TimePicker
                        onChange={handleDateChange.bind(null, "postponeLength")}
                        value={
                          new Date(
                            0,
                            0,
                            0,
                            Math.floor(
                              settingsDraft.postponeLengthSeconds / 3600
                            ),
                            Math.floor(
                              (settingsDraft.postponeLengthSeconds % 3600) / 60
                            ),
                            settingsDraft.postponeLengthSeconds % 60
                          )
                        }
                        selectAllOnFocus
                        precision={TimePrecision.SECOND}
                        disabled={
                          !settingsDraft.breaksEnabled ||
                          !settingsDraft.postponeBreakEnabled
                        }
                      />
                    </FormGroup>
                    <FormGroup label="Snooze limit">
                      <HTMLSelect
                        value={settingsDraft.postponeLimit}
                        options={[
                          { value: 1, label: "1" },
                          { value: 2, label: "2" },
                          { value: 3, label: "3" },
                          { value: 4, label: "4" },
                          { value: 5, label: "5" },
                          { value: 0, label: "No limit" },
                        ]}
                        onChange={handlePostponeLimitChange}
                        disabled={
                          !settingsDraft.breaksEnabled ||
                          !settingsDraft.postponeBreakEnabled
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Switch
                        label="Allow ending break early"
                        checked={settingsDraft.endBreakEnabled}
                        onChange={handleSwitchChange.bind(
                          null,
                          "endBreakEnabled"
                        )}
                        disabled={!settingsDraft.breaksEnabled}
                      />
                    </FormGroup>
                  </Collapse>
                </>
              }
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
              id="customization"
              title="Customization"
              panel={
                <>
                  <FormGroup label="Break message">
                    <InputGroup
                      id="break-message"
                      value={settingsDraft.breakMessage}
                      onChange={handleTextChange.bind(null, "breakMessage")}
                      disabled={!settingsDraft.breaksEnabled}
                    />
                  </FormGroup>
                  <FormGroup label="Primary color">
                    <InputGroup
                      className={styles.colorPicker}
                      type="color"
                      value={settingsDraft.backgroundColor}
                      onChange={handleTextChange.bind(null, "backgroundColor")}
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
                  <FormGroup label="Break sound">
                    <SoundSelect
                      value={settingsDraft.soundType}
                      onChange={(soundType) => {
                        setSettingsDraft({
                          ...settingsDraft,
                          soundType,
                        });
                      }}
                      disabled={!settingsDraft.breaksEnabled}
                      volume={settingsDraft.breakSoundVolume}
                    />
                  </FormGroup>
                  <FormGroup label="Break sound volume">
                    <Slider
                      min={0}
                      max={1}
                      stepSize={0.1}
                      labelStepSize={0.5}
                      labelRenderer={(value) => `${Math.round(value * 100)}%`}
                      onChange={handleSliderChange.bind(
                        null,
                        "breakSoundVolume"
                      )}
                      value={settingsDraft.breakSoundVolume}
                      disabled={!settingsDraft.breaksEnabled}
                    />
                  </FormGroup>
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
                      value={
                        new Date(
                          0,
                          0,
                          0,
                          Math.floor(
                            settingsDraft.idleResetLengthSeconds / 3600
                          ),
                          Math.floor(
                            (settingsDraft.idleResetLengthSeconds % 3600) / 60
                          ),
                          settingsDraft.idleResetLengthSeconds % 60
                        )
                      }
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
