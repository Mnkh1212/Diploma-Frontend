import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { getDashboard } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, DashboardResponse } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

interface Notification {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  message: string;
  time: string;
}

export default function NotificationsScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    getDashboard().then(({ data }) => setDashboard(data)).catch(() => {});
  }, []);

  const generateNotifications = (): Notification[] => {
    const notifs: Notification[] = [];
    const income = dashboard?.total_income || 0;
    const expenses = dashboard?.total_expenses || 0;
    const balance = dashboard?.balance || 0;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    if (savingsRate > 30) {
      notifs.push({
        id: "1", icon: "trophy-outline", iconColor: "#FFD600", iconBg: "rgba(255,214,0,0.12)",
        title: "Баяр хүргэе!",
        message: `Та энэ сард орлогынхоо ${savingsRate}%-ийг хэмнэлээ. Маш сайн!`,
        time: "Өнөөдөр",
      });
    }

    if (expenses > income * 0.8) {
      notifs.push({
        id: "2", icon: "warning-outline", iconColor: "#FF6B35", iconBg: "rgba(255,107,53,0.12)",
        title: "Зарлага өндөр байна",
        message: `Таны зарлага ${formatAmount(expenses)} — орлогын 80%-иас давсан байна.`,
        time: "Өнөөдөр",
      });
    }

    if (balance > 0) {
      notifs.push({
        id: "3", icon: "wallet-outline", iconColor: "#00C853", iconBg: "rgba(0,200,83,0.12)",
        title: "Үлдэгдэл мэдэгдэл",
        message: `Таны нийт үлдэгдэл ${formatAmount(balance)} байна.`,
        time: "Өнөөдөр",
      });
    }

    const recentTx = dashboard?.recent_transactions;
    if (recentTx && recentTx.length > 0) {
      const last = recentTx[0];
      notifs.push({
        id: "4", icon: last.type === "income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline",
        iconColor: last.type === "income" ? "#00C853" : "#FF4444",
        iconBg: last.type === "income" ? "rgba(0,200,83,0.12)" : "rgba(255,68,68,0.12)",
        title: `Шинэ ${last.type === "income" ? "орлого" : "зарлага"}`,
        message: `${last.category?.name || ""} — ${formatAmount(last.amount)}`,
        time: new Date(last.date).toLocaleDateString("mn-MN", { month: "short", day: "numeric" }),
      });
    }

    notifs.push({
      id: "5", icon: "bulb-outline", iconColor: "#7C4DFF", iconBg: "rgba(124,77,255,0.12)",
      title: "Санхүүгийн зөвлөмж",
      message: "Сар бүрийн орлогынхоо 20%-ийг хэмнэлтэд хуримтлуулж байгаарай.",
      time: "Зөвлөмж",
    });

    return notifs;
  };

  const notifications = generateNotifications();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 56 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>Мэдэгдэл</Text>
        </View>

        {notifications.map((n) => (
          <View key={n.id} style={{
            flexDirection: "row", backgroundColor: colors.card, borderRadius: 14,
            padding: 14, marginBottom: 10, alignItems: "center",
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: n.iconBg, alignItems: "center", justifyContent: "center", marginRight: 12,
            }}>
              <Ionicons name={n.icon} size={20} color={n.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{n.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{n.time}</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>{n.message}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
