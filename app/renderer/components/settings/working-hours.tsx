import {
  DayConfig,
  daysConfig,
  Settings,
  WorkingHours,
} from "../../../types/settings";
import DaySettings from "./day-settings";

interface WorkingHoursProps {
  settingsDraft: Settings;
  setSettingsDraft: (settingsDraft: Settings) => void;
}

export default function WorkingHoursSettings({
  settingsDraft,
  setSettingsDraft,
}: WorkingHoursProps) {
  const handleDayChange = (day: DayConfig, workingHours: WorkingHours) => {
    setSettingsDraft({
      ...settingsDraft,
      [day.key]: workingHours,
    });
  };

  const handleApplyToAll = (sourceDay: DayConfig, targetDays: DayConfig[]) => {
    const sourceHours = settingsDraft[sourceDay.key];
    const newDraft = { ...settingsDraft };

    targetDays.forEach((targetDay) => {
      newDraft[targetDay.key] = {
        enabled: sourceHours.enabled,
        ranges: [...sourceHours.ranges],
      };
    });

    setSettingsDraft(newDraft);
  };

  return (
    <div className="space-y-2">
      {daysConfig.map((day) => (
        <DaySettings
          key={day.key}
          day={day}
          workingHours={settingsDraft[day.key]}
          onChange={(workingHours) => handleDayChange(day, workingHours)}
          disabled={!settingsDraft.workingHoursEnabled}
          onApplyToAll={(targetDays) => handleApplyToAll(day, targetDays)}
        />
      ))}
    </div>
  );
}
