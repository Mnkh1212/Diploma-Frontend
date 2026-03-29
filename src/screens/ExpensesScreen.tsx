import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getExpensesSummary } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpensesSummary, CategoryExpense } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

type ExpensesScreenProps = NativeStackScreenProps<RootStackParamList, "Expenses">;

interface DonutSegmentProps {
  categories: CategoryExpense[] | undefined;
  total: number | undefined;
}

const DonutSegment = ({ categories, total }: DonutSegmentProps) => {
  const { colors } = useTheme();
  const { formatAmount } = useCurrency();
  // Simple visual representation of expense breakdown
  return (
    <View className="items-center justify-center my-6">
      <View className="w-44 h-44 rounded-full items-center justify-center" style={{ backgroundColor: colors.surface, borderWidth: 8, borderColor: colors.card }}>
        <View className="items-center">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {formatAmount(total)}
          </Text>
        </View>
      </View>
      {/* Color indicators around the donut */}
      <View className="flex-row flex-wrap justify-center mt-4 gap-3">
        {(categories || []).slice(0, 6).map((cat, index) => (
          <View key={index} className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: cat.color }}
            />
            <Text className="text-xs" style={{ color: colors.textSecondary }}>{cat.category_name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function ExpensesScreen({ navigation }: ExpensesScreenProps) {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [period, setPeriod] = useState<string>("monthly");

  const periods: { label: string; value: string }[] = [
    { label: "Өдөр", value: "daily" },
    { label: "7 хоног", value: "weekly" },
    { label: "Сар", value: "monthly" },
    { label: "Жил", value: "yearly" },
  ];

  const fetchData = async (): Promise<void> => {
    try {
      const { data } = await getExpensesSummary(period);
      setSummary(data);
    } catch (error) {
      console.log("Expenses error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [period])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="font-bold text-xl" style={{ color: colors.text }}>Зарлага</Text>
        </View>

        {/* Search */}
        <View className="rounded-xl flex-row items-center px-4 py-3 mb-4" style={{ backgroundColor: colors.card }}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text className="ml-2 text-sm" style={{ color: colors.textMuted }}>AI хайлт</Text>
        </View>

        {/* Period Tabs */}
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: colors.card }}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.value}
              className={`flex-1 py-2 rounded-lg items-center ${
                period === p.value ? "bg-accent-green" : ""
              }`}
              onPress={() => setPeriod(p.value)}
            >
              <Text
                className={`font-medium text-xs ${
                  period === p.value ? "text-dark-bg" : ""
                }`}
                style={period !== p.value ? { color: colors.textSecondary } : undefined}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Donut Chart */}
        <DonutSegment
          categories={summary?.categories}
          total={summary?.total}
        />

        {/* Category List */}
        {(summary?.categories || []).map((cat, index) => (
          <View
            key={index}
            className="flex-row items-center rounded-xl p-4 mb-2"
            style={{ backgroundColor: colors.card }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: (cat.color || "#666") + "20" }}
            >
              <Ionicons
                name={(cat.icon || "cash-outline") as any}
                size={18}
                color={cat.color || "#666"}
              />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sm" style={{ color: colors.text }}>
                {cat.category_name}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-sm" style={{ color: colors.text }}>
                {formatAmount(cat.amount)}
              </Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {cat.percentage?.toFixed(1)}% ↑
              </Text>
            </View>
          </View>
        ))}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
