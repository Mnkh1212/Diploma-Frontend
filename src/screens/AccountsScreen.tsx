import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getAccounts, createAccount, deleteAccount } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, Account } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

type Props = NativeStackScreenProps<RootStackParamList, "Accounts">;

const accountTypes = [
  { value: "bank", label: "Банк", icon: "business-outline", color: "#448AFF" },
  { value: "cash", label: "Бэлэн мөнгө", icon: "cash-outline", color: "#00C853" },
  { value: "credit_card", label: "Кредит карт", icon: "card-outline", color: "#FF6B35" },
  { value: "investment", label: "Хөрөнгө оруулалт", icon: "trending-up-outline", color: "#7C4DFF" },
] as const;

export default function AccountsScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newType, setNewType] = useState<Account["type"]>("bank");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAccounts = async (): Promise<void> => {
    try {
      const { data } = await getAccounts();
      setAccounts(data || []);
    } catch (error) {
      console.log("Accounts error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  const handleCreate = async (): Promise<void> => {
    if (!newName.trim()) {
      Alert.alert("Алдаа", "Дансны нэр шаардлагатай");
      return;
    }
    setLoading(true);
    try {
      await createAccount({ name: newName, type: newType });
      setShowModal(false);
      setNewName("");
      setNewType("bank");
      fetchAccounts();
    } catch (error) {
      Alert.alert("Алдаа", "Данс үүсгэж чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number, name: string): void => {
    Alert.alert("Данс устгах", `"${name}" дансыг устгахдаа итгэлтэй байна уу?`, [
      { text: "Цуцлах" },
      {
        text: "Устгах",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount(id);
            fetchAccounts();
          } catch (error) {
            Alert.alert("Алдаа", "Данс устгаж чадсангүй");
          }
        },
      },
    ]);
  };

  const getTypeInfo = (type: string) =>
    accountTypes.find((t) => t.value === type) || accountTypes[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView className="flex-1 px-5 pt-14" keyboardDismissMode="on-drag">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="font-bold text-xl" style={{ color: colors.text }}>Данснууд</Text>
          </View>
          <TouchableOpacity
            className="bg-accent-green/20 p-2 rounded-xl"
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={22} color="#00C853" />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>Нийт үлдэгдэл</Text>
          <Text className="font-bold text-3xl" style={{ color: colors.text }}>
            {formatAmount(accounts.reduce((sum, a) => sum + (a.balance || 0), 0))}
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
            {accounts.length} данс
          </Text>
        </View>

        {/* Account List */}
        {accounts.map((account) => {
          const typeInfo = getTypeInfo(account.type);
          return (
            <TouchableOpacity
              key={account.id}
              className="flex-row items-center rounded-xl p-4 mb-2"
              style={{ backgroundColor: colors.card }}
              onLongPress={() => handleDelete(account.id, account.name)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: typeInfo.color + "20" }}
              >
                <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-base" style={{ color: colors.text }}>{account.name}</Text>
                <Text className="text-xs capitalize" style={{ color: colors.textMuted }}>{account.type.replace("_", " ")}</Text>
              </View>
              <Text className="font-bold text-base" style={{ color: colors.text }}>
                {formatAmount(account.balance)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {accounts.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text className="text-base mt-3" style={{ color: colors.textMuted }}>Данс байхгүй байна</Text>
            <TouchableOpacity
              className="bg-accent-green/20 px-6 py-3 rounded-xl mt-4"
              onPress={() => setShowModal(true)}
            >
              <Text className="text-accent-green font-medium">Данс нэмэх</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Add Account Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="font-bold text-xl" style={{ color: colors.text }}>Шинэ данс</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Account Name */}
            <View className="mb-4">
              <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Дансны нэр</Text>
              <TextInput
                className="rounded-xl px-4 py-4 text-base"
                style={{ backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                placeholder="Жишээ нь: Үндсэн банкны данс"
                placeholderTextColor={colors.textMuted}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            {/* Account Type */}
            <View className="mb-6">
              <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Дансны төрөл</Text>
              <View className="flex-row flex-wrap gap-2">
                {accountTypes.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    className={`flex-row items-center px-4 py-3 rounded-xl border ${
                      newType === t.value
                        ? "border-accent-green bg-accent-green/10"
                        : ""
                    }`}
                    style={newType !== t.value ? { borderColor: colors.border, backgroundColor: colors.surface } : undefined}
                    onPress={() => setNewType(t.value)}
                  >
                    <Ionicons name={t.icon as any} size={16} color={t.color} />
                    <Text
                      className={`ml-2 text-sm font-medium ${
                        newType === t.value ? "text-accent-green" : ""
                      }`}
                      style={newType !== t.value ? { color: colors.textSecondary } : undefined}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              className="bg-accent-green py-4 rounded-2xl items-center"
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text className="text-dark-bg font-bold text-lg">Данс үүсгэх</Text>
              )}
            </TouchableOpacity>

            <View className="h-8" />
          </View>
        </View>
      </Modal>
    </View>
  );
}
