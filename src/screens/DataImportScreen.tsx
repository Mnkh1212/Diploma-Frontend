import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
let DocumentPicker: any = null;
try {
  DocumentPicker = require("expo-document-picker");
} catch {}
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { analyzeStatement, deleteAnalysis, getAnalysis, listAnalyses } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AIAnalysisResponse, ParsedTransaction, RootStackParamList } from "../types";

// DataImportScreen-ийг хоёр газар (Stack route + Advisor tab) дамжуулж ашиглана.
// Tab дотор embed хийсэн үед header болон back button нь хэрэггүй учир
// embedded prop-оор toggle хийнэ.
type StackProps = NativeStackScreenProps<RootStackParamList, "DataImport">;
type Props = Partial<Pick<StackProps, "navigation">> & { embedded?: boolean };

const SUPPORTED_BANKS = [
  { name: "Хаан банк", color: "#0066B3" },
  { name: "Голомт банк", color: "#E30613" },
  { name: "Худалдаа хөгжлийн банк", color: "#00457C" },
  { name: "Хас банк", color: "#006837" },
  { name: "Төрийн банк", color: "#C8102E" },
];

const PIE_COLORS = ["#00C853", "#FF6B35", "#448AFF", "#7C4DFF", "#FFD600", "#E056A0", "#4ECDC4", "#F39C12"];

// Parser-ээс хэт том буруу тоо ирж магадгүй (account number-ыг amount гэж сольсон гэх мэт).
// 1 их наяд (1 trillion) дээш дүнг "хог" гэж үзэн шүүнэ.
const SANITY_MAX = 1_000_000_000_000;

const formatDate = (raw: string) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("mn-MN");
};

