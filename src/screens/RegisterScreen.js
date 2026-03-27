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
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-bg px-6 justify-center">
      <StatusBar style="light" />

      <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
      <Text className="text-gray-400 text-base mb-10">
        Start tracking your finances
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 text-sm mb-2">Full Name</Text>
        <TextInput
          className="bg-dark-card text-white rounded-xl px-4 py-4 text-base border border-dark-border"
          placeholder="Enter your name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
      </View>

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
          placeholder="Minimum 6 characters"
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
          <Text className="text-dark-bg font-bold text-lg">Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        className="items-center"
      >
        <Text className="text-gray-400">
          Already have an account?{" "}
          <Text className="text-accent-green font-bold">Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
