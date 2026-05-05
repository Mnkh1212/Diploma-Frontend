import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { BarChart, PieChart } from "react-native-chart-kit";
let DocumentPicker: any = null;
try {
  DocumentPicker = require("expo-document-picker");
} catch {}
import { useTheme } from "../context/ThemeContext";
import { analyzeStatement, deleteAnalysis, getAnalysis, listAnalyses } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AIAnalysisResponse, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "DataImport">;

const SUPPORTED_BANKS = [
  { name: "Хаан банк", color: "#0066B3" },
  { name: "Голомт банк", color: "#E30613" },
  { name: "Худалдаа хөгжлийн банк", color: "#00457C" },
  { name: "Хас банк", color: "#006837" },
  { name: "Төрийн банк", color: "#C8102E" },
];

const PIE_COLORS = [
  "#00C853",
  "#FF6B35",
  "#448AFF",
  "#7C4DFF",
  "#FFD600",
  "#E056A0",
  "#4ECDC4",
  "#F39C12",
];

const formatMNT = (n: number) =>
  `${Math.round(n).toLocaleString("mn-MN")}₮`;

const formatDate = (raw: string) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("mn-MN");
};

export default function DataImportScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<AIAnalysisResponse | null>(null);
  const [history, setHistory] = useState<AIAnalysisResponse[]>([]);
  const screenWidth = Dimensions.get("window").width;

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await listAnalyses();
      setHistory(data);
      if (!active && data[0]) {
        setActive(data[0]);
      }
    } catch (err) {
      // history fail — silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handlePickFile = async () => {
    if (!DocumentPicker) {
      Alert.alert(
        "Native rebuild шаардлагатай",
        "Файл сонгох боломжгүй. Terminal дээр 'npx expo run:ios --device' ажиллуулж native module суулгана уу."
      );
      return;
    }
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "text/comma-separated-values",
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets?.[0]) return;

      const file = res.assets[0];
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);

      const { data } = await analyzeStatement(formData);
      setActive(data);
      await loadHistory();
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Файл оруулахад алдаа гарлаа";
      Alert.alert("Алдаа", msg);
    } finally {
      setLoading(false);
    }
  };

  const selectAnalysis = async (id: number) => {
    try {
      const { data } = await getAnalysis(id);
      setActive(data);
    } catch {}
  };

  const removeAnalysis = (id: number) => {
    Alert.alert(
      "Анализыг устгах уу?",
      "Анализын мэдээлэл устах болно. Импортлогдсон гүйлгээнүүд хэвээр үлдэнэ.",
      [
        { text: "Үгүй", style: "cancel" },
        {
          text: "Устгах",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnalysis(id);
              if (active?.id === id) setActive(null);
              await loadHistory();
            } catch {
              Alert.alert("Алдаа", "Устгаж чадсангүй");
            }
          },
        },
      ]
    );
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
    labelColor: () => colors.text,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: { fontSize: 11 },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 56 }}
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20, flex: 1 }}>
            AI шинжилгээ
          </Text>
        </View>

        {/* Info Card */}
        {!active && (
          <>
            <View style={{
              backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16,
            }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16, marginBottom: 8 }}>
                📄 Банкны хуулга оруулах
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                Банкнаас татсан хуулгаа PDF, Excel, CSV форматаар оруулмагц AI-аар балансыг тооцоолж,
                зарлагын ангилал, чарт, зөвлөмж бүгдийг гаргана.
              </Text>
            </View>

            <View style={{
              backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16,
            }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 12 }}>
                Дэмжигдсэн банкнууд
              </Text>
              {SUPPORTED_BANKS.map((bank, i) => (
                <View
                  key={i}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                >
                  <View style={{
                    width: 10, height: 10, borderRadius: 5, backgroundColor: bank.color, marginRight: 12,
                  }} />
                  <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{bank.name}</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#00C853" />
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {[
                { ext: "PDF", icon: "document-text", color: "#FF4444" },
                { ext: "Excel", icon: "grid", color: "#00C853" },
                { ext: "CSV", icon: "list", color: "#448AFF" },
              ].map((f, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1, backgroundColor: colors.card, borderRadius: 12,
                    padding: 12, alignItems: "center",
                  }}
                >
                  <Ionicons name={f.icon as any} size={24} color={f.color} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                    {f.ext}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853", paddingVertical: 16, borderRadius: 16,
            alignItems: "center", flexDirection: "row", justifyContent: "center",
            marginBottom: 20,
          }}
          onPress={handlePickFile}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#0D0D0D" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>
                AI шинжилж байна...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color="#0D0D0D"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>
                {active ? "Шинэ хуулга оруулах" : "Файл сонгох"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* History */}
        {history.length > 0 && (
          <View style={{
            backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16,
          }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 8 }}>
              Өмнөх анализууд ({history.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {history.map((h) => {
                const isActive = active?.id === h.id;
                return (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => selectAnalysis(h.id)}
                    onLongPress={() => removeAnalysis(h.id)}
                    style={{
                      backgroundColor: isActive ? "#00C85333" : colors.surface,
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 8,
                      borderWidth: isActive ? 1 : 0,
                      borderColor: "#00C853",
                      minWidth: 160,
                    }}
                  >
                    <Text
                      style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}
                      numberOfLines={1}
                    >
                      {h.filename}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
                      {h.bank_name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                      {formatDate(h.created_at)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6 }}>
              💡 Удаан дарвал устгана.
            </Text>
          </View>
        )}

        {/* Active Analysis */}
        {active && (
          <>
            {/* File / period info */}
            <View style={{
              backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Файл</Text>
                  <Text
                    style={{ color: colors.text, fontWeight: "600", fontSize: 13, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {active.filename}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{active.bank_name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                    {active.period_start} — {active.period_end}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>
                    {active.transaction_count} гүйлгээ
                  </Text>
                </View>
              </View>
            </View>

            {/* Stat cards: 2x2 */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <StatCard label="Эцсийн үлдэгдэл" value={formatMNT(active.closing_balance)} color="#00C853" colors={colors} />
              <StatCard label="Цэвэр өсөлт" value={formatMNT(active.net_cashflow)} color={active.net_cashflow >= 0 ? "#00C853" : "#FF4444"} colors={colors} />
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <StatCard label="Орлого" value={formatMNT(active.total_income)} color="#448AFF" colors={colors} />
              <StatCard label="Зарлага" value={formatMNT(active.total_expenses)} color="#FF6B35" colors={colors} />
            </View>

            {/* Income vs Expense bar chart */}
            <View style={{
              backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16,
            }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 12 }}>
                Орлого vs Зарлага
              </Text>
              <BarChart
                data={{
                  labels: ["Орлого", "Зарлага"],
                  datasets: [{ data: [active.total_income, active.total_expenses] }],
                }}
                width={screenWidth - 72}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
                }}
                yAxisLabel=""
                yAxisSuffix="₮"
                fromZero
                showBarTops={false}
                style={{ marginLeft: -10 }}
              />
            </View>

            {/* Category pie chart */}
            {active.categories.length > 0 && (
              <View style={{
                backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16,
              }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 12 }}>
                  Зарлагын ангилал
                </Text>
                <PieChart
                  data={active.categories.slice(0, 6).map((c, i) => ({
                    name: c.category,
                    population: c.amount,
                    color: PIE_COLORS[i % PIE_COLORS.length],
                    legendFontColor: colors.text,
                    legendFontSize: 11,
                  }))}
                  width={screenWidth - 72}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="8"
                  absolute={false}
                />
              </View>
            )}

            {/* AI Recommendations */}
            <View style={{
              backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="sparkles" size={18} color="#00C853" style={{ marginRight: 8 }} />
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
                  AI зөвлөмж
                </Text>
              </View>
              {active.ai_summary ? (
                <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 10 }}>
                  {active.ai_summary}
                </Text>
              ) : null}
              {active.recommendations.map((r, i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 8 }}>
                  <Text style={{ color: "#00C853", marginRight: 6 }}>•</Text>
                  <Text style={{ color: colors.text, fontSize: 13, lineHeight: 20, flex: 1 }}>
                    {r}
                  </Text>
                </View>
              ))}
            </View>

            {/* Transactions list (top 50 шиг) */}
            <View style={{
              backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 32,
            }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 12 }}>
                Гүйлгээний жагсаалт
              </Text>
              {active.transactions.slice(0, 50).map((t, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: i < Math.min(49, active.transactions.length - 1) ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={{ color: colors.text, fontSize: 13 }}
                      numberOfLines={1}
                    >
                      {t.description || "—"}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                      {t.category} · {t.date}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: t.type === "income" ? "#00C853" : "#FF6B35",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatMNT(t.amount)}
                  </Text>
                </View>
              ))}
              {active.transactions.length > 50 && (
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 8, textAlign: "center" }}>
                  Эхний 50 гүйлгээг харуулсан · нийт {active.transaction_count}
                </Text>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  colors: any;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{label}</Text>
      <Text style={{ color, fontWeight: "700", fontSize: 16, marginTop: 4 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