export default function DataImportScreen({ navigation, embedded = false }: Props) {
  const { isDark, colors } = useTheme();
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<AIAnalysisResponse | null>(null);
  const [history, setHistory] = useState<AIAnalysisResponse[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await listAnalyses();
      setHistory(data);
      if (!active && data[0]) setActive(data[0]);
    } catch {}
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Хэт том дүнтэй (parser алдаатай) гүйлгээг шүүж, sanitized analysis буцаана
  const cleanedActive = useMemo(() => {
    if (!active) return null;
    const filtered = (active.transactions || []).filter(
      (t) => Math.abs(t.amount) < SANITY_MAX
    );
    const cleanIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const cleanExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    // Категори дахин тооцох
    const catMap = new Map<string, { amount: number; count: number }>();
    filtered.filter((t) => t.type === "expense").forEach((t) => {
      const key = t.category || "Бусад";
      const cur = catMap.get(key) || { amount: 0, count: 0 };
      catMap.set(key, { amount: cur.amount + t.amount, count: cur.count + 1 });
    });
    const totalExp = Array.from(catMap.values()).reduce((s, c) => s + c.amount, 0);
    const categories = Array.from(catMap.entries())
      .map(([category, v]) => ({
        category,
        amount: v.amount,
        count: v.count,
        percentage: totalExp > 0 ? (v.amount / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const skipped = (active.transactions || []).length - filtered.length;

    return {
      ...active,
      transactions: filtered,
      total_income: cleanIncome,
      total_expenses: cleanExpense,
      net_cashflow: cleanIncome - cleanExpense,
      transaction_count: filtered.length,
      categories,
      _skippedCount: skipped,
    } as AIAnalysisResponse & { _skippedCount: number };
  }, [active]);

  const handlePickFile = async () => {
    if (!DocumentPicker) {
      Alert.alert(
        "Native rebuild шаардлагатай",
        "Файл сонгох боломжгүй. Terminal дээр 'npx expo run:ios --device' ажиллуулна уу."
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
        ],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const file = res.assets[0];
      setLoading(true);
      const formData = new FormData();
      formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType || "application/octet-stream" } as any);
      const { data } = await analyzeStatement(formData);
      setActive(data);
      await loadHistory();
    } catch (error: any) {
      Alert.alert("Алдаа", error?.response?.data?.error || "Файл оруулахад алдаа гарлаа");
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
    Alert.alert("Анализыг устгах уу?", "Анализын мэдээлэл устах болно.", [
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
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header — embedded үед AdvisorScreen-ийн header ашиглагдах учир нуугдана */}
        {!embedded && (
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, marginBottom: 20 }}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 22, flex: 1 }}>AI Шинжилгээ</Text>
            {cleanedActive && (
              <TouchableOpacity onPress={handlePickFile} disabled={loading} style={{ padding: 6 }}>
                <Ionicons name="add-circle" size={32} color="#00C853" />
              </TouchableOpacity>
            )}
          </View>
        )}
        {embedded && cleanedActive && (
          <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 8, marginBottom: 12 }}>
            <TouchableOpacity onPress={handlePickFile} disabled={loading} style={{ padding: 6 }}>
              <Ionicons name="add-circle" size={32} color="#00C853" />
            </TouchableOpacity>
          </View>
        )}

        {/* History strip */}
        {history.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600", paddingHorizontal: 20, marginBottom: 8 }}>
              ӨМНӨХ АНАЛИЗУУД ({history.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {history.map((h) => {
                const isSel = active?.id === h.id;
                return (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => selectAnalysis(h.id)}
                    onLongPress={() => removeAnalysis(h.id)}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      padding: 12,
                      minWidth: 200,
                      borderWidth: 2,
                      borderColor: isSel ? "#00C853" : "transparent",
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }} numberOfLines={1}>
                      {h.bank_name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }} numberOfLines={1}>
                      {h.filename}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                      {formatDate(h.created_at)} · {h.transaction_count} гүйлгээ
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* No active analysis — info + upload */}
        {!cleanedActive && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16, marginBottom: 8 }}>📄 Банкны хуулга оруулах</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                Банкнаас татсан хуулгаа PDF, Excel эсвэл CSV форматаар оруулмагц AI-аар балансыг тооцоолж, зарлагын ангилал, чарт, зөвлөмж бүгдийг гаргана.
              </Text>
            </View>

            <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, marginBottom: 12 }}>Дэмжигдсэн банкнууд</Text>
              {SUPPORTED_BANKS.map((b, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: b.color, marginRight: 12 }} />
                  <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{b.name}</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#00C853" />
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handlePickFile}
              disabled={loading}
              style={{
                backgroundColor: "#00C853",
                paddingVertical: 18,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#0D0D0D" style={{ marginRight: 10 }} />
                  <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>AI шинжилж байна...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={22} color="#0D0D0D" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>Файл сонгох</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Active analysis */}
        {cleanedActive && (
          <View style={{ paddingHorizontal: 20 }}>
            {/* Warning if some transactions filtered */}
            {cleanedActive._skippedCount > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,193,7,0.12)",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: "#FFC107",
                }}
              >
                <Ionicons name="warning" size={18} color="#FFC107" style={{ marginRight: 8 }} />
                <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>
                  {cleanedActive._skippedCount} гүйлгээний дүн хэт том учраас шүүгдэв (parser-ын алдаа).
                </Text>
              </View>
            )}

            {/* Bank + period summary */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#00C853", fontWeight: "700", fontSize: 14 }}>{cleanedActive.bank_name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                  {cleanedActive.filename}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  {cleanedActive.period_start} — {cleanedActive.period_end} · {cleanedActive.transaction_count} гүйлгээ
                </Text>
              </View>
            </View>

            {/* Hero balance */}
            <View
              style={{
                backgroundColor: "#00C853",
                borderRadius: 18,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#0D0D0D", fontSize: 12, fontWeight: "600", opacity: 0.7 }}>ЭЦСИЙН ҮЛДЭГДЭЛ</Text>
              <Text style={{ color: "#0D0D0D", fontWeight: "800", fontSize: 28, marginTop: 4 }}>
                {formatAmount(cleanedActive.closing_balance)}
              </Text>
              <Text style={{ color: "#0D0D0D", fontSize: 11, opacity: 0.7, marginTop: 6 }}>
                Эхний үлдэгдэл: {formatAmount(cleanedActive.opening_balance)}
              </Text>
            </View>

            {/* Income / Expense / Net */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14 }}>
                <Ionicons name="arrow-down-circle" size={20} color="#00C853" />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>Орлого</Text>
                <Text style={{ color: "#00C853", fontWeight: "700", fontSize: 14, marginTop: 4 }} numberOfLines={1}>
                  {formatAmount(cleanedActive.total_income)}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14 }}>
                <Ionicons name="arrow-up-circle" size={20} color="#FF6B35" />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>Зарлага</Text>
                <Text style={{ color: "#FF6B35", fontWeight: "700", fontSize: 14, marginTop: 4 }} numberOfLines={1}>
                  {formatAmount(cleanedActive.total_expenses)}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14 }}>
                <Ionicons
                  name={cleanedActive.net_cashflow >= 0 ? "trending-up" : "trending-down"}
                  size={20}
                  color={cleanedActive.net_cashflow >= 0 ? "#00C853" : "#FF4444"}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>Цэвэр</Text>
                <Text
                  style={{
                    color: cleanedActive.net_cashflow >= 0 ? "#00C853" : "#FF4444",
                    fontWeight: "700",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                  numberOfLines={1}
                >
                  {formatAmount(Math.abs(cleanedActive.net_cashflow))}
                </Text>
              </View>
            </View>

            {/* Income vs Expense bar */}
            {(cleanedActive.total_income > 0 || cleanedActive.total_expenses > 0) && (
              <ComparisonBar
                income={cleanedActive.total_income}
                expense={cleanedActive.total_expenses}
                colors={colors}
                formatAmount={formatAmount}
              />
            )}

            {/* Categories */}
            {cleanedActive.categories.length > 0 && (
              <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 14 }}>
                  Зарлагын ангилал
                </Text>
                {cleanedActive.categories.slice(0, 6).map((c, i) => (
                  <View key={i} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                            marginRight: 8,
                          }}
                        />
                        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>{c.category}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 6 }}>· {c.count}</Text>
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>
                        {formatAmount(c.amount)}
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                      <View
                        style={{
                          width: `${Math.max(c.percentage, 2)}%`,
                          height: "100%",
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
                      {c.percentage.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Recommendations */}
            {(cleanedActive.ai_summary || cleanedActive.recommendations?.length > 0) && (
              <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <Ionicons name="sparkles" size={18} color="#00C853" style={{ marginRight: 8 }} />
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>AI зөвлөмж</Text>
                </View>
                {cleanedActive.ai_summary ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
                    {cleanedActive.ai_summary}
                  </Text>
                ) : null}
                {(cleanedActive.recommendations || []).map((r, i) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 8 }}>
                    <Text style={{ color: "#00C853", marginRight: 8, fontWeight: "700" }}>{i + 1}.</Text>
                    <Text style={{ color: colors.text, fontSize: 13, lineHeight: 20, flex: 1 }}>{r}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Transactions */}
            {cleanedActive.transactions.length > 0 && (
              <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 12 }}>
                  Гүйлгээний жагсаалт
                </Text>
                {cleanedActive.transactions.slice(0, 50).map((t, i) => (
                  <TxRow key={i} tx={t} isLast={i === Math.min(49, cleanedActive.transactions.length - 1)} colors={colors} formatAmount={formatAmount} />
                ))}
                {cleanedActive.transactions.length > 50 && (
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 10, textAlign: "center" }}>
                    Эхний 50 гүйлгээг харуулсан · нийт {cleanedActive.transaction_count}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ComparisonBar({
  income,
  expense,
  colors,
  formatAmount,
}: {
  income: number;
  expense: number;
  colors: any;
  formatAmount: (n?: number) => string;
}) {
  const total = income + expense;
  const incPct = total > 0 ? (income / total) * 100 : 50;
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 14 }}>Орлого vs Зарлага</Text>
      <View style={{ height: 40, flexDirection: "row", borderRadius: 10, overflow: "hidden" }}>
        <View style={{ width: `${incPct}%`, backgroundColor: "#00C853", justifyContent: "center", alignItems: "center" }}>
          {incPct > 15 && (
            <Text style={{ color: "#0D0D0D", fontSize: 11, fontWeight: "700" }}>{incPct.toFixed(0)}%</Text>
          )}
        </View>
        <View style={{ width: `${100 - incPct}%`, backgroundColor: "#FF6B35", justifyContent: "center", alignItems: "center" }}>
          {100 - incPct > 15 && (
            <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>{(100 - incPct).toFixed(0)}%</Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <Text style={{ color: "#00C853", fontSize: 12, fontWeight: "600" }}>↓ {formatAmount(income)}</Text>
        <Text style={{ color: "#FF6B35", fontSize: 12, fontWeight: "600" }}>↑ {formatAmount(expense)}</Text>
      </View>
    </View>
  );
}

function TxRow({
  tx,
  isLast,
  colors,
  formatAmount,
}: {
  tx: ParsedTransaction;
  isLast: boolean;
  colors: any;
  formatAmount: (n?: number) => string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }} numberOfLines={1}>
          {tx.description || "—"}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 3 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{tx.category || "Бусад"}</Text>
          {tx.date && <Text style={{ color: colors.textMuted, fontSize: 11 }}> · {tx.date}</Text>}
        </View>
      </View>
      <Text
        style={{
          color: tx.type === "income" ? "#00C853" : "#FF6B35",
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {tx.type === "income" ? "+" : "-"}{formatAmount(tx.amount)}
      </Text>
    </View>
  );
}
