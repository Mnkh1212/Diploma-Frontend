import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

interface SettingsItem {
  icon: string;
  label: string;
  sublabel: string;
  color: string;
}

interface SettingsSection {
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const sections: SettingsSection[] = [
    {
      items: [
        {
          icon: "person-outline",
          label: "Profile",
          sublabel: "Login credentials",
          color: "#448AFF",
        },
        {
          icon: "image-outline",
          label: "Appearance",
          sublabel: "Widgets, Themes",
          color: "#7C4DFF",
        },
      ],
    },
    {
      items: [
        {
          icon: "settings-outline",
          label: "General",
          sublabel: "Currency, clear data",
          color: "#FF6B35",
        },
        {
          icon: "card-outline",
          label: "Account settings",
          sublabel: "Connected accounts",
          color: "#4ECDC4",
        },
        {
          icon: "document-outline",
          label: "Data",
          sublabel: "Export, import data",
          color: "#FFD600",
        },
        {
          icon: "lock-closed-outline",
          label: "Privacy",
          sublabel: "Password, privacy preferences",
          color: "#00C853",
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-dark-bg">
      <StatusBar style="light" />
      <ScrollView className="flex-1 px-5 pt-14">
        <Text className="text-white font-bold text-xl mb-6">Settings</Text>

        {/* User Card */}
        <View className="bg-dark-card rounded-2xl p-5 flex-row items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-accent-purple items-center justify-center mr-4">
            <Text className="text-white font-bold text-2xl">
              {user?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              {user?.name || "User"}
            </Text>
            <Text className="text-gray-400 text-sm">{user?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>

        {/* Settings Sections */}
        {sections.map((section, sIndex) => (
          <View key={sIndex} className="bg-dark-card rounded-2xl mb-4 overflow-hidden">
            {section.items.map((item, iIndex) => (
              <TouchableOpacity
                key={iIndex}
                className={`flex-row items-center p-4 ${
                  iIndex < section.items.length - 1 ? "border-b border-dark-border" : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: item.color + "20" }}
                >
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium text-sm">
                    {item.label}
                  </Text>
                  <Text className="text-gray-500 text-xs">{item.sublabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Quick Actions */}
        <View className="bg-dark-card rounded-2xl mb-4 overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-dark-border">
            <View className="w-10 h-10 rounded-xl bg-accent-blue/20 items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#448AFF" />
            </View>
            <Text className="text-white font-medium text-sm flex-1">Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-dark-border">
            <View className="w-10 h-10 rounded-xl bg-accent-yellow/20 items-center justify-center mr-3">
              <Ionicons name="star-outline" size={20} color="#FFD600" />
            </View>
            <Text className="text-white font-medium text-sm flex-1">Rate App</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-accent-red/10 rounded-2xl p-4 items-center mb-8"
          onPress={handleLogout}
        >
          <Text className="text-accent-red font-bold text-base">Logout</Text>
        </TouchableOpacity>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
