import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (): Promise<void> => {
    if (!name || !email || !password) {
      Alert.alert("Алдаа", "Бүх талбарыг бөглөнө үү");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Алдаа", "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      const err = error as ApiError;
      Alert.alert("Алдаа", err.response?.data?.error || "Бүртгэл амжилтгүй боллоо");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-bg px-6 justify-center">
      <StatusBar style="light" />

      <Text className="text-white text-3xl font-bold mb-2">Бүртгүүлэх</Text>
      <Text className="text-gray-400 text-base mb-10">
        Санхүүгээ хянаж эхлээрэй
      </Text>

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

      <View className="mb-8">
        <Text className="text-gray-400 text-sm mb-2">Нууц үг</Text>
        <TextInput
          className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
          placeholder="Хамгийн багадаа 6 тэмдэгт"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className="bg-accent-green py-4 rounded-2xl items-center mb-6"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0D0D0D" />
        ) : (
          <Text className="text-dark-bg font-bold text-lg">Бүртгүүлэх</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        className="items-center"
      >
        <Text className="text-gray-400">
          Бүртгэлтэй юу?{" "}
          <Text className="text-accent-green font-bold">Нэвтрэх</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
