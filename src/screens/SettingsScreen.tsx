import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { buildAssetUrl } from "../config/network";

interface GridItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = (): void => {
    Alert.alert("Гарах", "Та гарахдаа итгэлтэй байна уу?", [
      { text: "Цуцлах" },
      { text: "Гарах", style: "destructive", onPress: logout },
    ]);
  };

  const gridItems: GridItem[][] = [
    [
      {
        icon: "person-outline",
        label: "Профайл",
        sublabel: "Нэвтрэх, баталгаажуулалт",
        onPress: () => navigation.navigate("Profile"),
      },
      {
        icon: "grid-outline",
        label: "Харагдац",
        sublabel: "Виджет, Загвар",
        onPress: () => navigation.navigate("Appearance"),
      },
    ],
    [
      {
        icon: "settings-outline",
        label: "Тохиргоо",
        sublabel: "Дансны тохиргоо, мэдэгдэл",
        onPress: () => navigation.navigate("Accounts"),
      },
      {
        icon: "lock-closed-outline",
        label: "Нууцлал",
        sublabel: "Нууц үг удирдах, нууцлалын тохиргоо",
        onPress: () => navigation.navigate("Privacy"),
      },
    ],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 24,
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => navigation.navigate("Profile")}
          >
            {user?.avatar && user.avatar.length > 1 ? (
              <Image
                source={{
                  uri: buildAssetUrl(user.avatar),
                  cache: "reload",
                }}
                style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
              />
            ) : (
              <View className="w-11 h-11 rounded-full bg-accent-purple items-center justify-center mr-3">
                <Text className="font-bold text-lg" style={{ color: "#fff" }}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <Text className="font-semibold text-base" style={{ color: colors.text }}>
              {user?.name || "Хэрэглэгч"}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity
              onPress={toggleTheme}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid Items */}
        {gridItems.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            {row.map((item, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={{
                  flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16,
                  minHeight: 140, justifyContent: "space-between",
                }}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: isDark ? "#2A2A3E" : "#F0F0F0",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {item.icon === "person-outline" && user?.avatar && user.avatar.length > 1 ? (
                    <Image
                      source={{
                        uri: buildAssetUrl(user.avatar),
                        cache: "reload",
                      }}
                      style={{ width: 40, height: 40, borderRadius: 10 }}
                    />
                  ) : (
                    <Ionicons name={item.icon} size={20} color={colors.text} />
                  )}
                </View>
                <View>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 4 }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 16 }}>
                    {item.sublabel}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Spacer — Гарах товчийг доош байрлуулна (утасны хэмжээнээс үл хамаарч) */}
        <View style={{ flex: 1, minHeight: 24 }} />

        {/* Logout */}
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(255,68,68,0.1)", borderRadius: 16,
            padding: 16, alignItems: "center",
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: "#FF4444", fontWeight: "700", fontSize: 15 }}>Гарах</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
