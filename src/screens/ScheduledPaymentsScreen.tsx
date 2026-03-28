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
import {
  getScheduledPayments,
  createScheduledPayment,
  deleteScheduledPayment,
  getCategories,
  getAccounts,
} from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ScheduledPayment, Category, Account } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ScheduledPayments">;

export default function ScheduledPaymentsScreen({ navigation }: Props) {
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<ScheduledPayment["frequency"]>("monthly");
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    try {
      const [paymentsRes, catRes, accRes] = await Promise.all([
        getScheduledPayments(),
        getCategories("expense"),
        getAccounts(),
      ]);
      setPayments(paymentsRes.data || []);
      setCategories(catRes.data || []);
      setAccounts(accRes.data || []);
      if (accRes.data?.length > 0 && !selectedAccount) {
        setSelectedAccount(accRes.data[0]);
      }
    } catch (error) {
      console.log("Scheduled payments error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleCreate = async (): Promise<void> => {
    if (!description.trim() || !amount || !selectedCategory || !selectedAccount) {
      Alert.alert("Алдаа", "Бүх талбарыг бөглөнө үү");
      return;
    }
    setLoading(true);
    try {
      await createScheduledPayment({
        description,
        amount: parseFloat(amount),
        frequency,
        category_id: selectedCategory.id,
        account_id: selectedAccount.id,
        next_date: new Date().toISOString().split("T")[0],
        is_active: true,
      });
      setShowModal(false);
      setDescription("");
      setAmount("");
      setSelectedCategory(null);
      fetchData();
    } catch (error) {
      Alert.alert("Алдаа", "Төлөвлөсөн төлбөр үүсгэж чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number): void => {
    Alert.alert("Устгах", "Энэ төлөвлөсөн төлбөрийг устгах уу?", [
      { text: "Цуцлах" },
      {
        text: "Устгах",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteScheduledPayment(id);
            fetchData();
          } catch (error) {
            Alert.alert("Алдаа", "Устгаж чадсангүй");
          }
        },
      },
    ]);
  };

  const frequencies: ScheduledPayment["frequency"][] = ["daily", "weekly", "monthly", "yearly"];

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
            <Text className="text-white font-bold text-xl">Төлөвлөсөн төлбөр</Text>
          </View>
          <TouchableOpacity
            className="bg-accent-purple/20 p-2 rounded-xl"
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={22} color="#7C4DFF" />
          </TouchableOpacity>
        </View>

        {/* Payments List */}
        {payments.map((payment) => (
          <TouchableOpacity
            key={payment.id}
            className="flex-row items-center bg-dark-card rounded-xl p-4 mb-2"
            onLongPress={() => handleDelete(payment.id)}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: (payment.category?.color || "#666") + "20" }}
            >
              <Ionicons
                name={(payment.category?.icon || "repeat") as any}
                size={18}
                color={payment.category?.color || "#666"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium text-sm">{payment.description}</Text>
              <Text className="text-gray-500 text-xs">
                {payment.frequency === "daily" ? "Өдөр бүр" : payment.frequency === "weekly" ? "7 хоног бүр" : payment.frequency === "monthly" ? "Сар бүр" : "Жил бүр"} - Дараагийн: {new Date(payment.next_date).toLocaleDateString()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-accent-red font-bold text-sm">
                -{(payment.amount || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮
              </Text>
              <View
                className={`px-2 py-0.5 rounded-full mt-1 ${
                  payment.is_active ? "bg-accent-green/20" : "bg-gray-600/20"
                }`}
              >
                <Text
                  className={`text-xs ${
                    payment.is_active ? "text-accent-green" : "text-gray-500"
                  }`}
                >
                  {payment.is_active ? "Идэвхтэй" : "Зогссон"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {payments.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="repeat-outline" size={48} color="#444" />
            <Text className="text-gray-500 text-base mt-3">Төлөвлөсөн төлбөр байхгүй</Text>
            <TouchableOpacity
              className="bg-accent-purple/20 px-6 py-3 rounded-xl mt-4"
              onPress={() => setShowModal(true)}
            >
              <Text className="text-accent-purple font-medium">Төлбөр нэмэх</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Add Payment Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-dark-card rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white font-bold text-xl">Шинэ төлөвлөсөн төлбөр</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Тайлбар</Text>
              <TextInput
                className="bg-dark-surface text-white rounded-xl px-4 py-4 text-base border border-dark-border"
                placeholder="Жишээ нь: Netflix захиалга"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Amount */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Дүн</Text>
              <TextInput
                className="bg-dark-surface text-white rounded-xl px-4 py-4 text-base border border-dark-border"
                placeholder="0"
                placeholderTextColor="#666"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Frequency */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Давтамж</Text>
              <View className="flex-row gap-2">
                {frequencies.map((f) => (
                  <TouchableOpacity
                    key={f}
                    className={`flex-1 py-2 rounded-xl items-center border ${
                      frequency === f
                        ? "border-accent-purple bg-accent-purple/10"
                        : "border-dark-border bg-dark-surface"
                    }`}
                    onPress={() => setFrequency(f)}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        frequency === f ? "text-accent-purple" : "text-gray-400"
                      }`}
                    >
                      {f === "daily" ? "Өдөр бүр" : f === "weekly" ? "7 хоног" : f === "monthly" ? "Сар бүр" : "Жил бүр"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Ангилал</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className={`flex-row items-center px-3 py-2 rounded-xl border ${
                        selectedCategory?.id === cat.id
                          ? "border-accent-green bg-accent-green/10"
                          : "border-dark-border bg-dark-surface"
                      }`}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Ionicons name={(cat.icon as any) || "cash-outline"} size={14} color={cat.color} />
                      <Text className="text-gray-300 text-xs ml-1">{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              className="bg-accent-purple py-4 rounded-2xl items-center"
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">Төлбөр үүсгэх</Text>
              )}
            </TouchableOpacity>

            <View className="h-8" />
          </View>
        </View>
      </Modal>
    </View>
  );
}
