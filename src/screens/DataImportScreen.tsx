import React, { useState } from "react";
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
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../context/ThemeContext";
import { importStatement } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "DataImport">;

export default function DataImportScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ filename: string; analysis: string } | null>(null);

  const handlePickFile = async () => {
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
      setResult(null);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);

      const { data } = await importStatement(formData);
      setResult({ filename: data.filename, analysis: data.analysis });
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Файл оруулахад алдаа гарлаа";
      Alert.alert("Алдаа", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 56 }} keyboardDismissMode="on-drag">
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>Өгөгдөл импортлох</Text>
        </View>

        {/* Info */}
        <View style={{
          backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16, marginBottom: 8 }}>
            📄 Банкны хуулга оруулах
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Гүйлгээний хуулгаа PDF, Excel, CSV формат-аар оруулж AI-аар шинжилгээ хийнэ.
          </Text>
          <View style={{ marginTop: 12 }}>
            {["Хаан банк", "Голомт банк", "ХХБ", "Төрийн банк"].map((bank, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color="#00C853" />
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 8 }}>{bank}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Supported formats */}
        <View style={{
          flexDirection: "row", gap: 8, marginBottom: 20,
        }}>
          {[
            { ext: "PDF", icon: "document-text", color: "#FF4444" },
            { ext: "Excel", icon: "grid", color: "#00C853" },
            { ext: "CSV", icon: "list", color: "#448AFF" },
          ].map((f, i) => (
            <View key={i} style={{
              flex: 1, backgroundColor: colors.card, borderRadius: 12,
              padding: 12, alignItems: "center",
            }}>
              <Ionicons name={f.icon as any} size={24} color={f.color} />
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600", marginTop: 4 }}>{f.ext}</Text>
            </View>
          ))}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853", paddingVertical: 16, borderRadius: 16,
            alignItems: "center", flexDirection: "row", justifyContent: "center",
            marginBottom: 24,
          }}
          onPress={handlePickFile}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#0D0D0D" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>AI шинжилж байна...</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={22} color="#0D0D0D" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>Файл сонгох</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Analysis Result */}
        {result && (
          <View style={{
            backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 32,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Ionicons name="analytics" size={20} color="#00C853" style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>AI Шинжилгээ</Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 12 }}>
              📎 {result.filename}
            </Text>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>
              {result.analysis}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
