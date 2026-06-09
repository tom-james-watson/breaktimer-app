import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "../../../types/settings";
import SettingsCard from "./settings-card";
import { useTranslation } from "react-i18next";

interface LanguageCardProps {
  settingsDraft: Settings;
  onLanguageChange: (language: string) => void;
}

export default function LanguageCard({
  settingsDraft,
  onLanguageChange,
}: LanguageCardProps) {
  const { t } = useTranslation();

  return (
    <SettingsCard title={t("language")}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("language")}</Label>
        <Select
          value={settingsDraft.language}
          onValueChange={onLanguageChange}
        >
          <SelectTrigger style={{ width: 200 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh-CN">{t("chinese")}</SelectItem>
            <SelectItem value="en-US">{t("english")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SettingsCard>
  );
}
