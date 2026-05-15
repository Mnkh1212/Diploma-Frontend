import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import AIChatScreen from "./AIChatScreen";
import DataImportScreen from "./DataImportScreen";

// AdvisorScreen - "AI Зөвлөмж" tab. Хоёр sub-tab харуулна:
//   Чат   → AIChatScreen
//   Анализ → DataImportScreen (банкны хуулга оруулах + анализ)
// Энэ нь settings цэснээс "Өгөгдөл" хуудсыг AI цэс рүү шилжүүлсэн refactor.
type SubTab = "chat" | "analysis";

export default function AdvisorScreen(): React.JSX.Element {
  const { isDark, colors } = useTheme();
  const [tab, setTab] = useState<SubTab>("chat");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header + tab toggle */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 12,
          backgroundColor: colors.bg,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <Ionicons name="sparkles" size={22} color="#00C853" />
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", marginLeft: 8 }}>
            AI Зөвлөмж
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 4,
          }}
        >
          {(
            [
              { key: "chat", label: "Чат", icon: "chatbubbles-outline" as const },
              { key: "analysis", label: "Анализ", icon: "analytics-outline" as const },
            ] as { key: SubTab; label: string; icon: keyof typeof Ionicons.glyphMap }[]
          ).map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: active ? "#00C853" : "transparent",
                }}
              >
                <Ionicons
                  name={t.icon}
                  size={16}
                  color={active ? "#0D0D0D" : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: active ? "#0D0D0D" : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content. Хоёуланг нь mount-той үлдээнэ — tab солих болгонд state хадгалагдана. */}
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: tab === "chat" ? "flex" : "none" }}>
          <AIChatScreen embedded />
        </View>
        <View style={{ flex: 1, display: tab === "analysis" ? "flex" : "none" }}>
          <DataImportScreen embedded />
        </View>
      </View>
    </View>
  );
}
