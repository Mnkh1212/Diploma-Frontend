import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
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

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function CustomTabButton({ children, onPress }: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center -mt-6"
    >
      <View className="w-14 h-14 rounded-full bg-accent-green items-center justify-center shadow-lg">
        {children}
      </View>
    </TouchableOpacity>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A2E",
          borderTopColor: "#2A2A3E",
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#00C853",
        tabBarInactiveTintColor: "#666",
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
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="stats-chart-outline" size={22} color={color} />
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
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="chatbubble-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
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
