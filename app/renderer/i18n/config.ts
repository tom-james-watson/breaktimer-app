import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "./en-US";
import zhCN from "./zh-CN";

i18n.use(initReactI18next).init({
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

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
}

export default i18n;
