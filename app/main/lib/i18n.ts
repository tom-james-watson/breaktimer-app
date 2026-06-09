import i18n from "i18next";
import enUS from "../../renderer/i18n/en-US";
import zhCN from "../../renderer/i18n/zh-CN";

// Main process i18n instance - must be initialized before use
const mainI18n = i18n.createInstance();
mainI18n.init({
  resources: {
    "en-US": enUS,
    "zh-CN": zhCN,
  },
  lng: "zh-CN",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
});

export function setMainLanguage(lang: string) {
  mainI18n.changeLanguage(lang);
}

export default mainI18n;
