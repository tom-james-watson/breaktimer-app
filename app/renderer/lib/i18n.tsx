import { ReactNode, createContext, useContext, useMemo } from "react";
import { TranslateParams, normalizeLanguage, translate } from "../../i18n";
import { UiLanguage } from "../../types/settings";

interface I18nContextValue {
  language: UiLanguage;
  t: (key: string, params?: TranslateParams) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: UiLanguage.ZhCN,
  t: (key: string, params?: TranslateParams) =>
    translate(UiLanguage.ZhCN, key, params),
});

interface I18nProviderProps {
  language: UiLanguage | string | undefined;
  children: ReactNode;
}

export function I18nProvider({ language, children }: I18nProviderProps) {
  const normalizedLanguage = normalizeLanguage(language);

  const value = useMemo<I18nContextValue>(
    () => ({
      language: normalizedLanguage,
      t: (key: string, params?: TranslateParams) =>
        translate(normalizedLanguage, key, params),
    }),
    [normalizedLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
