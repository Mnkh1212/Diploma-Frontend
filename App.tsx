import "./global.css";
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { CurrencyProvider } from "./src/context/CurrencyContext";
import { getDashboard } from "./src/services/api";
import AppNavigator from "./src/navigation/AppNavigator";

// Local notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}

// Өдөр бүр AI шинжилгээ хийж local notification илгээх
async function scheduleDailyAnalysis() {
  // Хуучин scheduled notification устгах
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Өдөр бүр өглөөний 9:00-д шинжилгээ хийх
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 Өдрийн санхүүгийн тойм",
      body: "Өнөөдрийн санхүүгийн шинжилгээг шалгаарай.",
      data: { type: "daily_analysis" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });
}

// App нээгдэх үед шууд шинжилгээ хийж notification харуулах
async function runInstantAnalysis() {
  try {
    const { data } = await getDashboard();
    if (!data) return;

    const { balance, total_income, total_expenses } = data;

    const insights: { title: string; body: string }[] = [];

    // Үлдэгдлийн мэдээлэл
    insights.push({
      title: "💰 Өнөөдрийн тойм",
      body: `Үлдэгдэл: ${Math.round(balance).toLocaleString()}₮ | Орлого: ${Math.round(total_income).toLocaleString()}₮ | Зарлага: ${Math.round(total_expenses).toLocaleString()}₮`,
    });

    // Хэмнэлтийн анализ
    const savingsRate = total_income > 0
      ? ((total_income - total_expenses) / total_income) * 100
      : 0;

    if (savingsRate >= 30) {
      insights.push({
        title: "🎉 Маш сайн хэмнэлт!",
        body: `Орлогынхоо ${Math.round(savingsRate)}%-ийг хэмнэж байна. Хөрөнгө оруулалтад зарцуулах боломжтой.`,
      });
    } else if (savingsRate < 10 && total_income > 0) {
      insights.push({
        title: "⚠️ Хэмнэлт бага байна",
        body: `Хэмнэлтийн хувь ${Math.round(savingsRate)}%. Дор хаяж 20%-ийг хэмнэхийг зорьж үзээрэй.`,
      });
    }

    if (total_expenses > total_income && total_income > 0) {
      insights.push({
        title: "🚨 Зарлага орлогоос хэтэрсэн",
        body: "Энэ сард орлогоосоо илүү зарцуулж байна. Шаардлагагүй зардлыг бууруулаарай.",
      });
    }

    // 3 секундийн зайтай notification илгээх
    for (let i = 0; i < insights.length; i++) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: insights[i].title,
          body: insights[i].body,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2 + i * 3,
        },
      });
    }
  } catch {}
}

export default function App() {
  useEffect(() => {
    requestNotificationPermission()
      .then(() => {
        scheduleDailyAnalysis();
        // Нэвтэрсний дараа 5 секундын дараа шинжилгээ хийнэ
        setTimeout(() => runInstantAnalysis(), 5000);
      })
      .catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
