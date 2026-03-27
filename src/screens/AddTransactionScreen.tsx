import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createTransaction, getCategories, getAccounts } from "../services/api";
import { RootStackParamList, Category, Account } from "../types";

export default function AddTransactionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async (): Promise<void> => {
    try {
      const [catRes, accRes] = await Promise.all([
        getCategories(type),
        getAccounts(),
      ]);
      setCategories(catRes.data || []);
      setAccounts(accRes.data || []);
      if (accRes.data?.length > 0 && !selectedAccount) {
        setSelectedAccount(accRes.data[0]);
      }
    } catch (error) {
      console.log("Fetch data error:", error);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!amount || !selectedCategory || !selectedAccount) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        account_id: selectedAccount.id,
        category_id: selectedCategory.id,
        amount: parseFloat(amount),
        type,
        description,
        date: new Date().toISOString().split("T")[0],
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl">Add Transaction</Text>
          <View className="w-6" />
        </View>

        {/* Type Toggle */}
        <View className="flex-row bg-dark-card rounded-xl p-1 mb-6">
          {(["expense", "income"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              className={`flex-1 py-3 rounded-lg items-center ${
                type === t
                  ? t === "expense"
                    ? "bg-accent-red"
                    : "bg-accent-green"
                  : ""
              }`}
              onPress={() => {
                setType(t);
                setSelectedCategory(null);
              }}
            >
              <Text
                className={`font-bold text-sm capitalize ${
                  type === t ? "text-white" : "text-gray-400"
                }`}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Amount */}
        <View className="items-center mb-8">
          <Text className="text-gray-400 text-sm mb-2">Amount</Text>
          <View className="flex-row items-center">
            <Text className="text-white text-4xl font-bold">$</Text>
            <TextInput
              className="text-white text-4xl font-bold ml-1"
              placeholder="0.00"
              placeholderTextColor="#444"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={{ minWidth: 100 }}
            />
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-2">Description</Text>
          <TextInput
            className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
            placeholder="What was this for?"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Account Selection */}
        <Text className="text-gray-400 text-sm mb-2">Account</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              className={`px-4 py-3 rounded-xl mr-2 border ${
                selectedAccount?.id === account.id
                  ? "border-accent-green bg-accent-green/10"
                  : "border-dark-border bg-dark-card"
              }`}
              onPress={() => setSelectedAccount(account)}
            >
              <Text className="text-white text-sm">{account.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Selection */}
        <Text className="text-gray-400 text-sm mb-2">Category</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`flex-row items-center px-3 py-2 rounded-xl border ${
                selectedCategory?.id === cat.id
                  ? "border-accent-green bg-accent-green/10"
                  : "border-dark-border bg-dark-card"
              }`}
              onPress={() => setSelectedCategory(cat)}
            >
              <Ionicons
                name={(cat.icon as keyof typeof Ionicons.glyphMap) || "cash-outline"}
                size={16}
                color={cat.color || "#666"}
              />
              <Text className="text-white text-sm ml-2">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center mb-8 ${
            type === "expense" ? "bg-accent-red" : "bg-accent-green"
          }`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Add {type === "expense" ? "Expense" : "Income"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
