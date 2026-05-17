import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useTheme, ACCENTS, WidgetKey } from "../context/ThemeContext";

interface WidgetRow {
  key: WidgetKey;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const WIDGET_ROWS: WidgetRow[] = [
  {
    key: "savings",
    icon: "pie-chart-outline",
    title: "Хэмнэлтийн виджет",
    subtitle: "Сарын хэмнэлтийн хувь, дугуй график",
  },
  {
    key: "accounts",
    icon: "wallet-outline",
    title: "Дансны сонголт",
    subtitle: "Хэвтээ scroll дансны хайрцгууд",
  },
  {
    key: "quickActions",
    icon: "flash-outline",
    title: "Хурдан үйлдлүүд",
    subtitle: "Нэмэх, Данс, Төлбөр, Зарлага, Гүйлгээ",
  },
];

export default function AppearanceScreen() {
  const { isDark, colors, theme, toggleTheme, accent, accentKey, setAccent, widgets, setWidget } =
    useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>Харагдац</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 36 }}>
          Загвар, өнгө, нүүр виджетийн тохиргоо
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Theme */}
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            letterSpacing: 1,
            marginTop: 12,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          ЗАГВАР
        </Text>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          {(["dark", "light"] as const).map((mode) => {
            const active = theme === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => {
                  if (!active) toggleTheme();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 11,
                  borderRadius: 10,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  backgroundColor: active ? accent : "transparent",
                }}
              >
                <Ionicons
                  name={mode === "dark" ? "moon" : "sunny"}
                  size={16}
                  color={active ? "#0D0D0D" : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 13,
                    color: active ? "#0D0D0D" : colors.textSecondary,
                  }}
                >
                  {mode === "dark" ? "Харанхуй" : "Гэрэлтэй"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Accent */}
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          ҮНДСЭН ӨНГӨ
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {ACCENTS.map((a) => {
              const active = accentKey === a.key;
              return (
                <TouchableOpacity
                  key={a.key}
                  onPress={() => setAccent(a.key)}
                  style={{
                    alignItems: "center",
                    width: 56,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: a.color,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: active ? 3 : 0,
                      borderColor: colors.text,
                    }}
                  >
                    {active && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
                  </View>
                  <Text
                    style={{
                      color: active ? colors.text : colors.textSecondary,
                      fontSize: 11,
                      marginTop: 6,
                      fontWeight: active ? "600" : "400",
                    }}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 12 }}>
            Сонгосон өнгө нь нүүр дэлгэц, идэвхтэй товчлуурын онцлох өнгө болно.
          </Text>
        </View>

        {/* Widgets */}
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          НҮҮР ВИДЖЕТҮҮД
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {WIDGET_ROWS.map((row, i) => {
            const enabled = widgets[row.key];
            return (
              <View
                key={row.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  borderBottomWidth: i < WIDGET_ROWS.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: enabled ? accent + "20" : colors.surface,
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={row.icon} size={18} color={enabled ? accent : colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                    {row.title}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {row.subtitle}
                  </Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={(v) => setWidget(row.key, v)}
                  trackColor={{ false: colors.border, true: accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            );
          })}
        </View>

        {/* Preview */}
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          ҮЛГЭР
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: accent,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="add" size={24} color="#0D0D0D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                Идэвхтэй товчлуур
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Энэ өнгөтэй харагдана
              </Text>
            </View>
            <Text style={{ color: accent, fontWeight: "700", fontSize: 14 }}>
              {ACCENTS.find((x) => x.key === accentKey)?.label}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
