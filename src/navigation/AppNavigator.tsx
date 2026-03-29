import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList, BottomTabParamList } from "../types";

// Screens
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import BudgetScreen from "../screens/BudgetScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AIChatScreen from "../screens/AIChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AccountsScreen from "../screens/AccountsScreen";
import ScheduledPaymentsScreen from "../screens/ScheduledPaymentsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function CustomTabButton({ onPress }: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#00C853",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -24,
        }}
      >
        <Ionicons name="add" size={28} color="#0D0D0D" />
      </View>
    </TouchableOpacity>
  );
}

function BottomTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#00C853",
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Нүүр",
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: "Шинжилгээ",
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="trending-up-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddTransactionScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <Ionicons name="add" size={28} color="#0D0D0D" />
          ),
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="AI Chat"
        component={AIChatScreen}
        options={{
          tabBarLabel: "Зөвлөмж",
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ fontSize: 16, fontWeight: "700", color }}>Ai</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Тохиргоо",
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator(): React.JSX.Element {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <Ionicons name="wallet" size={48} color="#00C853" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="Transactions" component={TransactionsScreen} />
          <Stack.Screen name="Expenses" component={ExpensesScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Accounts" component={AccountsScreen} />
          <Stack.Screen name="ScheduledPayments" component={ScheduledPaymentsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
