import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const { data } = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.log("Dashboard error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

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
            <View className="w-10 h-10 rounded-full bg-accent-purple items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">
                {user?.name?.charAt(0) || "U"}
              </Text>
            </View>
            <View>
              <Text className="text-gray-400 text-sm">Welcome back</Text>
              <Text className="text-white font-bold text-base">
                {user?.name || "User"}
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <Text className="text-gray-400 text-sm mb-1">Balance</Text>
        <Text className="text-white text-4xl font-bold mb-4">
          {formatCurrency(dashboard?.balance)}
        </Text>

        {/* Savings Card */}
        {dashboard?.savings_amount !== 0 && (
          <View className="flex-row items-center bg-dark-card rounded-2xl p-4 mb-6">
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1">
                {dashboard?.savings_percent > 0 ? "Well done!" : "Heads up!"}
              </Text>
              <Text className="text-gray-400 text-sm">
                {dashboard?.savings_percent > 0
                  ? `Your spending reduced by ${Math.abs(dashboard?.savings_percent || 0).toFixed(0)}% from last month.`
                  : `Your spending increased by ${Math.abs(dashboard?.savings_percent || 0).toFixed(0)}% from last month.`}
              </Text>
              <TouchableOpacity>
                <Text className="text-accent-green text-sm mt-2">View Details</Text>
              </TouchableOpacity>
            </View>
            <View className="w-16 h-16 rounded-full bg-accent-green/20 items-center justify-center ml-3">
              <Text className="text-accent-green font-bold text-base">
                ${Math.abs(dashboard?.savings_amount || 0).toFixed(0)}
              </Text>
            </View>
          </View>
        )}

        {/* Account Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {(dashboard?.accounts || []).map((account, index) => (
            <View
              key={account.id || index}
              className="bg-dark-card rounded-2xl p-4 mr-3"
              style={{ width: 120 }}
            >
              <Ionicons
                name={account.icon || "wallet-outline"}
                size={20}
                color={account.color || "#4ECDC4"}
              />
              <Text className="text-white font-bold text-lg mt-2">
                {formatCurrency(account.balance)}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">{account.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          {[
            { icon: "swap-horizontal", label: "Transfer", color: "#448AFF" },
            { icon: "card-outline", label: "Cards", color: "#FF6B35" },
            { icon: "trending-up", label: "Invest", color: "#00C853" },
            { icon: "repeat", label: "Recurring", color: "#7C4DFF" },
            { icon: "add-circle-outline", label: "More", color: "#FFD600" },
          ].map((action, index) => (
            <TouchableOpacity key={index} className="items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-1"
                style={{ backgroundColor: action.color + "20" }}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text className="text-gray-400 text-xs">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction History */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Transaction History</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text className="text-accent-green text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {(dashboard?.recent_transactions || []).map((tx, index) => (
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
                name={tx.category?.icon || "cash-outline"}
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

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
