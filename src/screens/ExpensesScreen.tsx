import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G } from "react-native-svg";
import { getExpensesSummary } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ExpensesSummary, CategoryExpense } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAccount } from "../context/AccountContext";

type ExpensesScreenProps = NativeStackScreenProps<RootStackParamList, "Expenses">;

// Aggregated category — ижил нэртэй category-уудыг нэг row болгож нэгтгэнэ
type AggCategory = {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
};

// SVG-аар жинхэнэ donut chart зурна. Тус бүр сегмент нь өөрийн өнгөтэй
// stroke arc-аар орчны эргэлдэнэ.
function DonutChart({
  categories,
  total,
  size = 200,
  strokeWidth = 26,
  centerText,
  centerLabel,
}: {
  categories: AggCategory[];
  total: number;
  size?: number;
  strokeWidth?: number;
  centerText: string;
  centerLabel?: string;
}) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Eзлэх % дагуу offset тооцоолно
  let cumulative = 0;
  const segments = categories
    .filter((c) => c.amount > 0)
    .map((c) => {
      const pct = total > 0 ? c.amount / total : 0;
      const dash = pct * circumference;
      const seg = {
        dash,
        gap: circumference - dash,
        offset: -cumulative,
        color: c.color || "#666",
      };
      cumulative += dash;
      return seg;
    });

  return (
    <View style={{ alignItems: "center", justifyContent: "center", marginVertical: 16 }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          {/* Background ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.card}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Segments */}
          <G>
            {segments.map((s, i) => (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={s.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={s.offset}
                strokeLinecap="butt"
              />
            ))}
          </G>
        </Svg>
        {/* Center text */}
        <View style={{ position: "absolute", alignItems: "center" }}>
          {centerLabel && (
            <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>
              {centerLabel}
            </Text>
          )}
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>
            {centerText}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ExpensesScreen({ navigation }: ExpensesScreenProps) {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const { selectedAccountId, selectedAccount } = useAccount();
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [period, setPeriod] = useState<string>("monthly");

  const periods: { label: string; value: string }[] = [
    { label: "Өдөр", value: "daily" },
    { label: "7 хоног", value: "weekly" },
    { label: "Сар", value: "monthly" },
    { label: "Жил", value: "yearly" },
  ];

  const fetchData = async (): Promise<void> => {
    try {
      const { data } = await getExpensesSummary(period, selectedAccountId ?? undefined);
      setSummary(data);
    } catch (error) {
      console.log("Expenses error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [period, selectedAccountId])
  );

  // Backend нь нэг ангилал нэртэй олон category_id (dynamic category үүсэх
  // тохиолдлоор) буцаах боломжтой — UI дээр дахин давтахгүйн тулд нэрээр
  // groupBy хийж нэгтгэнэ.
  const aggregated: AggCategory[] = useMemo(() => {
    const map = new Map<string, AggCategory>();
    (summary?.categories || []).forEach((c: CategoryExpense) => {
      const name = c.category_name || "Бусад";
      const existing = map.get(name);
      if (existing) {
        existing.amount += c.amount || 0;
        existing.count += 1;
      } else {
        map.set(name, {
          name,
          amount: c.amount || 0,
          percentage: 0,
          color: c.color || "#7C4DFF",
          icon: c.icon || "pricetag-outline",
          count: 1,
        });
      }
    });
    const list = Array.from(map.values());
    const total = list.reduce((acc, c) => acc + c.amount, 0);
    list.forEach((c) => (c.percentage = total > 0 ? (c.amount / total) * 100 : 0));
    return list.sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const totalAmount = aggregated.reduce((acc, c) => acc + c.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20, flex: 1 }}>
            Зарлага
          </Text>
          {selectedAccount && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: (selectedAccount.color || "#00C853") + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: selectedAccount.color || "#00C853",
                  marginRight: 6,
                }}
              />
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: "600" }} numberOfLines={1}>
                {selectedAccount.name}
              </Text>
            </View>
          )}
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 11,
            marginBottom: 12,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 10 }}>AI хайлт</Text>
        </View>

        {/* Period Tabs */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 4,
          }}
        >
          {periods.map((p) => {
            const active = period === p.value;
            return (
              <TouchableOpacity
                key={p.value}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: active ? "#00C853" : "transparent",
                }}
                onPress={() => setPeriod(p.value)}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 13,
                    color: active ? "#0D0D0D" : colors.textSecondary,
                  }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Empty state */}
        {aggregated.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Ionicons name="receipt-outline" size={56} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 12 }}>
              Энэ хугацаанд зарлага байхгүй
            </Text>
          </View>
        )}

        {/* Donut Chart */}
        {aggregated.length > 0 && (
          <DonutChart
            categories={aggregated}
            total={totalAmount}
            centerText={formatAmount(totalAmount)}
            centerLabel="НИЙТ ЗАРЛАГА"
          />
        )}

        {/* Legend */}
        {aggregated.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {aggregated.slice(0, 6).map((c, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: c.color,
                    marginRight: 5,
                  }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{c.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Category List */}
        {aggregated.map((cat, index) => (
          <View
            key={index}
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: cat.color + "20",
                  marginRight: 12,
                }}
              >
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{cat.name}</Text>
                {cat.count > 1 && (
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                    {cat.count} дэд ангилал
                  </Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
                  {formatAmount(cat.amount)}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {cat.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View
              style={{
                height: 6,
                backgroundColor: colors.bg,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${Math.min(cat.percentage, 100)}%`,
                  backgroundColor: cat.color,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
