import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { getDashboard, getTransactions } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList, DashboardResponse, Transaction } from "../types";

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
          stroke="#2A2A3E"
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
          {Math.abs(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮
        </Text>
        <Text className="text-gray-400 text-xs">Хэмнэлт</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
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

  const formatCurrency = (amount: number | undefined): string => {
    return `${(amount || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮`;
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
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1 px-5 pt-14"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00C853" />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-full bg-accent-purple items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">
                {user?.name?.charAt(0) || "U"}
              </Text>
            </View>
            <Text className="text-white font-semibold text-base">
              {user?.name || "User"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-4" onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="moon-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Үлдэгдэл */}
        <Text className="text-white font-bold text-xl mb-1">Үлдэгдэл</Text>
        <Text className="text-accent-green text-4xl font-bold mb-5">
          {formatCurrency(dashboard?.balance)}
        </Text>

        {/* Savings Card */}
        {(() => {
          const income = dashboard?.total_income || 0;
          const expenses = dashboard?.total_expenses || 0;
          const monthlySaved = income - expenses;
          const savingsRate = income > 0 ? Math.round((monthlySaved / income) * 100) : 0;
          const isPositive = monthlySaved >= 0;
          return (
            <View className="flex-row items-center bg-dark-card rounded-2xl p-5 mb-6">
              <View className="flex-1 mr-3">
                <Text className="text-white font-bold text-lg mb-1">
                  {isPositive ? "Баяр хүргэе!" : "Анхааруулга!"}
                </Text>
                <Text className="text-gray-400 text-sm leading-5">
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
              className="bg-dark-card rounded-2xl p-4 mr-3"
              style={{ width: 160 }}
              onPress={() => navigation.navigate("Accounts")}
            >
              <View className="w-10 h-10 rounded-lg bg-dark-surface items-center justify-center mb-3">
                <Ionicons
                  name={(account.icon as keyof typeof Ionicons.glyphMap) || accountIconMap[account.type] || "wallet-outline"}
                  size={20}
                  color="#fff"
                />
              </View>
              <Text className="text-white font-bold text-base">
                {formatCurrency(account.balance)}
              </Text>
              <Text className="text-gray-500 text-xs mt-1 uppercase">
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
              className="w-12 h-12 rounded-full bg-dark-card items-center justify-center"
              onPress={action.onPress}
            >
              <Ionicons name={action.icon} size={22} color="#fff" />
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
          <Text className="text-white font-bold text-lg">Гүйлгээний түүх</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text className="text-gray-400 text-sm">Бүгдийг харах</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Tabs */}
        <View className="flex-row bg-dark-card rounded-xl p-1 mb-4">
          {txTabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg items-center ${txTab === tab ? "bg-accent-green" : ""}`}
              onPress={() => handleTxTab(tab)}
            >
              <Text className={`font-medium text-xs ${txTab === tab ? "text-dark-bg" : "text-gray-400"}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions grouped by date */}
        {Object.entries(grouped).map(([date, txList]) => (
          <View key={date} className="mb-3">
            <Text className="text-gray-500 text-xs mb-2">{date}</Text>
            {txList.map((tx, index) => (
              <View
                key={tx.id || index}
                className="flex-row items-center bg-dark-card rounded-xl p-4 mb-2"
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
                  <Text className="text-white font-medium text-sm">
                    {tx.category?.name || tx.description}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {tx.description || tx.account?.name}
                  </Text>
                </View>
                <Text
                  className={`font-bold text-sm ${
                    tx.type === "income" ? "text-accent-green" : "text-accent-red"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {recentTx.length === 0 && (
          <View className="items-center py-8">
            <Ionicons name="receipt-outline" size={40} color="#333" />
            <Text className="text-gray-600 text-sm mt-2">Гүйлгээ байхгүй байна</Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
