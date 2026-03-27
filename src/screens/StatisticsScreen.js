import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getStatistics, getScheduledPayments } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [period, setPeriod] = useState("monthly");

  const periods = ["Daily", "Weekly", "Monthly", "Yearly"];

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        getStatistics(period),
        getScheduledPayments(),
      ]);
      setStats(statsRes.data);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.log("Statistics error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [period])
  );

  const formatCurrency = (amount) =>
    `$${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const maxValue = Math.max(
    ...((stats?.periods || []).flatMap((p) => [p.income, p.expenses])),
    1
  );

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-5 pt-14">
        <Text className="text-white font-bold text-xl mb-4">Statistics</Text>

        {/* Scheduled Payments */}
        <View className="bg-dark-card rounded-2xl p-4 mb-6">
          <Text className="text-white font-bold text-base mb-3">
            Scheduled payments
          </Text>
          {payments.slice(0, 4).map((payment, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: (payment.category?.color || "#666") + "20",
                }}
              >
                <Ionicons
                  name={payment.category?.icon || "card-outline"}
                  size={14}
                  color={payment.category?.color || "#666"}
                />
              </View>
              <Text className="text-white text-sm flex-1">
                {payment.description}
              </Text>
              <Text className="text-accent-red text-sm font-bold">
                -${payment.amount?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View className="bg-dark-card rounded-xl flex-row items-center px-4 py-3 mb-4">
          <Ionicons name="search" size={18} color="#666" />
          <Text className="text-gray-500 ml-2 text-sm">Super AI search</Text>
        </View>

        {/* Period Tabs */}
        <View className="flex-row bg-dark-card rounded-xl p-1 mb-4">
          {periods.map((p) => (
            <TouchableOpacity
              key={p}
              className={`flex-1 py-2 rounded-lg items-center ${
                period === p.toLowerCase() ? "bg-accent-green" : ""
              }`}
              onPress={() => setPeriod(p.toLowerCase())}
            >
              <Text
                className={`font-medium text-xs ${
                  period === p.toLowerCase() ? "text-dark-bg" : "text-gray-400"
                }`}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date */}
        <Text className="text-gray-400 text-center text-sm mb-4">
          {new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        {/* Income / Expenses Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-dark-card rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-1">Income</Text>
            <Text className="text-accent-green font-bold text-lg">
              {formatCurrency(stats?.income)}
            </Text>
          </View>
          <View className="flex-1 bg-dark-card rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-1">Expenses</Text>
            <Text className="text-accent-red font-bold text-lg">
              {formatCurrency(stats?.expenses)}
            </Text>
          </View>
        </View>

        {/* Bar Chart */}
        <View className="bg-dark-card rounded-2xl p-4 mb-6">
          <Text className="text-white font-bold text-base mb-4">
            Last 6 periods
          </Text>
          <View className="flex-row items-end justify-between h-40">
            {(stats?.periods || []).map((p, i) => (
              <View key={i} className="items-center flex-1 px-1">
                <View className="flex-row items-end gap-1 mb-1">
                  <View
                    className="w-3 rounded-t-sm bg-accent-green"
                    style={{
                      height: Math.max((p.income / maxValue) * 120, 4),
                    }}
                  />
                  <View
                    className="w-3 rounded-t-sm bg-accent-orange"
                    style={{
                      height: Math.max((p.expenses / maxValue) * 120, 4),
                    }}
                  />
                </View>
                <Text className="text-gray-500 text-xs">{p.label}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row mt-3 gap-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-green mr-1" />
              <Text className="text-gray-400 text-xs">Income</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-accent-orange mr-1" />
              <Text className="text-gray-400 text-xs">Expenses</Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
