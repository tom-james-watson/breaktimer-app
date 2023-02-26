import * as React from "react";
import {
  Tabs,
  Tab,
  Switch,
  HTMLSelect,
  FormGroup,
  InputGroup,
  Intent,
  Button,
  Slider,
} from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import {Settings, NotificationType, WorkingHoursAdvanced} from "../../types/settings"
import { toast } from "../toaster";
import SettingsHeader from "./SettingsHeader";
import styles from "./Settings.scss";
import {Scrollbars} from "react-custom-scrollbars"
import {SelectBar} from "./SelectBar";

export default function SettingsEl() {
  const [settingsDraft, setSettingsDraft] = React.useState<Settings | null>(
    null
  );
  const [settings, setSettings] = React.useState<Settings | null>(null);

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

  const handleNotificationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const notificationType = e.target.value as NotificationType;
    setSettingsDraft({ ...settingsDraft, notificationType });
  };

  const handleDateChange = (field: keyof Settings, newVal: Date): void => {
    setSettingsDraft({
      ...settingsDraft,
      [field]: newVal,
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

  const handleWorkingHoursAdvancedChange = (field: keyof WorkingHoursAdvanced,
    e: number[]) => {
    setSettingsDraft({
      ...settingsDraft,
      workingHoursAdvanced: {...settingsDraft.workingHoursAdvanced, [field]: e}
    })
  }

  const handleSave = async () => {
    await ipcRenderer.invokeSetSettings(settingsDraft);
    toast("Settings saved", Intent.PRIMARY);
    setSettings(settingsDraft);
  };

  const SelectBarWorkingHoursAdvanced: React.FC<{f: string}> = ({f}) => {
    const f0 = f as keyof WorkingHoursAdvanced
    return (
      <SelectBar field={f0} setFunction={handleWorkingHoursAdvancedChange} initialValue={settingsDraft.workingHoursAdvanced[f0]} />
    )
  }

  const WorkingHoursWorkday: React.FC<{day: string}> = ({day}) => {
    const field = "workingHours" + day as keyof Settings
    return (
      <div>
        <Switch
          label={day}
          checked={settingsDraft[field] as boolean}
          onChange={handleSwitchChange.bind(
            null,
            field.toString()
          )}
          disabled={
            !settingsDraft.breaksEnabled ||
            !settingsDraft.workingHoursEnabled
          }
        />
        {settingsDraft.workingHoursAdvancedEnabled && <SelectBarWorkingHoursAdvanced f={field.toString()} />}
      </div>
    )
  }

  return (
    <React.Fragment>
      <SettingsHeader
        backgroundColor={settingsDraft.backgroundColor}
        handleSave={handleSave}
        showSave={dirty}
        textColor={settingsDraft.textColor}
      />
      <main className={styles.settings}>
        <FormGroup>
          <Switch
            label="Breaks enabled"
            checked={settingsDraft.breaksEnabled}
            onChange={handleSwitchChange.bind(null, "breaksEnabled")}
          />
        </FormGroup>
        <Tabs defaultSelectedTabId="break-settings">
          <Tab
            id="break-settings"
            title="Break Settings"
            panel={
              <React.Fragment>
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
                    value={new Date(settingsDraft.breakFrequency)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Break length" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, "breakLength")}
                    value={new Date(settingsDraft.breakLength)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      settingsDraft.notificationType !== NotificationType.Popup
                    }
                  />
                </FormGroup>
                <Switch
                  label="Allow skip break"
                  checked={settingsDraft.skipBreakEnabled}
                  onChange={handleSwitchChange.bind(null, "skipBreakEnabled")}
                  disabled={!settingsDraft.breaksEnabled}
                />
                <Switch
                  label="Allow snooze break"
                  checked={settingsDraft.postponeBreakEnabled}
                  onChange={handleSwitchChange.bind(
                    null,
                    "postponeBreakEnabled"
                  )}
                  disabled={!settingsDraft.breaksEnabled}
                />
                <FormGroup label="Snooze length" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, "postponeLength")}
                    value={new Date(settingsDraft.postponeLength)}
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
                <Switch
                  label="Play gong sound on break start/end"
                  checked={settingsDraft.gongEnabled}
                  onChange={handleSwitchChange.bind(null, "gongEnabled")}
                  disabled={!settingsDraft.breaksEnabled}
                />
                <Switch
                  label="Allow end break"
                  checked={settingsDraft.endBreakEnabled}
                  onChange={handleSwitchChange.bind(null, "endBreakEnabled")}
                  disabled={!settingsDraft.breaksEnabled}
                />
              </React.Fragment>
            }
          />
          <Tab
            id="customization"
            title="Customization"
            panel={
              <React.Fragment>
                <FormGroup label="Break title">
                  <InputGroup
                    id="break-title"
                    value={settingsDraft.breakTitle}
                    onChange={handleTextChange.bind(null, "breakTitle")}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
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
                <FormGroup>
                  <Switch
                    label="Show backdrop"
                    checked={settingsDraft.showBackdrop}
                    onChange={handleSwitchChange.bind(null, "showBackdrop")}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      settingsDraft.notificationType !== NotificationType.Popup
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
                    onChange={handleSliderChange.bind(null, "backdropOpacity")}
                    value={settingsDraft.backdropOpacity}
                    disabled={!settingsDraft.showBackdrop}
                  />
                </FormGroup>
                <FormGroup>
                  <Button onClick={handleResetColors}>Reset colors</Button>
                </FormGroup>
              </React.Fragment>
            }
          />
          <Tab
            id="working-hours"
            title="Working Hours"
            panel={
              <React.Fragment>
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
                  <Switch
                    label="Advanced Working Hours Settings"
                    checked={settingsDraft.workingHoursAdvancedEnabled}
                    onChange={
                      handleSwitchChange.bind(
                        null,
                        "workingHoursAdvancedEnabled"
                      )
                    }
                    disabled={!settingsDraft.workingHoursEnabled || !settingsDraft.breaksEnabled}
                  />

                </FormGroup>
                <Scrollbars style={{height: window.innerHeight - 270}}>
                  {!settingsDraft.workingHoursAdvancedEnabled && <FormGroup>
                    <FormGroup label="Breaks from">
                      <TimePicker
                        onChange={handleDateChange.bind(null, "workingHoursFrom")}
                        value={new Date(settingsDraft.workingHoursFrom)}
                        selectAllOnFocus
                        disabled={
                          !settingsDraft.breaksEnabled ||
                          !settingsDraft.workingHoursEnabled ||
                          settingsDraft.workingHoursAdvancedEnabled
                        }
                      />
                    </FormGroup>
                    <FormGroup label="Breaks to">
                      <TimePicker
                        onChange={handleDateChange.bind(null, "workingHoursTo")}
                        value={new Date(settingsDraft.workingHoursTo)}
                        selectAllOnFocus
                        disabled={
                          !settingsDraft.breaksEnabled ||
                          !settingsDraft.workingHoursEnabled ||
                          settingsDraft.workingHoursAdvancedEnabled
                        }
                      />
                    </FormGroup>
                  </FormGroup>}
                  <FormGroup label="Breaks on">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) =>
                      <WorkingHoursWorkday day={day} key={index} />
                    )
                    }
                  </FormGroup>
                </Scrollbars>
              </React.Fragment>
            }
          />
          <Tab
            id="idle-reset"
            title="Idle Reset"
            panel={
              <React.Fragment>
                <FormGroup>
                  <Switch
                    label="Enable idle reset"
                    checked={settingsDraft.idleResetEnabled}
                    onChange={handleSwitchChange.bind(null, "idleResetEnabled")}
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
              </React.Fragment>
            }
          />
          {processEnv.SNAP === undefined && (
            <Tab
              id="system"
              title="System"
              panel={
                <React.Fragment>
                  <FormGroup>
                    <Switch
                      label="Start at login"
                      checked={settingsDraft.autoLaunch}
                      onChange={handleSwitchChange.bind(null, "autoLaunch")}
                    />
                  </FormGroup>
                </React.Fragment>
              }
            />
          )}
        </Tabs>
      </main>
    </React.Fragment>
  );
}
