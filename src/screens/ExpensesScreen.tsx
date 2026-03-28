import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getExpensesSummary } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpensesSummary, CategoryExpense } from "../types";

type ExpensesScreenProps = NativeStackScreenProps<RootStackParamList, "Expenses">;

interface DonutSegmentProps {
  categories: CategoryExpense[] | undefined;
  total: number | undefined;
}

const DonutSegment = ({ categories, total }: DonutSegmentProps) => {
  // Simple visual representation of expense breakdown
  return (
    <View className="items-center justify-center my-6">
      <View className="w-44 h-44 rounded-full bg-dark-surface items-center justify-center border-8 border-dark-card">
        <View className="items-center">
          <Text className="text-white text-2xl font-bold">
            {(total || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮
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
            <Text className="text-gray-400 text-xs">{cat.category_name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function ExpensesScreen({ navigation }: ExpensesScreenProps) {
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

  const formatCurrency = (amount: number): string =>
    `${(amount || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮`;

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />

      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl">Зарлага</Text>
        </View>

        {/* Search */}
        <View className="bg-dark-card rounded-xl flex-row items-center px-4 py-3 mb-4">
          <Ionicons name="search" size={18} color="#666" />
          <Text className="text-gray-500 ml-2 text-sm">AI хайлт</Text>
        </View>

        {/* Period Tabs */}
        <View className="flex-row bg-dark-card rounded-xl p-1">
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
                  period === p.value ? "text-dark-bg" : "text-gray-400"
                }`}
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
            className="flex-row items-center bg-dark-card rounded-xl p-4 mb-2"
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
              <Text className="text-white font-medium text-sm">
                {cat.category_name}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white font-bold text-sm">
                {formatCurrency(cat.amount)}
              </Text>
              <Text className="text-gray-500 text-xs">
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
