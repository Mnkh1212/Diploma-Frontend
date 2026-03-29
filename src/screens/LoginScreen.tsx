import React, { useState, useEffect } from "react";
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
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
import { useTheme } from "../context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const { login, hasSavedCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAndAutoLogin();
  }, []);

  const checkBiometricAndAutoLogin = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricEnabled = await AsyncStorage.getItem("biometric_enabled");
    const canUseBiometric = compatible && enrolled && biometricEnabled === "true";
    setBiometricAvailable(canUseBiometric);

    if (canUseBiometric) {
      const savedEmail = await AsyncStorage.getItem("saved_email");
      if (savedEmail) handleBiometricLogin();
    }
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Нэвтрэхийн тулд Face ID ашиглана уу",
      fallbackLabel: "Нууц үг ашиглах",
    });
    if (result.success) {
      const savedEmail = await AsyncStorage.getItem("saved_email");
      const savedPassword = await AsyncStorage.getItem("saved_password");
      if (savedEmail && savedPassword) {
        setLoading(true);
        try {
          await login(savedEmail, savedPassword);
        } catch {
          Alert.alert("Алдаа", "Хадгалсан мэдээлэл хүчингүй болсон.");
          await AsyncStorage.removeItem("saved_email");
          await AsyncStorage.removeItem("saved_password");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Алдаа", "Бүх талбарыг бөглөнө үү");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // "Намайг сана" ассан бол credentials хадгалж Face ID идэвхжүүлнэ
      if (rememberMe) {
        await AsyncStorage.setItem("biometric_enabled", "true");
        await AsyncStorage.setItem("saved_email", email);
        await AsyncStorage.setItem("saved_password", password);
      }
    } catch (error: any) {
      Alert.alert("Алдаа", error?.response?.data?.error || "Нэвтрэх амжилтгүй боллоо");
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Logo */}
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
          <Text style={{ color: "#00C853" }}>✦ </Text>fintrack
        </Text>

        {/* Title */}
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 32 }}>
          Тавтай морил!
        </Text>

        {/* Email */}
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>И-мэйл</Text>
        <TextInput
          style={{
            backgroundColor: colors.card, color: colors.text, borderRadius: 12,
            paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
            borderWidth: 1, borderColor: colors.border, marginBottom: 16,
          }}
          placeholder="И-мэйл хаягаа оруулна уу"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Нууц үг</Text>
        </View>
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: colors.card, borderRadius: 12,
          borderWidth: 1, borderColor: colors.border, marginBottom: 12,
        }}>
          <TextInput
            style={{
              flex: 1, color: colors.text,
              paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
            }}
            placeholder="Нууц үгээ оруулна уу"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingRight: 14 }}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Remember Me + Forgot */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={{
              width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
              borderColor: rememberMe ? "#00C853" : colors.textMuted,
              backgroundColor: rememberMe ? "#00C853" : "transparent",
              alignItems: "center", justifyContent: "center", marginRight: 8,
            }}>
              {rememberMe && <Ionicons name="checkmark" size={12} color="#0D0D0D" />}
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Намайг сана</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{ color: "#00C853", fontSize: 12, fontWeight: "600" }}>Нууц үг мартсан?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign in Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853", paddingVertical: 16,
            borderRadius: 16, alignItems: "center", marginBottom: 16,
          }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D0D" />
          ) : (
            <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>Нэвтрэх</Text>
          )}
        </TouchableOpacity>

        {/* Face ID */}
        {biometricAvailable && hasSavedCredentials && (
          <TouchableOpacity
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "center",
              backgroundColor: colors.card, paddingVertical: 14, borderRadius: 16,
              marginBottom: 16, borderWidth: 1, borderColor: colors.border,
            }}
            onPress={handleBiometricLogin}
          >
            <Ionicons name="finger-print-outline" size={22} color="#00C853" style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>Face ID-аар нэвтрэх</Text>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textMuted, fontSize: 12, marginHorizontal: 12 }}>эсвэл</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Social Buttons */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 28 }}>
          {[
            { icon: "logo-facebook", color: "#1877F2" },
            { icon: "logo-google", color: "#EA4335" },
            { icon: "logo-linkedin", color: "#0A66C2" },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
                alignItems: "center", justifyContent: "center",
              }}
              onPress={() => Alert.alert("Тун удахгүй", "Нийгмийн сүлжээгээр нэвтрэх боломж удахгүй нэмэгдэнэ")}
            >
              <Ionicons name={s.icon as any} size={24} color={s.color} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Register Link */}
        <TouchableOpacity
          style={{ alignItems: "center", marginBottom: 32 }}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            эсвэл <Text style={{ color: "#00C853", fontWeight: "700" }}>Бүртгүүлэх</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
