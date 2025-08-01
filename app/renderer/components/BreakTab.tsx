import {
  Button,
  Collapse,
  FocusStyleManager,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import * as React from "react";
import {
  Break,
  NotificationType,
  Settings,
  SoundType,
} from "../../types/settings";
import styles from "./BreakTab.scss";
import { SoundSelect } from "./SoundSelect";

FocusStyleManager.onlyShowFocusOnTabs();

export default function BreakTab({
  setSettingsDraft,
  dirty,
}: {
  setSettingsDraft: React.Dispatch<React.SetStateAction<Settings | null>>;
  dirty: boolean
}) {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [breaks, setBreaks] = React.useState<Break[]>([]);
  const [showAdvanced, setShowAdvaned] = React.useState(false);

  const disabled = !settings?.breaksEnabled;

  React.useEffect(() => {
    (async () => {
      const settings = (await ipcRenderer.invokeGetSettings()) as Settings;
      setSettings(settings);
      setBreaks(settings.breaks ?? []);
    })();
  }, []);

  React.useEffect(() => {
    setSettingsDraft(
      (settings: Settings | null): Settings =>
        ({ ...settings, breaks } as Settings)
    );
  }, [breaks, setSettingsDraft]);

  if (breaks === null) {
    return null;
  }

  const findBreakIdxByName = (name: string) =>
    breaks.findIndex((i) => i.name === name);

  const updateBreakByIdx = (idx: number, item: Break) => {
    const newArr = [...breaks];

    if (idx >= 0 && idx < newArr.length) {
      newArr[idx] = item;
    } else {
      console.warn("Index out of bounds when updating array.");
    }
    return newArr;
  };

  const handleNotificationTypeChange = (
    name: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const notificationType = e.target.value as NotificationType;
    const idx = findBreakIdxByName(name);
    if (idx !== -1) {
      const newBreak = { ...breaks[idx], notificationType };
      const newBreaks = updateBreakByIdx(findBreakIdxByName(name), newBreak);
      setBreaks([...newBreaks]);
    }
  };

  const handleDateChange = (
    name: string,
    field: keyof Break,
    newVal: Date
  ): void => {
    const idx = findBreakIdxByName(name);
    if (idx !== -1) {
      const newBreak = {
        ...breaks[idx],
        [field]: newVal,
      };
      const newBreaks = updateBreakByIdx(findBreakIdxByName(name), newBreak);
      setBreaks([...newBreaks]);
    }
  };

  const handleTextChange = (
    name: string,
    field: keyof Break,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const idx = findBreakIdxByName(name);
    if (idx !== -1) {
      const newBreak = {
        ...breaks[idx],
        [field]: e.target.value,
      };

      if (field === "name" && findBreakIdxByName(e.target.value) !== -1) {
        return
      }

      const newBreaks = updateBreakByIdx(findBreakIdxByName(name), newBreak);
      setBreaks([...newBreaks]);
    }
  };

  const handlePostponeLimitChange = (
    name: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const postponeLimit = Number(e.target.value);

    const idx = findBreakIdxByName(name);
    if (idx !== -1) {
      const newBreak = {
        ...breaks[idx],
        postponeLimit,
      };
      const newBreaks = updateBreakByIdx(findBreakIdxByName(name), newBreak);
      setBreaks([...newBreaks]);
    }
  };

  const handleSoundType = (name: string, soundType: SoundType): void => {
    const idx = findBreakIdxByName(name);
    if (idx !== -1) {
      const newBreak = {
        ...breaks[idx],
        soundType,
      };
      const newBreaks = updateBreakByIdx(findBreakIdxByName(name), newBreak);
      setBreaks([...newBreaks]);
    }
  };

  const handleSwitchChange = (
    name: string,
    field: keyof Break,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const idx = findBreakIdxByName(name);
    if (idx !== -1) {
      const newBreak = {
        ...breaks[idx],
        [field]: e.target.checked,
      };
      const newBreaks = updateBreakByIdx(findBreakIdxByName(name), newBreak);
      setBreaks([...newBreaks]);
    }
  };

  const handleAddBreak = (): void => {
    const breakLen = breaks?.length ?? 1
    const newBreak = {
      name: `New Break ${breakLen ? breakLen - 1 : ''}`,
      frequency: new Date(0, 0, 0, 0, 28),
      len: new Date(0, 0, 0, 0, 2),
      title: 'Time for a break!',
      message: 'Rest your eyes. Stretch your legs. Breathe. Relax.',
      notificationType: NotificationType.Popup,
      postponeLimit: 0,
      postponeLength: new Date(0, 0, 0, 0, 5),
      soundType: 'GONG',
      endBreakEnabled: true,
      skipBreakEnabled: false,
      postponeBreakEnabled: true
    } as Break;
    setBreaks([...breaks, newBreak]);
  };

  const handleRemoveBreak = (i: number): void => {
    breaks.splice(i, 1);
    setBreaks([...breaks]);
  };

  return (
    <div className={styles.breakTabs}>
      <Tabs defaultSelectedTabId={`break-${(settings?.breaks?.length ?? 1) - 1}`}>
        {breaks.length &&
          breaks?.map((b, i) => (
            <Tab
              key={`break-${i}`}
              id={`break-${i}`}
              title={b.name}
              panel={
                <>
                  <FormGroup label="Name">
                    <InputGroup
                      id="break-name"
                      value={b.name}
                      onChange={handleTextChange.bind(null, b.name, "name")}
                      disabled={disabled}
                    />
                  </FormGroup>

                  <FormGroup label="Title">
                    <InputGroup
                      id="break-title"
                      value={b.title}
                      onChange={handleTextChange.bind(null, b.name, "title")}
                      disabled={disabled}
                    />
                  </FormGroup>
                  <FormGroup label="Message">
                    <InputGroup
                      id="break-message"
                      value={b.message}
                      onChange={handleTextChange.bind(null, b.name, "message")}
                      disabled={disabled}
                    />
                  </FormGroup>
                  <FormGroup label="Notify me with">
                    <HTMLSelect
                      value={b.notificationType}
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
                      onChange={handleNotificationTypeChange.bind(null, b.name)}
                      disabled={disabled}
                    />
                  </FormGroup>
                  <FormGroup label="Break frequency" labelInfo="(hh:mm:ss)">
                    <TimePicker
                      onChange={handleDateChange.bind(
                        null,
                        b.name,
                        "frequency"
                      )}
                      value={new Date(b.frequency)}
                      selectAllOnFocus
                      precision={TimePrecision.SECOND}
                      disabled={disabled}
                    />
                  </FormGroup>
                  <FormGroup label="Break length" labelInfo="(hh:mm:ss)">
                    <TimePicker
                      onChange={handleDateChange.bind(null, b.name, "len")}
                      value={new Date(b.len)}
                      selectAllOnFocus
                      precision={TimePrecision.SECOND}
                      disabled={
                        !settings?.breaksEnabled ||
                        b?.notificationType !== NotificationType.Popup
                      }
                    />
                  </FormGroup>
                  <Button
                    onClick={() => setShowAdvaned(!showAdvanced)}
                    rightIcon={showAdvanced ? "chevron-up" : "chevron-down"}
                    outlined
                    className={styles.advanced}
                  >
                    Advanced
                  </Button>
                  <Collapse isOpen={showAdvanced} className={styles.collapse}>
                    {i !== 0 && (
                      <Button
                        onClick={() => handleRemoveBreak(i)}
                        intent="danger"
                      >
                        Remove Break
                      </Button>
                    )}
                    <FormGroup>
                      <Switch
                        label="Allow skip break"
                        checked={b?.skipBreakEnabled}
                        onChange={handleSwitchChange.bind(
                          null,
                          b.name,
                          "skipBreakEnabled"
                        )}
                        disabled={disabled}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Switch
                        label="Allow snooze break"
                        checked={b?.postponeBreakEnabled}
                        onChange={handleSwitchChange.bind(
                          null,
                          b.name,
                          "postponeBreakEnabled"
                        )}
                        disabled={disabled}
                      />
                    </FormGroup>
                    <FormGroup label="Snooze length" labelInfo="(hh:mm:ss)">
                      <TimePicker
                        onChange={handleDateChange.bind(
                          null,
                          b.name,
                          "postponeLength"
                        )}
                        value={new Date(b.postponeLength)}
                        selectAllOnFocus
                        precision={TimePrecision.SECOND}
                        disabled={
                          !settings?.breaksEnabled ||
                          !b?.postponeBreakEnabled
                        }
                      />
                    </FormGroup>
                    <FormGroup label="Snooze limit">
                      <HTMLSelect
                        value={b.postponeLimit}
                        options={[
                          { value: 1, label: "1" },
                          { value: 2, label: "2" },
                          { value: 3, label: "3" },
                          { value: 4, label: "4" },
                          { value: 5, label: "5" },
                          { value: 0, label: "No limit" },
                        ]}
                        onChange={handlePostponeLimitChange.bind(null, b.name)}
                        disabled={
                          !settings?.breaksEnabled ||
                          !b?.postponeBreakEnabled
                        }
                      />
                    </FormGroup>
                    <FormGroup label="Break sound">
                      <SoundSelect
                        value={b.soundType}
                        onChange={(soundType) =>
                          handleSoundType(b.name, soundType)
                        }
                        disabled={disabled}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Switch
                        label="Allow ending break early"
                        checked={b?.endBreakEnabled}
                        onChange={handleSwitchChange.bind(
                          null,
                          b.name,
                          "endBreakEnabled"
                        )}
                        disabled={disabled}
                      />
                    </FormGroup>
                  </Collapse>
                </>
              }
            />
          ))}
        <Button onClick={handleAddBreak} outlined disabled={dirty}>
          Add Break
        </Button>
      </Tabs>
    </div>
  );
}
