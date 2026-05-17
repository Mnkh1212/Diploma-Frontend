import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "dark" | "light";

export type AccentKey = "green" | "purple" | "blue" | "orange" | "pink";

export const ACCENTS: { key: AccentKey; label: string; color: string }[] = [
  { key: "green", label: "Ногоон", color: "#00C853" },
  { key: "purple", label: "Ягаан", color: "#7C4DFF" },
  { key: "blue", label: "Хөх", color: "#448AFF" },
  { key: "orange", label: "Улбар", color: "#FF9F43" },
  { key: "pink", label: "Цэнхэр", color: "#E056A0" },
];

export type WidgetKey = "savings" | "accounts" | "quickActions";

export interface WidgetVisibility {
  savings: boolean;
  accounts: boolean;
  quickActions: boolean;
}

const DEFAULT_WIDGETS: WidgetVisibility = {
  savings: true,
  accounts: true,
  quickActions: true,
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof darkColors;
  accentKey: AccentKey;
  accent: string;
  setAccent: (key: AccentKey) => void;
  widgets: WidgetVisibility;
  setWidget: (key: WidgetKey, value: boolean) => void;
}

const darkColors = {
  bg: "#0D0D0D",
  card: "#1A1A2E",
  surface: "#16213E",
  border: "#2A2A3E",
  text: "#FFFFFF",
  textSecondary: "#9CA3AF",
  textMuted: "#666666",
};

const lightColors = {
  bg: "#F5F5F5",
  card: "#FFFFFF",
  surface: "#F0F0F0",
  border: "#E0E0E0",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

const STORAGE_THEME = "theme";
const STORAGE_ACCENT = "accent";
const STORAGE_WIDGETS = "home_widgets";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [accentKey, setAccentKey] = useState<AccentKey>("green");
  const [widgets, setWidgets] = useState<WidgetVisibility>(DEFAULT_WIDGETS);

  useEffect(() => {
    (async () => {
      try {
        const [t, a, w] = await Promise.all([
          AsyncStorage.getItem(STORAGE_THEME),
          AsyncStorage.getItem(STORAGE_ACCENT),
          AsyncStorage.getItem(STORAGE_WIDGETS),
        ]);
        if (t === "light" || t === "dark") setTheme(t);
        if (a && ACCENTS.some((x) => x.key === a)) setAccentKey(a as AccentKey);
        if (w) {
          const parsed = JSON.parse(w);
          setWidgets({ ...DEFAULT_WIDGETS, ...parsed });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    Appearance.setColorScheme(theme);
  }, [theme]);

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await AsyncStorage.setItem(STORAGE_THEME, next);
  };

  const setAccent = async (key: AccentKey) => {
    setAccentKey(key);
    await AsyncStorage.setItem(STORAGE_ACCENT, key);
  };

  const setWidget = async (key: WidgetKey, value: boolean) => {
    const next = { ...widgets, [key]: value };
    setWidgets(next);
    await AsyncStorage.setItem(STORAGE_WIDGETS, JSON.stringify(next));
  };

  const colors = theme === "dark" ? darkColors : lightColors;
  const accent = ACCENTS.find((x) => x.key === accentKey)?.color || "#00C853";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        colors,
        accentKey,
        accent,
        setAccent,
        widgets,
        setWidget,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
