import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fa from "./locales/fa.json";

export const LANG_STORAGE_KEY = "arcade-agent-lang";
export type AppLanguage = "en" | "fa";

export function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "fa";
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  return stored === "en" || stored === "fa" ? stored : "fa";
}

export function languageDir(lang: AppLanguage): "rtl" | "ltr" {
  return lang === "fa" ? "rtl" : "ltr";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en as Record<string, unknown> },
    fa: { translation: fa as Record<string, unknown> },
  },
  lng: readStoredLanguage(),
  fallbackLng: "fa",
  interpolation: { escapeValue: false },
});

export default i18n;
