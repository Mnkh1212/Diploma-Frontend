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

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      const err = error as ApiError;
      Alert.alert("Error", err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-bg px-6 justify-center">
      <StatusBar style="light" />

      <Text className="text-white text-3xl font-bold mb-2">Welcome Back</Text>
      <Text className="text-gray-400 text-base mb-10">
        Sign in to continue
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 text-sm mb-2">Email</Text>
        <TextInput
          className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
          placeholder="Enter your email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 text-sm mb-2">Password</Text>
        <TextInput
          className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
          placeholder="Enter your password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className="bg-accent-green py-4 rounded-2xl items-center mb-6"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0D0D0D" />
        ) : (
          <Text className="text-dark-bg font-bold text-lg">Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        className="items-center"
      >
        <Text className="text-gray-400">
          Don't have an account?{" "}
          <Text className="text-accent-green font-bold">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
