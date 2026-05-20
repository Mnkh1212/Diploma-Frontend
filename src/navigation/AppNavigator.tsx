import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList, BottomTabParamList } from "../types";

// Screens
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import BudgetScreen from "../screens/BudgetScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AdvisorScreen from "../screens/AdvisorScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AccountsScreen from "../screens/AccountsScreen";
import ScheduledPaymentsScreen from "../screens/ScheduledPaymentsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import DataImportScreen from "../screens/DataImportScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import AppearanceScreen from "../screens/AppearanceScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Floating center "+" товч — shadow + glow-той хүчтэй CTA.
function CustomTabButton({ onPress }: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      activeOpacity={0.85}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#00C853",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -22,
          shadowColor: "#00C853",
          shadowOpacity: 0.45,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 14,
          elevation: 10,
          borderWidth: 4,
          borderColor: "#0D0D0D00",
        }}
      >
        <Ionicons name="add" size={28} color="#0D0D0D" />
      </View>
    </TouchableOpacity>
  );
}

// Active indicator dot (active tab-ийн доор гарч ирэх жижиг ногоон цэг)
function ActiveDot({ focused }: { focused: boolean }) {
  if (!focused) return null;
  return (
    <View
      style={{
        position: "absolute",
        bottom: -10,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#00C853",
      }}
    />
  );
}

// Tab icon — focused үед filled, үгүй үед outline. Active үед доор дотдот.
function TabIcon({
  outline,
  filled,
  focused,
  color,
  size = 22,
}: {
  outline: keyof typeof Ionicons.glyphMap;
  filled: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size?: number;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={focused ? filled : outline} size={size} color={color} />
      <ActiveDot focused={focused} />
    </View>
  );
}

function BottomTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Tab хооронд жижиг shift анимаци — iOS/Android аль алинд жигд.
        animation: "shift",
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 86,
          paddingBottom: 26,
          paddingTop: 12,
          // Жижиг shadow — separation мэдрэмж нэмнэ
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
          elevation: 8,
        },
        tabBarActiveTintColor: "#00C853",
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Нүүр",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon outline="home-outline" filled="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: "Шинжилгээ",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              outline="bar-chart-outline"
              filled="bar-chart"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddTransactionScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => <Ionicons name="add" size={28} color="#0D0D0D" />,
          tabBarButton: (props) => <CustomTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="AI Chat"
        component={AdvisorScreen}
        options={{
          tabBarLabel: "Зөвлөмж",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              outline="sparkles-outline"
              filled="sparkles"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Тохиргоо",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              outline="apps-outline"
              filled="apps"
              focused={focused}
              color={color}
            />
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
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // iOS-стиль гулсалттай шилжилт: native-stack v7-ийн "ios_from_right" нь
        // түрхэлж урагшилдаг premium feel-тэй. Хэвтээ swipe-аар буцаах хөдөлгөөн
        // нь параллакстай.
        animation: "ios_from_right",
        animationDuration: 320,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        // Modal background-ийг бүдгэрүүлэхээс зайлсхийнэ — шилжилт цэвэр гарна.
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      {!token ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
          <Stack.Screen name="DataImport" component={DataImportScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Appearance" component={AppearanceScreen} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{
              presentation: "modal",
              // Доороос дээш гулсаж гарах modal анимаци — Apple Wallet-стайл
              animation: "slide_from_bottom",
              animationDuration: 360,
              gestureDirection: "vertical",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
