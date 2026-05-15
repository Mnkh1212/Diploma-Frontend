import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../context/ThemeContext";
import { resetPassword } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !newPassword) {
      Alert.alert("Алдаа", "Имэйл болон шинэ нууц үгээ оруулна уу");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Алдаа", "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Алдаа", "Нууц үг таарахгүй байна");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email: trimmedEmail, new_password: newPassword });
      Alert.alert(
        "Амжилттай",
        "Нууц үг шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.",
        [{ text: "OK", onPress: () => navigation.replace("Login") }],
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || "Нууц үг шинэчилж чадсангүй. Дахин оролдоно уу.";
      Alert.alert("Алдаа", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
            Нууц үг сэргээх
          </Text>
        </View>

        {/* Hero */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "rgba(0,200,83,0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="lock-open-outline" size={36} color="#00C853" />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Шинэ нууц үг тавих
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              lineHeight: 20,
              textAlign: "center",
              paddingHorizontal: 12,
            }}
          >
            Имэйлээ оруулж шинэ нууц үг тавиарай.
          </Text>
        </View>

        {/* Email */}
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 }}>
          ИМЭЙЛ
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={{ flex: 1, color: colors.text, fontSize: 15, marginLeft: 10, padding: 0 }}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* New Password */}
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 }}>
          ШИНЭ НУУЦ ҮГ
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={{ flex: 1, color: colors.text, fontSize: 15, marginLeft: 10, padding: 0 }}
            placeholder="6+ тэмдэгт"
            placeholderTextColor={colors.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 }}>
          НУУЦ ҮГ ДАВТАХ
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor:
              confirmPassword && confirmPassword !== newPassword ? "#FF4444" : colors.border,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 24,
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={{ flex: 1, color: colors.text, fontSize: 15, marginLeft: 10, padding: 0 }}
            placeholder="Дахин оруулна уу"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "#00C853",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#00C853",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 4,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Нууц үг шинэчлэх
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ alignItems: "center", marginTop: 16 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Буцах
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
