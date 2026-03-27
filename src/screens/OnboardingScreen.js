import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function OnboardingScreen({ navigation }) {
  return (
    <View className="flex-1 bg-dark-bg items-center justify-center px-8">
      <StatusBar style="light" />

      {/* Logo */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-accent-orange/20 items-center justify-center mb-4">
          <View className="w-12 h-12 rounded-full bg-accent-orange/60" />
        </View>
        <Text className="text-white text-3xl font-bold">
          <Text className="text-accent-green">✦</Text> fintrack
        </Text>
      </View>

      {/* Illustration */}
      <View className="w-48 h-48 rounded-full bg-dark-card items-center justify-center mb-8">
        <View className="w-32 h-32 rounded-full bg-accent-orange/30 items-center justify-center">
          <View className="w-20 h-20 rounded-full bg-accent-purple/50" />
        </View>
      </View>

      <Text className="text-white text-2xl font-bold text-center mb-3">
        Streamline Your Finances
      </Text>
      <Text className="text-gray-400 text-center text-base mb-12 leading-6">
        Link your bank accounts, credit cards, and more for seamless tracking.
        Get real-time updates and stay in control of your money.
      </Text>

      <TouchableOpacity
        className="w-full bg-accent-green py-4 rounded-2xl items-center mb-4"
        onPress={() => navigation.navigate("Register")}
      >
        <Text className="text-dark-bg font-bold text-lg">Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text className="text-gray-400 text-base">Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
