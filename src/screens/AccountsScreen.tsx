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

type Props = NativeStackScreenProps<RootStackParamList, "Accounts">;

const accountTypes = [
  { value: "bank", label: "Bank", icon: "business-outline", color: "#448AFF" },
  { value: "cash", label: "Cash", icon: "cash-outline", color: "#00C853" },
  { value: "credit_card", label: "Credit Card", icon: "card-outline", color: "#FF6B35" },
  { value: "investment", label: "Investment", icon: "trending-up-outline", color: "#7C4DFF" },
] as const;

export default function AccountsScreen({ navigation }: Props) {
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
      Alert.alert("Error", "Account name is required");
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
      Alert.alert("Error", "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number, name: string): void => {
    Alert.alert("Delete Account", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount(id);
            fetchAccounts();
          } catch (error) {
            Alert.alert("Error", "Failed to delete account");
          }
        },
      },
    ]);
  };

  const getTypeInfo = (type: string) =>
    accountTypes.find((t) => t.value === type) || accountTypes[0];

  const formatCurrency = (amount: number): string =>
    `$${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-5 pt-14">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-xl">Accounts</Text>
          </View>
          <TouchableOpacity
            className="bg-accent-green/20 p-2 rounded-xl"
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={22} color="#00C853" />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View className="bg-dark-card rounded-2xl p-5 mb-6">
          <Text className="text-gray-400 text-sm mb-1">Total Balance</Text>
          <Text className="text-white font-bold text-3xl">
            {formatCurrency(accounts.reduce((sum, a) => sum + (a.balance || 0), 0))}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Account List */}
        {accounts.map((account) => {
          const typeInfo = getTypeInfo(account.type);
          return (
            <TouchableOpacity
              key={account.id}
              className="flex-row items-center bg-dark-card rounded-xl p-4 mb-2"
              onLongPress={() => handleDelete(account.id, account.name)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: typeInfo.color + "20" }}
              >
                <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium text-base">{account.name}</Text>
                <Text className="text-gray-500 text-xs capitalize">{account.type.replace("_", " ")}</Text>
              </View>
              <Text className="text-white font-bold text-base">
                {formatCurrency(account.balance)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {accounts.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="wallet-outline" size={48} color="#444" />
            <Text className="text-gray-500 text-base mt-3">No accounts yet</Text>
            <TouchableOpacity
              className="bg-accent-green/20 px-6 py-3 rounded-xl mt-4"
              onPress={() => setShowModal(true)}
            >
              <Text className="text-accent-green font-medium">Add Account</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Add Account Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-dark-card rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white font-bold text-xl">New Account</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Account Name */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Account Name</Text>
              <TextInput
                className="bg-dark-surface text-white rounded-xl px-4 py-4 text-base border border-dark-border"
                placeholder="e.g. Main Bank Account"
                placeholderTextColor="#666"
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            {/* Account Type */}
            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2">Account Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {accountTypes.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    className={`flex-row items-center px-4 py-3 rounded-xl border ${
                      newType === t.value
                        ? "border-accent-green bg-accent-green/10"
                        : "border-dark-border bg-dark-surface"
                    }`}
                    onPress={() => setNewType(t.value)}
                  >
                    <Ionicons name={t.icon as any} size={16} color={t.color} />
                    <Text
                      className={`ml-2 text-sm font-medium ${
                        newType === t.value ? "text-accent-green" : "text-gray-400"
                      }`}
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
                <Text className="text-dark-bg font-bold text-lg">Create Account</Text>
              )}
            </TouchableOpacity>

            <View className="h-8" />
          </View>
        </View>
      </Modal>
    </View>
  );
}
