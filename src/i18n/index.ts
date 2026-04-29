import { I18n } from "i18n-js";
import { Platform, NativeModules } from "react-native";
import mn from "./mn";
import en from "./en";

const i18n = new I18n({ mn, en });

// Утасны хэлийг автоматаар тодорхойлох (native module шаардахгүй)
const getDeviceLocale = (): string => {
  try {
    if (Platform.OS === "ios") {
      return (
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        "mn"
      );
    }
    return NativeModules.I18nManager?.localeIdentifier || "mn";
  } catch {
    return "mn";
  }
};

const deviceLocale = getDeviceLocale();
i18n.locale = deviceLocale.startsWith("mn") ? "mn" : "en";
i18n.enableFallback = true;
i18n.defaultLocale = "mn";

export default i18n;
export const t = (key: string, options?: Record<string, any>) => i18n.t(key, options);
export const setLocale = (locale: "mn" | "en") => { i18n.locale = locale; };
export const getLocale = () => i18n.locale;
