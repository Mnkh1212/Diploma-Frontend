import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getBudgets } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { BudgetListResponse } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

export default function BudgetScreen() {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [budgetData, setBudgetData] = useState<BudgetListResponse | null>(null);

  const fetchBudgets = async (): Promise<void> => {
    try {
      const { data } = await getBudgets();
      setBudgetData(data);
    } catch (error) {
      console.log("Budget error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBudgets();
    }, [])
  );

  const totalBudget: number = budgetData?.total_budget || 0;
  const totalSpent: number = budgetData?.total_spent || 0;
  const progress: number = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView className="flex-1 px-5 pt-14">
        <Text className="font-bold text-xl mb-6" style={{ color: colors.text }}>Сарын төсөв</Text>

        {/* Budget Progress */}
        <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Зарцуулсан</Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {formatAmount(totalSpent)} / {formatAmount(totalBudget)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: colors.surface }}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor:
                  progress > 90
                    ? "#FF4444"
                    : progress > 70
                    ? "#FF6B35"
                    : "#00C853",
              }}
            />
          </View>
          <Text
            className={`text-xs ${
              progress > 90 ? "text-accent-red" : "text-accent-green"
            }`}
          >
            {progress.toFixed(0)}% ашигласан
          </Text>
        </View>

        {/* Monthly Budget Chart Placeholder */}
        <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
          <Text className="font-bold text-base mb-4" style={{ color: colors.text }}>Сарын төсөв</Text>
          {/* Simple bar representation */}
          <View className="flex-row items-end justify-between h-40">
            {["10-р", "11-р", "12-р", "1-р", "2-р", "3-р"].map((month, i) => (
              <View key={i} className="items-center flex-1">
                <View className="w-6 rounded-t-md bg-accent-green/30 mb-1"
                  style={{ height: 30 + Math.random() * 80 }}
                >
                  <View
                    className="w-full rounded-t-md bg-accent-green absolute bottom-0"
                    style={{ height: 20 + Math.random() * 50 }}
                  />
                </View>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last 6 periods */}
        <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
          <Text className="font-bold text-base mb-4" style={{ color: colors.text }}>
            Сүүлийн 6 үе
          </Text>
          <View className="flex-row items-end justify-between h-32">
            {[60, 80, 45, 90, 70, 55].map((h, i) => (
              <View key={i} className="items-center flex-1">
                <View
                  className="w-5 rounded-t-md"
                  style={{
                    height: h,
                    backgroundColor: h > 80 ? "#FF4444" : h > 60 ? "#FF6B35" : "#00C853",
                  }}
                />
              </View>
            ))}
          </View>
          <View className="flex-row mt-3 gap-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-green mr-1" />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Эрсдэл</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-orange mr-1" />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Дунд зэрэг</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-red mr-1" />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Хэтрүүлсэн</Text>
            </View>
          </View>
        </View>

        {/* Category Budgets */}
        <Text className="font-bold text-base mb-4" style={{ color: colors.text }}>Ангиллын төсөв</Text>
        {(budgetData?.budgets || []).map((budget, index) => {
          const budgetProgress: number =
            budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
          return (
            <View key={index} className="rounded-xl p-4 mb-2" style={{ backgroundColor: colors.card }}>
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium text-sm" style={{ color: colors.text }}>
                  {budget.category?.name || "Ерөнхий"}
                </Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  {formatAmount(budget.spent)} / {formatAmount(budget.amount)}
                </Text>
              </View>
              <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surface }}>
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(budgetProgress, 100)}%`,
                    backgroundColor:
                      budgetProgress > 90
                        ? "#FF4444"
                        : budgetProgress > 70
                        ? "#FF6B35"
                        : "#00C853",
                  }}
                />
              </View>
            </View>
          );
        })}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
