import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof darkColors;
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

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    Appearance.setColorScheme(theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    } catch {}
  };

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
