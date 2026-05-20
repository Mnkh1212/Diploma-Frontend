import React, { useState, useEffect, useMemo } from "react";
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

  // Backend нь ижил нэртэй category-уудыг олон удаа буцаах боломжтой (өмнөх
  // тестүүдээс үлдсэн dynamic duplicate). UI-д давтахаас сэргийлж нэрээр
  // dedup хийнэ — эхний occurrence-ийг үлдээнэ.
  const dedupedCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((c) => {
      const key = (c.name || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);

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

      {/* Header — нягтруулсан */}
      <View style={{ paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 17 }}>Гүйлгээ нэмэх</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Type Toggle */}
        <View style={{ flexDirection: "row", padding: 4, borderRadius: 14, backgroundColor: colors.card }}>
          {(["expense", "income"] as const).map((t) => {
            const active = type === t;
            const tint = t === "expense" ? "#FF4444" : "#00C853";
            return (
              <TouchableOpacity
                key={t}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: active ? tint : "transparent",
                }}
                onPress={() => {
                  setType(t);
                  setSelectedCategory(null);
                  setCustomCategory("");
                }}
              >
                <Text style={{ color: active ? "#FFFFFF" : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                  {t === "expense" ? "Зарлага" : "Орлого"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Card */}
        <View
          style={{
            backgroundColor: colors.card,
            paddingVertical: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 1, marginBottom: 2 }}>ДҮН</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ color: accent, fontSize: 30, fontWeight: "800" }}>₮</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={{
                color: colors.text,
                fontSize: 30,
                fontWeight: "800",
                marginLeft: 6,
                minWidth: 50,
                padding: 0,
              }}
            />
          </View>
        </View>

        {/* Description */}
        <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>ТАЙЛБАР</Text>
        <TextInput
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            fontSize: 14,
            marginBottom: 12,
          }}
          placeholder="Юунд зарцуулсан бэ?"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        {/* Account Selection */}
        <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 }}>ДАНС</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {accounts.map((account) => {
            const active = selectedAccount?.id === account.id;
            return (
              <TouchableOpacity
                key={account.id}
                onPress={() => setSelectedAccount(account)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  marginRight: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: active ? accent + "15" : colors.card,
                  borderWidth: 1,
                  borderColor: active ? accent : colors.border,
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={14}
                  color={active ? accent : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: active ? accent : colors.text, fontWeight: active ? "600" : "400", fontSize: 13 }}>
                  {account.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Selection */}
        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 6, marginLeft: 4 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 0.5 }}>АНГИЛАЛ</Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, marginLeft: 6 }}>(сонголтгүй бол "Бусад")</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {dedupedCategories.map((cat) => {
            const active = selectedCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCustomCategory("");
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  backgroundColor: active ? (cat.color || accent) + "20" : colors.card,
                  borderWidth: 1,
                  borderColor: active ? (cat.color || accent) : colors.border,
                }}
              >
                <Ionicons
                  name={(cat.icon as keyof typeof Ionicons.glyphMap) || "pricetag-outline"}
                  size={13}
                  color={cat.color || colors.textSecondary}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: active ? "600" : "400",
                    fontSize: 12.5,
                    marginLeft: 6,
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom category text input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: customCategory.trim() ? accent : colors.border,
            paddingHorizontal: 12,
            paddingVertical: 9,
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={customCategory.trim() ? accent : colors.textMuted}
          />
          <TextInput
            style={{ flex: 1, color: colors.text, padding: 0, marginLeft: 8, fontSize: 14 }}
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
      </ScrollView>

      {/* Sticky Submit Footer — scroll хийхгүй шууд дарж болохоор */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 20,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: accent,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={type === "expense" ? "remove-circle" : "add-circle"}
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
                {type === "expense" ? "Зарлага нэмэх" : "Орлого нэмэх"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
