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
  const [customCategory, setCustomCategory] = useState<string>("");
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
    if (!amount || !selectedAccount) {
      Alert.alert("Алдаа", "Дүн болон данс шаардлагатай");
      return;
    }

    setLoading(true);
    try {
      const trimmedCustom = customCategory.trim();
      await createTransaction({
        account_id: selectedAccount.id,
        // Chip сонгосон бол id-аар; үгүй гар бичсэн нэрээр; хоосон бол backend "Бусад"
        category_id: selectedCategory?.id,
        category_name: !selectedCategory && trimmedCustom ? trimmedCustom : undefined,
        amount: parseFloat(amount),
        type,
        description,
        date: new Date().toISOString().split("T")[0],
      });
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      // Force refresh by navigating to Home
      navigation.navigate("MainTabs" as any);
    } catch (error) {
      Alert.alert("Алдаа", "Гүйлгээ үүсгэж чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  const accent = type === "expense" ? "#FF4444" : "#00C853";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 }}>
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="font-bold text-lg" style={{ color: colors.text }}>Гүйлгээ нэмэх</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Type Toggle (segmented) */}
        <View className="flex-row p-1 rounded-2xl" style={{ backgroundColor: colors.card }}>
          {(["expense", "income"] as const).map((t) => {
            const active = type === t;
            const tint = t === "expense" ? "#FF4444" : "#00C853";
            return (
              <TouchableOpacity
                key={t}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: active ? tint : "transparent" }}
                onPress={() => {
                  setType(t);
                  setSelectedCategory(null);
                  setCustomCategory("");
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: active ? "#FFFFFF" : colors.textSecondary }}
                >
                  {t === "expense" ? "Зарлага" : "Орлого"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardDismissMode="on-drag"
      >
        {/* Amount Card */}
        <View
          className="rounded-2xl items-center justify-center mb-5"
          style={{ backgroundColor: colors.card, paddingVertical: 28, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-xs mb-2" style={{ color: colors.textSecondary, letterSpacing: 1 }}>ДҮН</Text>
          <View className="flex-row items-center">
            <Text style={{ color: accent, fontSize: 34, fontWeight: "800" }}>₮</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={{
                color: colors.text,
                fontSize: 40,
                fontWeight: "800",
                marginLeft: 6,
                minWidth: 80,
                textAlign: "center",
              }}
            />
          </View>
        </View>

        {/* Description */}
        <Text className="text-xs mb-2 ml-1" style={{ color: colors.textSecondary, letterSpacing: 0.5 }}>ТАЙЛБАР</Text>
        <TextInput
          className="rounded-2xl px-4 mb-5 text-base"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 14,
          }}
          placeholder="Юунд зарцуулсан бэ?"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        {/* Account Selection */}
        <Text className="text-xs mb-2 ml-1" style={{ color: colors.textSecondary, letterSpacing: 0.5 }}>ДАНС</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          {accounts.map((account) => {
            const active = selectedAccount?.id === account.id;
            return (
              <TouchableOpacity
                key={account.id}
                onPress={() => setSelectedAccount(account)}
                className="flex-row items-center rounded-2xl mr-2"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: active ? accent + "15" : colors.card,
                  borderWidth: 1,
                  borderColor: active ? accent : colors.border,
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={16}
                  color={active ? accent : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className="text-sm"
                  style={{ color: active ? accent : colors.text, fontWeight: active ? "600" : "400" }}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Selection */}
        <View className="flex-row items-baseline mb-2 ml-1">
          <Text className="text-xs" style={{ color: colors.textSecondary, letterSpacing: 0.5 }}>АНГИЛАЛ</Text>
          <Text className="text-xs ml-2" style={{ color: colors.textMuted }}>(сонголтгүй бол "Бусад")</Text>
        </View>
        <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
          {categories.map((cat) => {
            const active = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCustomCategory("");
                }}
                className="flex-row items-center rounded-2xl"
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: active ? (cat.color || accent) + "20" : colors.card,
                  borderWidth: 1,
                  borderColor: active ? (cat.color || accent) : colors.border,
                }}
              >
                <Ionicons
                  name={(cat.icon as keyof typeof Ionicons.glyphMap) || "pricetag-outline"}
                  size={15}
                  color={cat.color || colors.textSecondary}
                />
                <Text
                  className="text-sm ml-2"
                  style={{ color: colors.text, fontWeight: active ? "600" : "400" }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom category text input */}
        <View className="flex-row items-center rounded-2xl mb-6"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: customCategory.trim() ? accent : colors.border,
            paddingHorizontal: 14,
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={customCategory.trim() ? accent : colors.textMuted}
          />
          <TextInput
            className="flex-1 text-base ml-2"
            style={{ color: colors.text, paddingVertical: 14 }}
            placeholder="Эсвэл шинэ ангилал бичих..."
            placeholderTextColor={colors.textMuted}
            value={customCategory}
            onChangeText={(text) => {
              setCustomCategory(text);
              if (text.trim()) {
                setSelectedCategory(null);
              }
            }}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="rounded-2xl items-center justify-center"
          style={{
            backgroundColor: accent,
            paddingVertical: 16,
            shadowColor: accent,
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 4,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons
                name={type === "expense" ? "remove-circle" : "add-circle"}
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-bold text-base">
                {type === "expense" ? "Зарлага нэмэх" : "Орлого нэмэх"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
