import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingsCard from "./settings-card";
import TimeInput from "./time-input";
import { NotificationType, Settings } from "../../../types/settings";

interface BreaksCardProps {
  settingsDraft: Settings;
  onNotificationTypeChange: (value: string) => void;
  onDateChange: (fieldName: string, newVal: Date) => void;
  onTextChange: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BreaksCard({
  settingsDraft,
  onNotificationTypeChange,
  onDateChange,
  onTextChange,
}: BreaksCardProps) {
  return (
    <SettingsCard title="Breaks">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
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
          <div className="space-y-2">
            <Label className="text-sm font-medium">Frequency</Label>
            <TimeInput
              precision="seconds"
              value={settingsDraft.breakFrequencySeconds}
              onChange={(seconds) => {
                const date = new Date();
                date.setHours(Math.floor(seconds / 3600));
                date.setMinutes(Math.floor((seconds % 3600) / 60));
                date.setSeconds(seconds % 60);
                onDateChange("breakFrequency", date);
              }}
              disabled={!settingsDraft.breaksEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Length</Label>
            <TimeInput
              precision="seconds"
              value={settingsDraft.breakLengthSeconds}
              onChange={(seconds) => {
                const date = new Date();
                date.setHours(Math.floor(seconds / 3600));
                date.setMinutes(Math.floor((seconds % 3600) / 60));
                date.setSeconds(seconds % 60);
                onDateChange("breakLength", date);
              }}
              disabled={
                !settingsDraft.breaksEnabled ||
                settingsDraft.notificationType !== NotificationType.Popup
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Message</Label>
          <Input
            id="break-message"
            className="text-sm"
            value={settingsDraft.breakMessage}
            onChange={onTextChange.bind(null, "breakMessage")}
            disabled={!settingsDraft.breaksEnabled}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
