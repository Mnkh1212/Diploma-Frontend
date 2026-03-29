import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Line, Circle as SvgCircle, Defs, LinearGradient, Stop } from "react-native-svg";
import { getStatistics, getScheduledPayments } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { StatisticsResponse, ScheduledPayment } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

const CHART_W = Dimensions.get("window").width - 100;
const CHART_H = 180;
const BAR_H = 140;

function niceNum(val: number): number {
  if (val <= 0) return 1000000;
  const exp = Math.pow(10, Math.floor(Math.log10(val)));
  const frac = val / exp;
  let nice: number;
  if (frac <= 1.5) nice = 1.5;
  else if (frac <= 2) nice = 2;
  else if (frac <= 3) nice = 3;
  else if (frac <= 5) nice = 5;
  else if (frac <= 7) nice = 7;
  else nice = 10;
  return Math.ceil((nice * exp) / exp) * exp;
}

function formatAxis(val: number): string {
  if (val === 0) return "0";
  if (val >= 1000000) {
    const m = val / 1000000;
    return m % 1 === 0 ? `${m}сая` : `${m.toFixed(1)}сая`;
  }
  if (val >= 1000) return `${(val / 1000).toFixed(0)}мян`;
  return `${val}`;
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

export default function StatisticsScreen() {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [period, setPeriod] = useState<string>("monthly");
  const [mainTab, setMainTab] = useState<string>("Статистик");

  const periods = [
    { label: "Өдөр", value: "daily" },
    { label: "7 хоног", value: "weekly" },
    { label: "Сар", value: "monthly" },
    { label: "Жил", value: "yearly" },
  ];

  const fetchData = async () => {
    try {
      const [s, p] = await Promise.all([getStatistics(period), getScheduledPayments()]);
      setStats(s.data);
      setPayments(p.data || []);
    } catch (e) {
      console.log("Stats error:", e);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [period]));

  const pData = stats?.periods || [];
  const rawMax = Math.max(...pData.flatMap((p) => [p.income, p.expenses]), 1);
  const ceilMax = niceNum(rawMax);
  const ticks = Array.from({ length: 6 }, (_, i) => ceilMax - (ceilMax / 5) * i);

  const toY = (v: number) => CHART_H - (v / ceilMax) * (CHART_H - 10);
  const toX = (i: number) => (i / Math.max(pData.length - 1, 1)) * CHART_W;

  const incPts = pData.map((p, i) => ({ x: toX(i), y: toY(p.income) }));
  const expPts = pData.map((p, i) => ({ x: toX(i), y: toY(p.expenses) }));

  const totInc = stats?.income || 0;
  const totExp = stats?.expenses || 0;
  const totMax = Math.max(totInc, totExp, 1);

  const barMax = niceNum(rawMax);
  const barTicks = Array.from({ length: 6 }, (_, i) => barMax - (barMax / 5) * i);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView className="flex-1 px-5 pt-14">
        <Text className="font-bold text-xl mb-4" style={{ color: colors.text }}>Шинжилгээ</Text>

        {/* Tab Switcher */}
        <View className="flex-row rounded-xl p-1 mb-5" style={{ backgroundColor: colors.card }}>
          {["Статистик", "Диаграм"].map((t) => (
            <TouchableOpacity
              key={t}
              className={`flex-1 py-3 rounded-lg items-center ${mainTab === t ? "bg-accent-green" : ""}`}
              onPress={() => setMainTab(t)}
            >
              <Text className={`font-semibold text-sm ${mainTab === t ? "text-dark-bg" : ""}`} style={mainTab !== t ? { color: colors.textSecondary } : undefined}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mainTab === "Статистик" ? (
          <>
            {/* Scheduled Payments */}
            <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: colors.card }}>
              <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Төлөвлөсөн төлбөр</Text>
              {payments.slice(0, 4).map((pay, i) => (
                <View key={i} className="flex-row items-center mb-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: (pay.category?.color || "#666") + "20" }}
                  >
                    <Ionicons name={(pay.category?.icon || "card-outline") as any} size={14} color={pay.category?.color || "#666"} />
                  </View>
                  <Text className="text-sm flex-1" style={{ color: colors.text }}>{pay.description}</Text>
                  <Text className="text-accent-red text-sm font-bold">-{formatAmount(pay.amount)}</Text>
                </View>
              ))}
            </View>

            {/* Period Tabs */}
            <View className="flex-row rounded-xl p-1 mb-4" style={{ backgroundColor: colors.card }}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  className={`flex-1 py-2 rounded-lg items-center ${period === p.value ? "bg-accent-green" : ""}`}
                  onPress={() => setPeriod(p.value)}
                >
                  <Text className={`font-medium text-xs ${period === p.value ? "text-dark-bg" : ""}`} style={period !== p.value ? { color: colors.textSecondary } : undefined}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Income / Expenses */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Орлого</Text>
                <Text className="text-accent-green font-bold text-lg">{formatAmount(stats?.income)}</Text>
              </View>
              <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Зарлага</Text>
                <Text className="text-accent-red font-bold text-lg">{formatAmount(stats?.expenses)}</Text>
              </View>
            </View>

            {/* Bar Chart */}
            <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: colors.card }}>
              <Text className="font-bold text-base mb-4" style={{ color: colors.text }}>Сүүлийн 6 үе</Text>
              <View className="flex-row items-end justify-between" style={{ height: 150 }}>
                {pData.map((p, i) => (
                  <View key={i} className="items-center flex-1 px-1">
                    <View className="flex-row items-end gap-1 mb-1">
                      <View className="w-3 rounded-t-sm bg-accent-green" style={{ height: Math.max((p.income / ceilMax) * 120, 4) }} />
                      <View className="w-3 rounded-t-sm" style={{ height: Math.max((p.expenses / ceilMax) * 120, 4), backgroundColor: "#FF6B35" }} />
                    </View>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{p.label}</Text>
                  </View>
                ))}
              </View>
              <View className="flex-row mt-3 gap-4">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-accent-green mr-1" />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Орлого</Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FF6B35", marginRight: 4 }} />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Зарлага</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* =================== DIAGRAM TAB =================== */
          <>
            {/* Period Tabs - pill style */}
            <View className="flex-row rounded-xl p-1 mb-4" style={{ backgroundColor: colors.card }}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  className={`flex-1 py-2 rounded-lg items-center ${period === p.value ? "bg-accent-green" : ""}`}
                  onPress={() => setPeriod(p.value)}
                >
                  <Text className={`font-medium text-xs ${period === p.value ? "text-dark-bg" : ""}`} style={period !== p.value ? { color: colors.textSecondary } : undefined}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ---- Line Chart ---- */}
            <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: colors.card }}>
              <Text className="text-center text-sm font-medium mb-4" style={{ color: colors.text }}>
                {new Date().getFullYear()} оны {new Date().getMonth() + 1} сарын {new Date().getDate()}
              </Text>

              {pData.length > 1 ? (
                <View style={{ flexDirection: "row", height: CHART_H + 30 }}>
                  {/* Y-axis */}
                  <View style={{ width: 50, height: CHART_H, justifyContent: "space-between" }}>
                    {ticks.map((v, i) => (
                      <Text key={i} style={{ fontSize: 10, color: colors.textMuted }}>{formatAxis(v)}</Text>
                    ))}
                  </View>

                  <View style={{ flex: 1 }}>
                    {/* Grid */}
                    <Svg width={CHART_W} height={CHART_H} style={{ position: "absolute" }}>
                      {ticks.map((_, i) => (
                        <Line key={i} x1={0} y1={(CHART_H / 5) * i} x2={CHART_W} y2={(CHART_H / 5) * i} stroke={colors.border} strokeWidth={0.5} />
                      ))}
                    </Svg>

                    {/* Curves with gradient fill */}
                    <Svg width={CHART_W} height={CHART_H}>
                      <Defs>
                        <LinearGradient id="incFill" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#00C853" stopOpacity="0.35" />
                          <Stop offset="1" stopColor="#00C853" stopOpacity="0" />
                        </LinearGradient>
                        <LinearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#FF6B35" stopOpacity="0.2" />
                          <Stop offset="1" stopColor="#FF6B35" stopOpacity="0" />
                        </LinearGradient>
                      </Defs>
                      {/* Income area fill */}
                      {incPts.length > 1 && (
                        <Path
                          d={`${smoothPath(incPts)} L ${incPts[incPts.length - 1].x} ${CHART_H} L ${incPts[0].x} ${CHART_H} Z`}
                          fill="url(#incFill)"
                        />
                      )}
                      {/* Expense area fill */}
                      {expPts.length > 1 && (
                        <Path
                          d={`${smoothPath(expPts)} L ${expPts[expPts.length - 1].x} ${CHART_H} L ${expPts[0].x} ${CHART_H} Z`}
                          fill="url(#expFill)"
                        />
                      )}
                      {/* Income line */}
                      {incPts.length > 1 && <Path d={smoothPath(incPts)} fill="none" stroke="#00C853" strokeWidth={2.5} />}
                      {/* Expense line */}
                      {expPts.length > 1 && <Path d={smoothPath(expPts)} fill="none" stroke="#FF6B35" strokeWidth={2.5} />}
                      {/* End dots */}
                      {incPts.length > 0 && <SvgCircle cx={incPts[incPts.length - 1].x} cy={incPts[incPts.length - 1].y} r={4} fill="#00C853" />}
                      {expPts.length > 0 && <SvgCircle cx={expPts[expPts.length - 1].x} cy={expPts[expPts.length - 1].y} r={4} fill="#FF6B35" />}
                    </Svg>

                    {/* X-axis */}
                    <View className="flex-row justify-between mt-2">
                      {pData.map((p, i) => (
                        <Text key={i} style={{ fontSize: 10, color: colors.textMuted }}>{p.label}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <View className="items-center py-10">
                  <Text className="text-sm" style={{ color: colors.textMuted }}>Өгөгдөл байхгүй</Text>
                </View>
              )}

              {/* Legend */}
              <View className="flex-row mt-3 gap-5">
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#00C853", marginRight: 6 }} />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Орлого</Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B35", marginRight: 6 }} />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Зарлага</Text>
                </View>
              </View>
            </View>

            {/* ---- Income Card ---- */}
            <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: colors.card }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,200,83,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Ionicons name="trending-up" size={18} color="#00C853" />
                  </View>
                  <Text className="font-semibold text-base" style={{ color: colors.text }}>Орлого</Text>
                </View>
                <Text className="font-bold text-base" style={{ color: colors.text }}>{formatAmount(totInc)}</Text>
              </View>
              <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" }}>
                <View style={{ height: 8, backgroundColor: "#00C853", borderRadius: 4, width: `${Math.min((totInc / totMax) * 100, 100)}%` }} />
              </View>
            </View>

            {/* ---- Expenses Card ---- */}
            <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: colors.card }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,107,53,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Ionicons name="trending-down" size={18} color="#FF6B35" />
                  </View>
                  <Text className="font-semibold text-base" style={{ color: colors.text }}>Зарлага</Text>
                </View>
                <Text className="font-bold text-base" style={{ color: colors.text }}>{formatAmount(totExp)}</Text>
              </View>
              <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" }}>
                <View style={{ height: 8, backgroundColor: "#FF6B35", borderRadius: 4, width: `${Math.min((totExp / totMax) * 100, 100)}%` }} />
              </View>
            </View>

            {/* ---- Bar Chart ---- */}
            <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: colors.card }}>
              <Text className="font-bold text-base mb-4" style={{ color: colors.text }}>Сүүлийн 6 үе</Text>

              <View style={{ flexDirection: "row", height: BAR_H + 25 }}>
                {/* Y-axis */}
                <View style={{ width: 50, height: BAR_H, justifyContent: "space-between" }}>
                  {barTicks.map((v, i) => (
                    <Text key={i} style={{ fontSize: 10, color: colors.textMuted }}>{formatAxis(v)}</Text>
                  ))}
                </View>

                {/* Bars */}
                <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end" }}>
                  {pData.map((p, i) => {
                    const iH = Math.max((p.income / barMax) * BAR_H, 4);
                    const eH = Math.max((p.expenses / barMax) * BAR_H, 4);
                    return (
                      <View key={i} style={{ flex: 1, alignItems: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, marginBottom: 4 }}>
                          <View style={{ width: 10, height: iH, backgroundColor: "#00C853", borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                          <View style={{ width: 10, height: eH, backgroundColor: "#FF6B35", borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                        </View>
                        <Text style={{ fontSize: 9, color: colors.textMuted }}>{p.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row mt-3 gap-5">
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#00C853", marginRight: 6 }} />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Орлого</Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B35", marginRight: 6 }} />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Зарлага</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
