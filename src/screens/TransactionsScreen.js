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

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const tabs = ["All", "Spending", "Income"];

  const fetchTransactions = async (reset = false) => {
    const currentPage = reset ? 1 : page;
    try {
      const params = { page: currentPage, limit: 20 };
      if (activeTab === "Spending") params.type = "expense";
      if (activeTab === "Income") params.type = "income";
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

  const handleDelete = (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(id);
            fetchTransactions(true);
          } catch (error) {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount) =>
    `$${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const groupByDate = (txList) => {
    const groups = {};
    (txList || []).forEach((tx) => {
      const date = new Date(tx.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  };

  const grouped = groupByDate(transactions);

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl">Transaction History</Text>
        </View>

        {/* Search */}
        <View className="bg-dark-card rounded-xl flex-row items-center px-4 py-3 mb-4">
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            className="flex-1 text-white ml-2 text-sm"
            placeholder="Super AI search"
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-dark-card rounded-xl p-1">
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
                  activeTab === tab ? "text-dark-bg" : "text-gray-400"
                }`}
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
            <Text className="text-gray-500 text-sm mb-2">{date}</Text>
            {txList.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                className="flex-row items-center bg-dark-card rounded-xl p-4 mb-2"
                onLongPress={() => handleDelete(tx.id)}
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
                    {tx.category?.name || "Unknown"}
                  </Text>
                  <Text className="text-gray-500 text-xs">
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
                    {formatCurrency(tx.amount)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {new Date(tx.date).toLocaleTimeString("en-US", {
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
