import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UiLanguage } from "../../../types/settings";
import { useI18n } from "../../lib/i18n";

interface Props {
  handleSave: () => void;
  showSave: boolean;
  language: UiLanguage;
  onLanguageChange: (language: UiLanguage) => void;
}

export default function SettingsHeader(props: Props) {
  const { handleSave, showSave, language, onLanguageChange } = props;
  const { t } = useI18n();

  return (
    <div className="border-b border-border bg-background">
      <nav className="flex items-center justify-between p-4 h-16 min-h-16">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {t("settings.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(value) => onLanguageChange(value as UiLanguage)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UiLanguage.ZhCN}>
                {t("language.chinese")}
              </SelectItem>
              <SelectItem value={UiLanguage.EnUS}>
                {t("language.english")}
              </SelectItem>
            </SelectContent>
          </Select>
          {showSave && (
            <Button variant="outline" onClick={handleSave}>
              {t("settings.save")}
            </Button>
          )}
        </div>
      </nav>
      <div className="px-4 pb-4">
        <TabsList
          className={`grid w-full ${
            processEnv.SNAP === undefined ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          <TabsTrigger value="break-settings">
            {t("settings.tab.general")}
          </TabsTrigger>
          <TabsTrigger value="working-hours">
            {t("settings.tab.workingHours")}
          </TabsTrigger>
          <TabsTrigger value="customization">
            {t("settings.tab.customization")}
          </TabsTrigger>
          {processEnv.SNAP === undefined && (
            <TabsTrigger value="system">{t("settings.tab.system")}</TabsTrigger>
          )}
        </TabsList>
      </div>
    </div>
  );
}
