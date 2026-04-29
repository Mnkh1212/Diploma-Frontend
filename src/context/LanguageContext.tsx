import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { setLocale, getLocale } from "../i18n";

type Locale = "mn" | "en";

interface LanguageContextType {
  locale: Locale;
  t: (key: string, options?: Record<string, any>) => string;
  changeLanguage: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getLocale() as Locale);

  React.useEffect(() => {
    AsyncStorage.getItem("app_language").then((saved) => {
      if (saved === "mn" || saved === "en") {
        setLocale(saved);
        setLocaleState(saved);
      }
    });
  }, []);

  const changeLanguage = useCallback(async (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
    await AsyncStorage.setItem("app_language", newLocale);
  }, []);

  const t = useCallback((key: string, options?: Record<string, any>) => {
    return i18n.t(key, options);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
