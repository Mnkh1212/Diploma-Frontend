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

export default function BudgetScreen() {
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

  const formatCurrency = (amount: number): string =>
    `${(amount || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮`;

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-5 pt-14">
        <Text className="text-white font-bold text-xl mb-6">Сарын төсөв</Text>

        {/* Budget Progress */}
        <View className="bg-dark-card rounded-2xl p-5 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400 text-sm">Зарцуулсан</Text>
            <Text className="text-gray-400 text-sm">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-3 bg-dark-surface rounded-full overflow-hidden mb-2">
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
        <View className="bg-dark-card rounded-2xl p-5 mb-6">
          <Text className="text-white font-bold text-base mb-4">Сарын төсөв</Text>
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
                <Text className="text-gray-500 text-xs">{month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last 6 periods */}
        <View className="bg-dark-card rounded-2xl p-5 mb-6">
          <Text className="text-white font-bold text-base mb-4">
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
              <Text className="text-gray-400 text-xs">Эрсдэл</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-orange mr-1" />
              <Text className="text-gray-400 text-xs">Дунд зэрэг</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-red mr-1" />
              <Text className="text-gray-400 text-xs">Хэтрүүлсэн</Text>
            </View>
          </View>
        </View>

        {/* Category Budgets */}
        <Text className="text-white font-bold text-base mb-4">Ангиллын төсөв</Text>
        {(budgetData?.budgets || []).map((budget, index) => {
          const budgetProgress: number =
            budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
          return (
            <View key={index} className="bg-dark-card rounded-xl p-4 mb-2">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-medium text-sm">
                  {budget.category?.name || "Ерөнхий"}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </Text>
              </View>
              <View className="h-2 bg-dark-surface rounded-full overflow-hidden">
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
