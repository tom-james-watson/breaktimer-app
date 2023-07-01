import * as React from "react";
import classnames from "classnames";
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
import { Settings, NotificationType } from "../../types/settings";
import { toast } from "../toaster";
import SettingsHeader from "./SettingsHeader";
import styles from "./Settings.scss";

const initialDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export default function SettingsEl() {
  const [settingsDraft, setSettingsDraft] = React.useState<Settings | null>(
    null
  );
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [darkMode, setDarkMode] = React.useState(initialDarkMode);

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

  const handleSave = async () => {
    await ipcRenderer.invokeSetSettings(settingsDraft);
    toast("设置已保存", Intent.PRIMARY);
    setSettings(settingsDraft);
  };

  const settingsClassName = classnames(styles.settings, {
    "bp3-dark": darkMode,
    [styles.darkMode]: darkMode,
  });

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
            label="开启休息"
            checked={settingsDraft.breaksEnabled}
            onChange={handleSwitchChange.bind(null, "breaksEnabled")}
          />
        </FormGroup>
        <Tabs defaultSelectedTabId="break-settings">
          <Tab
            id="break-settings"
            title="休息设置"
            panel={
              <React.Fragment>
                <FormGroup label="提醒方式">
                  <HTMLSelect
                    value={settingsDraft.notificationType}
                    options={[
                      {
                        value: NotificationType.Popup,
                        label: "弹出提醒",
                      },
                      {
                        value: NotificationType.Notification,
                        label: "通知栏提醒",
                      },
                    ]}
                    onChange={handleNotificationTypeChange}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="休息频率" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, "breakFrequency")}
                    value={new Date(settingsDraft.breakFrequency)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="休息时长" labelInfo="(hh:mm:ss)">
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
                  label="允许跳过休息"
                  checked={settingsDraft.skipBreakEnabled}
                  onChange={handleSwitchChange.bind(null, "skipBreakEnabled")}
                  disabled={!settingsDraft.breaksEnabled}
                />
                <Switch
                  label="允许推迟休息"
                  checked={settingsDraft.postponeBreakEnabled}
                  onChange={handleSwitchChange.bind(
                    null,
                    "postponeBreakEnabled"
                  )}
                  disabled={!settingsDraft.breaksEnabled}
                />
                <FormGroup label="推迟时长" labelInfo="(hh:mm:ss)">
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
                <FormGroup label="推迟限制">
                  <HTMLSelect
                    value={settingsDraft.postponeLimit}
                    options={[
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                      { value: 5, label: "5" },
                      { value: 0, label: "无限制" },
                    ]}
                    onChange={handlePostponeLimitChange}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.postponeBreakEnabled
                    }
                  />
                </FormGroup>
                <Switch
                  label="在休息开始/结束时播放声音"
                  checked={settingsDraft.gongEnabled}
                  onChange={handleSwitchChange.bind(null, "gongEnabled")}
                  disabled={!settingsDraft.breaksEnabled}
                />
                <Switch
                  label="允许提前结束休息"
                  checked={settingsDraft.endBreakEnabled}
                  onChange={handleSwitchChange.bind(null, "endBreakEnabled")}
                  disabled={!settingsDraft.breaksEnabled}
                />
              </React.Fragment>
            }
          />
          <Tab
            id="customization"
            title="自定义"
            panel={
              <React.Fragment>
                <FormGroup label="休息标题">
                  <InputGroup
                    id="break-title"
                    value={settingsDraft.breakTitle}
                    onChange={handleTextChange.bind(null, "breakTitle")}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="休息消息">
                  <InputGroup
                    id="break-message"
                    value={settingsDraft.breakMessage}
                    onChange={handleTextChange.bind(null, "breakMessage")}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="主题色">
                  <InputGroup
                    className={styles.colorPicker}
                    type="color"
                    value={settingsDraft.backgroundColor}
                    onChange={handleTextChange.bind(null, "backgroundColor")}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="文字颜色">
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
                    label="显示背景"
                    checked={settingsDraft.showBackdrop}
                    onChange={handleSwitchChange.bind(null, "showBackdrop")}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      settingsDraft.notificationType !== NotificationType.Popup
                    }
                  />
                </FormGroup>
                <FormGroup label="背景颜色">
                  <InputGroup
                    className={styles.colorPicker}
                    type="color"
                    value={settingsDraft.backdropColor}
                    onChange={handleTextChange.bind(null, "backdropColor")}
                    disabled={!settingsDraft.showBackdrop}
                  />
                </FormGroup>
                <FormGroup label="背景不透明度">
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
                  <Button onClick={handleResetColors}>恢复默认颜色</Button>
                </FormGroup>
              </React.Fragment>
            }
          />
          <Tab
            id="working-hours"
            title="工作时间"
            panel={
              <React.Fragment>
                <FormGroup>
                  <Switch
                    label="按照工作时间"
                    checked={settingsDraft.workingHoursEnabled}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursEnabled"
                    )}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="开始时间">
                  <TimePicker
                    onChange={handleDateChange.bind(null, "workingHoursFrom")}
                    value={new Date(settingsDraft.workingHoursFrom)}
                    selectAllOnFocus
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                </FormGroup>
                <FormGroup label="结束时间">
                  <TimePicker
                    onChange={handleDateChange.bind(null, "workingHoursTo")}
                    value={new Date(settingsDraft.workingHoursTo)}
                    selectAllOnFocus
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                </FormGroup>
                <FormGroup label="开启休息">
                  <Switch
                    label="星期一"
                    checked={settingsDraft.workingHoursMonday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursMonday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                  <Switch
                    label="星期二"
                    checked={settingsDraft.workingHoursTuesday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursTuesday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                  <Switch
                    label="星期三"
                    checked={settingsDraft.workingHoursWednesday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursWednesday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                  <Switch
                    label="星期四"
                    checked={settingsDraft.workingHoursThursday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursThursday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                  <Switch
                    label="星期五"
                    checked={settingsDraft.workingHoursFriday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursFriday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                  <Switch
                    label="星期六"
                    checked={settingsDraft.workingHoursSaturday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursSaturday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                  <Switch
                    label="星期日"
                    checked={settingsDraft.workingHoursSunday}
                    onChange={handleSwitchChange.bind(
                      null,
                      "workingHoursSunday"
                    )}
                    disabled={
                      !settingsDraft.breaksEnabled ||
                      !settingsDraft.workingHoursEnabled
                    }
                  />
                </FormGroup>
              </React.Fragment>
            }
          />
          <Tab
            id="idle-reset"
            title="空闲重置"
            panel={
              <React.Fragment>
                <FormGroup>
                  <Switch
                    label="启用空闲重置"
                    checked={settingsDraft.idleResetEnabled}
                    onChange={handleSwitchChange.bind(null, "idleResetEnabled")}
                    disabled={!settingsDraft.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup
                  label="但你达到空闲时长时，重置休息倒计时"
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
                  label="空闲重置时显示通知"
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
              title="系统"
              panel={
                <React.Fragment>
                  <FormGroup>
                    <Switch
                      label="开启开机自启动"
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
