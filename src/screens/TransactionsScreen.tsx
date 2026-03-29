import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getTransactions, deleteTransaction } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, Transaction, PaginatedResponse } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, "Transactions">;

export default function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Бүгд");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const tabs: string[] = ["Бүгд", "Зарлага", "Орлого"];

  const fetchTransactions = async (reset: boolean = false): Promise<void> => {
    const currentPage = reset ? 1 : page;
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 20 };
      if (activeTab === "Зарлага") params.type = "expense";
      if (activeTab === "Орлого") params.type = "income";
      if (search) params.search = search;

      const { data } = await getTransactions(params);
      if (reset) {
        setTransactions(data.data || []);
      } else {
        setTransactions((prev) => [...prev, ...(data.data || [])]);
      }
      setTotal(data.total);
      if (reset) setPage(1);
    } catch (error) {
      console.log("Transactions error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions(true);
    }, [activeTab, search])
  );

  const handleDelete = (id: number): void => {
    Alert.alert("Устгах", "Итгэлтэй байна уу?", [
      { text: "Цуцлах" },
      {
        text: "Устгах",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(id);
            fetchTransactions(true);
          } catch (error) {
            Alert.alert("Алдаа", "Устгаж чадсангүй");
          }
        },
      },
    ]);
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

  const grouped = groupByDate(transactions);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="font-bold text-xl" style={{ color: colors.text }}>Гүйлгээнүүд</Text>
        </View>

        {/* Search */}
        <View className="rounded-xl flex-row items-center px-4 py-3 mb-4" style={{ backgroundColor: colors.card }}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            className="flex-1 ml-2 text-sm"
            style={{ color: colors.text }}
            placeholder="Гүйлгээ хайх"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: colors.card }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === tab ? "bg-accent-green" : ""
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`font-medium text-sm ${
                  activeTab === tab ? "text-dark-bg" : ""
                }`}
                style={activeTab !== tab ? { color: colors.textSecondary } : undefined}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView className="flex-1 px-5">
        {Object.entries(grouped).map(([date, txList]) => (
          <View key={date} className="mb-4">
            <Text className="text-sm mb-2" style={{ color: colors.textMuted }}>{date}</Text>
            {txList.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                className="flex-row items-center rounded-xl p-4 mb-2"
                style={{ backgroundColor: colors.card }}
                onLongPress={() => handleDelete(tx.id)}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: (tx.category?.color || "#666") + "20",
                  }}
                >
                  <Ionicons
                    name={(tx.category?.icon || "cash-outline") as any}
                    size={18}
                    color={tx.category?.color || "#666"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-sm" style={{ color: colors.text }}>
                    {tx.category?.name || "Тодорхойгүй"}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {tx.description || tx.account?.name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`font-bold text-sm ${
                      tx.type === "income"
                        ? "text-accent-green"
                        : "text-accent-red"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date(tx.date).toLocaleTimeString("mn-MN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
