import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAccount } from "../context/AccountContext";
import { getDashboard, getTransactions } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList, DashboardResponse, Transaction } from "../types";
import { buildAssetUrl } from "../config/network"; // develop-оос орж ирсэн API_BASE-ийг устгаж, buildAssetUrl-ийг үлдээв

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
  const { colors, accent } = useTheme();
  const { formatAmount } = useCurrency();
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  // Эерэг = хэмнэлт (accent), сөрөг = хэтрэлт (улаан)
  const isDeficit = amount < 0;
  const ringColor = isDeficit ? "#FF4444" : accent;
  const label = isDeficit ? "Хэтрэлт" : "Хэмнэлт";

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
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text style={{ color: ringColor, fontWeight: "700", fontSize: 15 }}>
          {formatAmount(Math.abs(amount))}
        </Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { isDark, colors, toggleTheme, accent, widgets } = useTheme();
  const { formatAmount } = useCurrency();
  const { accounts, selectedAccountId, selectedAccount, setSelectedAccountId, refreshAccounts } = useAccount();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [txTab, setTxTab] = useState<string>("Бүгд");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboard = async (accountId?: number | null): Promise<void> => {
    try {
      const { data } = await getDashboard(accountId ?? undefined);
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
      if (selectedAccountId) params.account_id = selectedAccountId;
      const { data } = await getTransactions(params);
      setRecentTx(data.data || []);
    } catch {
      // fallback
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshAccounts();
      if (selectedAccountId) {
        fetchDashboard(selectedAccountId);
      }
    }, [selectedAccountId, refreshAccounts])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refreshAccounts();
    if (selectedAccountId) {
      await fetchDashboard(selectedAccountId);
    }
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

  const handleSelectAccount = (accountId: number): void => {
    setSelectedAccountId(accountId);
    setTxTab("Бүгд");
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity className="flex-row items-center" onPress={() => navigation.navigate("Profile")}>
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
                <Text className="font-bold text-lg" style={{ color: colors.text }}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <Text className="font-semibold text-base" style={{ color: colors.text }}>
              {user?.name || "User"}
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

        {/* Үлдэгдэл Card */}
        <View style={{
          borderRadius: 20, overflow: "hidden", marginBottom: 20,
          borderWidth: 1, borderColor: colors.border,
        }}>
          <Svg style={{ position: "absolute", width: "100%", height: "100%" }}>
            <Defs>
              <LinearGradient id="balanceGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={isDark ? "#0F2318" : "#E8F5E9"} />
                <Stop offset="0.5" stopColor={isDark ? "#121F1A" : "#F1F8E9"} />
                <Stop offset="1" stopColor={isDark ? "#1A1A2E" : "#E0F2F1"} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#balanceGrad)" />
          </Svg>
          <View style={{ padding: 18 }}>
            <Text style={{ color: isDark ? "#999" : "#555", fontSize: 12, fontWeight: "500", marginBottom: 4 }}>
              {selectedAccount ? selectedAccount.name : "Үлдэгдэл"}
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
                  <Text style={{ color: isDark ? "#999" : "#555", fontSize: 10 }}>Орлого</Text>
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
                  <Text style={{ color: isDark ? "#999" : "#555", fontSize: 10 }}>Зарлага</Text>
                  <Text style={{ color: "#FF4444", fontSize: 13, fontWeight: "700" }}>
                    {formatAmount(dashboard?.total_expenses)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Savings Card — гүйлгээ ороогүй үед нуугдана, эхний орлого/зарлага бүртгэгдсэн үед л гарна */}
        {widgets.savings && (() => {
          const income = dashboard?.total_income || 0;
          const expenses = dashboard?.total_expenses || 0;
          if (income <= 0 && expenses <= 0) return null;
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
                  <Text style={{ color: accent, fontWeight: "500", fontSize: 13, marginTop: 12 }}>Дэлгэрэнгүй</Text>
                </TouchableOpacity>
              </View>
              <SavingsRing
                percent={Math.min(Math.abs(savingsRate), 100)}
                amount={monthlySaved}
              />
            </View>
          );
        })()}

        {/* Account Switcher — accounts.length-ээс хамаарч картын хэмжээ тохиргоо
            хийгдэнэ. 1-4 хүртэл бол дэлгэцэнд яг таарч хуваагдана; 5+ бол
            хэвтээ scroll-той жижигхэн card болж буурна. Үргэлж px-5 padding-той. */}
        {widgets.accounts && accounts.length > 0 && (() => {
          const n = accounts.length;
          const GAP = 10;
          const HORIZONTAL_PADDING = 40; // px-5 = 20 * 2
          const availableWidth = SCREEN_WIDTH - HORIZONTAL_PADDING;
          const fitsInRow = n <= 4;
          const cardWidth = fitsInRow
            ? (availableWidth - GAP * (n - 1)) / n
            : 130;
          // 3-4 account үед content бага зэрэг шахагдсан байх ёстой — padding
          // жижигрүүлж, icon-ийг бага зэрэг бууруулна
          const compact = n >= 3;
          const cardPadding = compact ? 12 : 16;
          const iconSize = compact ? 18 : 20;
          const iconBox = compact ? 34 : 40;
          const balanceFontSize = n >= 4 ? 14 : compact ? 15 : 16;

          const renderCard = (account: typeof accounts[number], index: number) => {
            const active = selectedAccountId === account.id;
            return (
              <TouchableOpacity
                key={account.id || index}
                onPress={() => handleSelectAccount(account.id)}
                onLongPress={() => navigation.navigate("Accounts")}
                style={{
                  width: cardWidth,
                  marginRight: index === n - 1 ? 0 : GAP,
                  padding: cardPadding,
                  borderRadius: 16,
                  backgroundColor: active ? accent : colors.card,
                  borderWidth: 1,
                  borderColor: active ? accent : "transparent",
                }}
              >
                <View
                  style={{
                    width: iconBox,
                    height: iconBox,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? "rgba(0,0,0,0.1)" : colors.surface,
                    marginBottom: compact ? 8 : 12,
                  }}
                >
                  <Ionicons
                    name={(account.icon as keyof typeof Ionicons.glyphMap) || accountIconMap[account.type] || "wallet-outline"}
                    size={iconSize}
                    color={active ? "#0D0D0D" : colors.text}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  style={{
                    color: active ? "#0D0D0D" : colors.text,
                    fontWeight: "700",
                    fontSize: balanceFontSize,
                  }}
                >
                  {formatAmount(account.balance)}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: active ? "#0D0D0D" : colors.textSecondary,
                    fontSize: 10,
                    marginTop: 4,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            );
          };

          if (fitsInRow) {
            return (
              <View style={{ flexDirection: "row", marginBottom: 24 }}>
                {accounts.map(renderCard)}
              </View>
            );
          }
          return (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              style={{ marginBottom: 24 }}
            >
              {accounts.map(renderCard)}
            </ScrollView>
          );
        })()}

        {/* Quick Actions — icon-colored, label-той */}
        {widgets.quickActions && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
          {[
            {
              icon: "add-circle" as keyof typeof Ionicons.glyphMap,
              label: "Нэмэх",
              color: accent,
              onPress: () => navigation.navigate("AddTransaction"),
            },
            {
              icon: "card" as keyof typeof Ionicons.glyphMap,
              label: "Данс",
              color: "#7C4DFF",
              onPress: () => navigation.navigate("Accounts"),
            },
            {
              icon: "calendar" as keyof typeof Ionicons.glyphMap,
              label: "Төлбөр",
              color: "#FF9F43",
              onPress: () => navigation.navigate("ScheduledPayments"),
            },
            {
              icon: "trending-down" as keyof typeof Ionicons.glyphMap,
              label: "Зарлага",
              color: "#FF6B35",
              onPress: () => navigation.navigate("Expenses"),
            },
            {
              icon: "wallet" as keyof typeof Ionicons.glyphMap,
              label: "Гүйлгээ",
              color: "#448AFF",
              onPress: () => navigation.navigate("Transactions"),
            },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{ alignItems: "center", flex: 1 }}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: action.color + "20",
                  borderWidth: 1,
                  borderColor: action.color + "33",
                  marginBottom: 6,
                }}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text
                style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "500" }}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        )}

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
