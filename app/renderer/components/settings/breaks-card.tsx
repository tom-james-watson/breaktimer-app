import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BreakSchedule, NotificationType, Settings } from "../../../types/settings";
import SettingsCard from "./settings-card";
import TimeInput from "./time-input";

interface BreaksCardProps {
  settingsDraft: Settings;
  onNotificationTypeChange: (value: string) => void;
  onScheduleChange: (
    scheduleId: string,
    patch: Partial<BreakSchedule>,
  ) => void;
  onScheduleAdd: () => void;
  onScheduleRemove: (scheduleId: string) => void;
  onSwitchChange: (field: string, checked: boolean) => void;
}

export default function BreaksCard({
  settingsDraft,
  onNotificationTypeChange,
  onScheduleChange,
  onScheduleAdd,
  onScheduleRemove,
  onSwitchChange,
}: BreaksCardProps) {
  const canEditSchedules = settingsDraft.breaksEnabled;

  return (
    <SettingsCard
      title="Breaks"
      toggle={{
        checked: settingsDraft.breaksEnabled,
        onCheckedChange: (checked) => onSwitchChange("breaksEnabled", checked),
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Type</Label>
          <Select
            value={settingsDraft.notificationType}
            onValueChange={onNotificationTypeChange}
            disabled={!settingsDraft.breaksEnabled}
          >
            <SelectTrigger style={{ width: 145 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NotificationType.Popup}>
                Popup break
              </SelectItem>
              <SelectItem value={NotificationType.Notification}>
                Simple notification
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {settingsDraft.breakSchedules.map((schedule, index) => {
            const scheduleDisabled =
              !settingsDraft.breaksEnabled || !schedule.enabled;
            const lengthDisabled =
              scheduleDisabled ||
              settingsDraft.notificationType !== NotificationType.Popup;
            const scheduleLabel =
              schedule.title?.trim() || `Break ${index + 1}`;

            return (
              <div
                key={schedule.id}
                className="rounded-md border border-border bg-background p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{scheduleLabel}</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) =>
                        onScheduleChange(schedule.id, { enabled: checked })
                      }
                      disabled={!settingsDraft.breaksEnabled}
                    />
                    {settingsDraft.breakSchedules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onScheduleRemove(schedule.id)}
                        disabled={!canEditSchedules}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Frequency</Label>
                    <TimeInput
                      precision="seconds"
                      value={schedule.frequencySeconds}
                      onChange={(seconds) =>
                        onScheduleChange(schedule.id, {
                          frequencySeconds: seconds,
                        })
                      }
                      disabled={scheduleDisabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Length</Label>
                    <TimeInput
                      precision="seconds"
                      value={schedule.lengthSeconds}
                      onChange={(seconds) =>
                        onScheduleChange(schedule.id, {
                          lengthSeconds: seconds,
                        })
                      }
                      disabled={lengthDisabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Title</Label>
                    <Input
                      className="text-sm"
                      value={schedule.title}
                      onChange={(event) =>
                        onScheduleChange(schedule.id, {
                          title: event.target.value,
                        })
                      }
                      disabled={scheduleDisabled}
                      placeholder={`Break ${index + 1}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Message</Label>
                  <Textarea
                    className="text-sm resize-none"
                    rows={3}
                    value={schedule.message}
                    onChange={(event) =>
                      onScheduleChange(schedule.id, {
                        message: event.target.value,
                      })
                    }
                    disabled={scheduleDisabled}
                    placeholder="Enter your break message..."
                  />
                </div>
              </div>
            );
          })}

          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onScheduleAdd}
              disabled={!canEditSchedules}
            >
              Add break
            </Button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
