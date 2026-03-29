import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

const API_BASE = "http://192.168.1.130:8080";

interface GridItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = (): void => {
    Alert.alert("Гарах", "Та гарахдаа итгэлтэй байна уу?", [
      { text: "Цуцлах" },
      { text: "Гарах", style: "destructive", onPress: logout },
    ]);
  };

  const comingSoon = () => Alert.alert("Тун удахгүй", "Энэ функц хөгжүүлэлтийн шатанд байна");

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
        onPress: comingSoon,
      },
    ],
    [
      {
        icon: "ellipsis-vertical",
        label: "Ерөнхий",
        sublabel: "Валют, өгөгдөл цэвэрлэх болон бусад",
        onPress: () => navigation.navigate("Profile"),
      },
      {
        icon: "settings-outline",
        label: "Тохиргоо",
        sublabel: "Дансны тохиргоо, мэдэгдэл",
        onPress: () => navigation.navigate("Accounts"),
      },
    ],
    [
      {
        icon: "analytics-outline",
        label: "Өгөгдөл",
        sublabel: "Өгөгдөл удирдах, экспорт, импорт",
        onPress: comingSoon,
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
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 56 }}>
        {/* Header with user info */}
        <TouchableOpacity
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            marginBottom: 28,
          }}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {user?.avatar && user.avatar.length > 1 ? (
              <Image
                source={{
                  uri: user.avatar.startsWith("http") ? user.avatar : API_BASE + user.avatar,
                  cache: "reload",
                }}
                style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
              />
            ) : (
              <View style={{
                width: 44, height: 44, borderRadius: 22, backgroundColor: "#7C4DFF",
                alignItems: "center", justifyContent: "center", marginRight: 12,
              }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
              {user?.name || "Хэрэглэгч"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Ionicons name="moon-outline" size={22} color={colors.text} />
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </View>
        </TouchableOpacity>

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
                        uri: user.avatar.startsWith("http") ? user.avatar : API_BASE + user.avatar,
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

        {/* Logout */}
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(255,68,68,0.1)", borderRadius: 16,
            padding: 16, alignItems: "center", marginTop: 8, marginBottom: 32,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: "#FF4444", fontWeight: "700", fontSize: 15 }}>Гарах</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
