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
import { useTheme } from "../context/ThemeContext";

export default function AddTransactionScreen() {
  const { isDark, colors } = useTheme();
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
      Alert.alert("Алдаа", "Бүх шаардлагатай талбарыг бөглөнө үү");
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
      Alert.alert("Алдаа", "Гүйлгээ үүсгэж чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="font-bold text-xl" style={{ color: colors.text }}>Гүйлгээ нэмэх</Text>
          <View className="w-6" />
        </View>

        {/* Type Toggle */}
        <View className="flex-row rounded-xl p-1 mb-6" style={{ backgroundColor: colors.card }}>
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
                className={`font-bold text-sm ${
                  type === t ? "text-white" : ""
                }`}
                style={type !== t ? { color: colors.textSecondary } : undefined}
              >
                {t === "expense" ? "Зарлага" : "Орлого"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-5" keyboardDismissMode="on-drag">
        {/* Amount */}
        <View className="items-center mb-8">
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Дүн</Text>
          <View className="flex-row items-center">
            <Text className="text-4xl font-bold" style={{ color: colors.text }}>₮</Text>
            <TextInput
              className="text-4xl font-bold ml-1"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={{ minWidth: 100, color: colors.text }}
            />
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Тайлбар</Text>
          <TextInput
            className="rounded-xl px-4 py-4 text-base"
            style={{ backgroundColor: colors.card, color: colors.text, borderWidth: 1, borderColor: colors.border }}
            placeholder="Юунд зарцуулсан бэ?"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Account Selection */}
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Данс</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              className={`px-4 py-3 rounded-xl mr-2 border ${
                selectedAccount?.id === account.id
                  ? "border-accent-green bg-accent-green/10"
                  : ""
              }`}
              style={selectedAccount?.id !== account.id ? { borderColor: colors.border, backgroundColor: colors.card } : undefined}
              onPress={() => setSelectedAccount(account)}
            >
              <Text className="text-sm" style={{ color: colors.text }}>{account.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Selection */}
        <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Ангилал</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`flex-row items-center px-3 py-2 rounded-xl border ${
                selectedCategory?.id === cat.id
                  ? "border-accent-green bg-accent-green/10"
                  : ""
              }`}
              style={selectedCategory?.id !== cat.id ? { borderColor: colors.border, backgroundColor: colors.card } : undefined}
              onPress={() => setSelectedCategory(cat)}
            >
              <Ionicons
                name={(cat.icon as keyof typeof Ionicons.glyphMap) || "cash-outline"}
                size={16}
                color={cat.color || "#666"}
              />
              <Text className="text-sm ml-2" style={{ color: colors.text }}>{cat.name}</Text>
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
              {type === "expense" ? "Зарлага" : "Орлого"} нэмэх
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
