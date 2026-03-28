import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState<string>(user?.name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [currency, setCurrency] = useState<string>(user?.currency || "USD");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Алдаа", "Нэр болон имэйл шаардлагатай");
      return;
    }
    setLoading(true);
    try {
      const { data } = await updateProfile({ name, email, currency });
      setUser(data);
      Alert.alert("Амжилттай", "Профайл амжилттай шинэчлэгдлээ");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Алдаа", "Профайл шинэчлэж чадсангүй");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-5 pt-14">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl">Профайл засах</Text>
        </View>

        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-accent-purple items-center justify-center mb-3">
            <Text className="text-white font-bold text-4xl">
              {user?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm">Зураг солихын тулд дарна уу</Text>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-2">Нэр</Text>
          <TextInput
            className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
            placeholder="Нэрээ оруулна уу"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-2">Имэйл</Text>
          <TextInput
            className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
            placeholder="Имэйл хаягаа оруулна уу"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Currency */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-2">Валют</Text>
          <View className="flex-row gap-2">
            {["USD", "EUR", "MNT"].map((c) => (
              <TouchableOpacity
                key={c}
                className={`px-5 py-3 rounded-xl border ${
                  currency === c
                    ? "border-accent-green bg-accent-green/10"
                    : "border-dark-border bg-dark-card"
                }`}
                onPress={() => setCurrency(c)}
              >
                <Text
                  className={`font-medium text-sm ${
                    currency === c ? "text-accent-green" : "text-gray-400"
                  }`}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Member Since */}
        <View className="bg-dark-card rounded-xl p-4 mb-6">
          <Text className="text-gray-400 text-sm">Бүртгүүлсэн</Text>
          <Text className="text-white font-medium text-base mt-1">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("mn-MN", {
                  month: "long",
                  year: "numeric",
                })
              : "N/A"}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-accent-green py-4 rounded-2xl items-center mb-8"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-dark-bg font-bold text-lg">Хадгалах</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
