import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Layout } from "@/components/Layout";
import i18n, { readStoredLanguage } from "@/i18n";
import { applyLanguage, applyTheme, useStore } from "@/store/useStore";

export function App() {
  useEffect(() => {
    const language = useStore.getState().language || readStoredLanguage();
    const theme = useStore.getState().theme;
    applyLanguage(language);
    applyTheme(theme);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Layout />
    </I18nextProvider>
  );
}

export default App;
