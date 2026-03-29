import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { getDashboard, getTransactions } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList, DashboardResponse, Transaction } from "../types";

const API_BASE = "http://192.168.1.130:8080";

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const accountIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  bank: "business",
  cash: "cash-outline",
  credit_card: "card-outline",
  investment: "business",
};

function SavingsRing({ percent, amount }: { percent: number; amount: number }) {
  const { colors } = useTheme();
  const { formatAmount } = useCurrency();
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#00C853"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-accent-green font-bold text-base">
          {formatAmount(Math.abs(amount))}
        </Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>Хэмнэлт</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();
  const { formatAmount } = useCurrency();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [txTab, setTxTab] = useState<string>("Бүгд");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboard = async (): Promise<void> => {
    try {
      const { data } = await getDashboard();
      setDashboard(data);
      setRecentTx(data.recent_transactions || []);
    } catch (error) {
      console.log("Dashboard error:", error);
    }
  };

  const fetchFilteredTx = async (tab: string): Promise<void> => {
    try {
      const params: Record<string, string | number> = { page: 1, limit: 10 };
      if (tab === "Зарлага") params.type = "expense";
      if (tab === "Орлого") params.type = "income";
      const { data } = await getTransactions(params);
      setRecentTx(data.data || []);
    } catch {
      // fallback
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchDashboard();
    setTxTab("Бүгд");
    setRefreshing(false);
  };

  const handleTxTab = (tab: string): void => {
    setTxTab(tab);
    if (tab === "Бүгд") {
      setRecentTx(dashboard?.recent_transactions || []);
    } else {
      fetchFilteredTx(tab);
    }
  };


  const groupByDate = (txList: Transaction[]): Record<string, Transaction[]> => {
    const groups: Record<string, Transaction[]> = {};
    (txList || []).forEach((tx) => {
      const d = new Date(tx.date);
      const date = `${d.getFullYear()} оны ${d.getMonth() + 1} сарын ${d.getDate()}`;
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  };

  const txTabs = ["Бүгд", "Зарлага", "Орлого"];
  const grouped = groupByDate(recentTx);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        className="flex-1 px-5 pt-14"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00C853" />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity className="flex-row items-center" onPress={() => navigation.navigate("Profile")}>
            {user?.avatar && user.avatar.length > 1 ? (
              <Image
                source={{
                  uri: user.avatar.startsWith("http") ? user.avatar : API_BASE + user.avatar,
                  cache: "reload",
                }}
                style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
              />
            ) : (
              <View className="w-11 h-11 rounded-full bg-accent-purple items-center justify-center mr-3">
                <Text className="font-bold text-lg" style={{ color: colors.text }}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <Text className="font-semibold text-base" style={{ color: colors.text }}>
              {user?.name || "User"}
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-4" onPress={toggleTheme}>
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Үлдэгдэл Card */}
        <View style={{
          borderRadius: 20, overflow: "hidden", marginBottom: 20,
        }}>
          <Svg style={{ position: "absolute", width: "100%", height: "100%" }}>
            <Defs>
              <LinearGradient id="balanceGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#0F2318" />
                <Stop offset="0.5" stopColor="#121F1A" />
                <Stop offset="1" stopColor="#1A1A2E" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#balanceGrad)" />
          </Svg>
          <View style={{ padding: 18 }}>
            <Text style={{ color: "#777", fontSize: 12, fontWeight: "500", marginBottom: 4 }}>
              Нийт үлдэгдэл
            </Text>
            <Text style={{ color: "#00C853", fontSize: 28, fontWeight: "800", marginBottom: 12 }}>
              {formatAmount(dashboard?.balance)}
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{
                flex: 1, flexDirection: "row", alignItems: "center",
                backgroundColor: "rgba(0,200,83,0.08)", borderRadius: 10, padding: 10,
              }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: "rgba(0,200,83,0.15)", alignItems: "center", justifyContent: "center", marginRight: 8,
                }}>
                  <Ionicons name="arrow-down" size={14} color="#00C853" />
                </View>
                <View>
                  <Text style={{ color: "#777", fontSize: 10 }}>Орлого</Text>
                  <Text style={{ color: "#00C853", fontSize: 13, fontWeight: "700" }}>
                    {formatAmount(dashboard?.total_income)}
                  </Text>
                </View>
              </View>
              <View style={{
                flex: 1, flexDirection: "row", alignItems: "center",
                backgroundColor: "rgba(255,68,68,0.08)", borderRadius: 10, padding: 10,
              }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: "rgba(255,68,68,0.15)", alignItems: "center", justifyContent: "center", marginRight: 8,
                }}>
                  <Ionicons name="arrow-up" size={14} color="#FF4444" />
                </View>
                <View>
                  <Text style={{ color: "#777", fontSize: 10 }}>Зарлага</Text>
                  <Text style={{ color: "#FF4444", fontSize: 13, fontWeight: "700" }}>
                    {formatAmount(dashboard?.total_expenses)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Savings Card */}
        {(() => {
          const income = dashboard?.total_income || 0;
          const expenses = dashboard?.total_expenses || 0;
          const monthlySaved = income - expenses;
          const savingsRate = income > 0 ? Math.round((monthlySaved / income) * 100) : 0;
          const isPositive = monthlySaved >= 0;
          return (
            <View className="flex-row items-center rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
              <View className="flex-1 mr-3">
                <Text className="font-bold text-lg mb-1" style={{ color: colors.text }}>
                  {isPositive ? "Баяр хүргэе!" : "Анхааруулга!"}
                </Text>
                <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                  {isPositive
                    ? `Таны зарлага өмнөх сараас ${Math.abs(savingsRate)}%-иар буурсан.`
                    : `Таны зарлага өмнөх сараас ${Math.abs(savingsRate)}%-иар нэмэгдсэн.`}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Expenses")}>
                  <Text className="text-accent-green font-medium text-sm mt-3">Дэлгэрэнгүй</Text>
                </TouchableOpacity>
              </View>
              <SavingsRing
                percent={Math.min(Math.abs(savingsRate), 100)}
                amount={monthlySaved}
              />
            </View>
          );
        })()}

        {/* Account Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {(dashboard?.accounts || []).map((account, index) => (
            <TouchableOpacity
              key={account.id || index}
              className="rounded-2xl p-4 mr-3"
              style={{ width: 160, backgroundColor: colors.card }}
              onPress={() => navigation.navigate("Accounts")}
            >
              <View className="w-10 h-10 rounded-lg items-center justify-center mb-3" style={{ backgroundColor: colors.surface }}>
                <Ionicons
                  name={(account.icon as keyof typeof Ionicons.glyphMap) || accountIconMap[account.type] || "wallet-outline"}
                  size={20}
                  color={colors.text}
                />
              </View>
              <Text className="font-bold text-base" style={{ color: colors.text }}>
                {formatAmount(account.balance)}
              </Text>
              <Text className="text-xs mt-1 uppercase" style={{ color: colors.textSecondary }}>
                {account.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View className="flex-row items-center justify-between mb-6">
          {([
            { icon: "swap-horizontal-outline" as keyof typeof Ionicons.glyphMap, onPress: () => navigation.navigate("AddTransaction") },
            { icon: "wallet-outline" as keyof typeof Ionicons.glyphMap, onPress: () => navigation.navigate("Accounts") },
            { icon: "time-outline" as keyof typeof Ionicons.glyphMap, onPress: () => navigation.navigate("ScheduledPayments") },
            { icon: "cash-outline" as keyof typeof Ionicons.glyphMap, onPress: () => navigation.navigate("Expenses") },
          ] as QuickAction[]).map((action, index) => (
            <TouchableOpacity
              key={index}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.card }}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon} size={22} color={colors.text} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            className="w-12 h-12 rounded-full border border-accent-yellow items-center justify-center"
            onPress={() => navigation.navigate("AddTransaction")}
          >
            <Ionicons name="add" size={24} color="#FFD600" />
          </TouchableOpacity>
        </View>

        {/* Transaction History Header */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-lg" style={{ color: colors.text }}>Гүйлгээний түүх</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Бүгдийг харах</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Tabs */}
        <View className="flex-row rounded-xl p-1 mb-4" style={{ backgroundColor: colors.card }}>
          {txTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg items-center ${txTab === tab ? "bg-accent-green" : ""}`}
              onPress={() => handleTxTab(tab)}
            >
              <Text
                className="font-medium text-xs"
                style={{ color: txTab === tab ? "#0D0D0D" : colors.textSecondary }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions grouped by date */}
        {Object.entries(grouped).map(([date, txList]) => (
          <View key={date} className="mb-3">
            <Text className="text-xs mb-2" style={{ color: colors.textMuted }}>{date}</Text>
            {txList.map((tx, index) => (
              <View
                key={tx.id || index}
                className="flex-row items-center rounded-xl p-4 mb-2"
                style={{ backgroundColor: colors.card }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: (tx.category?.color || "#666") + "20",
                  }}
                >
                  <Ionicons
                    name={(tx.category?.icon as keyof typeof Ionicons.glyphMap) || "cash-outline"}
                    size={18}
                    color={tx.category?.color || "#666"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-sm" style={{ color: colors.text }}>
                    {tx.category?.name || tx.description}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {tx.description || tx.account?.name}
                  </Text>
                </View>
                <Text
                  className={`font-bold text-sm ${
                    tx.type === "income" ? "text-accent-green" : "text-accent-red"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatAmount(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {recentTx.length === 0 && (
          <View className="items-center py-8">
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>Гүйлгээ байхгүй байна</Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
