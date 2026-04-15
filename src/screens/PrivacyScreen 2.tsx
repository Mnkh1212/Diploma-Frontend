import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updateProfile, changePassword } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

export default function PrivacyScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const { isDark, colors } = useTheme();

  // Phone
  const [phone, setPhone] = useState(user?.phone || "");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Biometric
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
    const stored = await AsyncStorage.getItem("biometric_enabled");
    setBiometricEnabled(stored === "true");
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Биометрик нэвтрэлтийг идэвхжүүлэх",
        fallbackLabel: "Нууц үг ашиглах",
      });
      if (result.success) {
        setBiometricEnabled(true);
        await AsyncStorage.setItem("biometric_enabled", "true");
        Alert.alert(
          "Face ID нэвтрэлт",
          "Дараагийн нэвтрэх үед нэр нууц үг хадгалагдаж, Face ID-аар нэвтрэх боломжтой болно."
        );
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem("biometric_enabled", "false");
      // Clear saved credentials
      await AsyncStorage.removeItem("saved_email");
      await AsyncStorage.removeItem("saved_password");
    }
  };

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    return digits.slice(0, 4) + " " + digits.slice(4, 8);
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    setPhone(digits);
  };

  const handleSavePhone = async () => {
    setPhoneLoading(true);
    try {
      const { data } = await updateProfile({ phone });
      setUser(data);
      Alert.alert("Амжилттай", "Утасны дугаар хадгалагдлаа");
    } catch {
      Alert.alert("Алдаа", "Утасны дугаар хадгалж чадсангүй");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Алдаа", "Бүх талбарыг бөглөнө үү");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Алдаа", "Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Алдаа", "Шинэ нууц үг таарахгүй байна");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      Alert.alert("Амжилттай", "Нууц үг амжилттай солигдлоо");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Нууц үг солиход алдаа гарлаа";
      Alert.alert("Алдаа", msg);
    } finally {
      setPasswordLoading(false);
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
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>Нууцлал</Text>
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>Утасны дугаар</Text>
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: colors.card, borderRadius: 12,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 14,
              borderRightWidth: 1, borderRightColor: colors.border,
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: "600" }}>+976</Text>
            </View>
            <TextInput
              style={{
                flex: 1, color: colors.text,
                paddingHorizontal: 14, paddingVertical: 14, fontSize: 15,
              }}
              placeholder="8888 8888"
              placeholderTextColor={colors.textMuted}
              value={formatPhone(phone)}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#00C853", paddingVertical: 10, borderRadius: 10,
              alignItems: "center", marginTop: 12,
            }}
            onPress={handleSavePhone}
            disabled={phoneLoading}
          >
            {phoneLoading ? (
              <ActivityIndicator color="#0D0D0D" />
            ) : (
              <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 14 }}>Хадгалах</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 20 }} />

        {/* Password Change */}
        <TouchableOpacity
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12,
          }}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="lock-closed-outline" size={20} color="#00C853" style={{ marginRight: 12 }} />
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>Нууц үг солих</Text>
          </View>
          <Ionicons name={showPasswordSection ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={{
            backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12,
          }}>
            <TextInput
              style={{
                backgroundColor: colors.bg, color: colors.text, borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
                borderWidth: 1, borderColor: colors.border, marginBottom: 12,
              }}
              placeholder="Хуучин нууц үг"
              placeholderTextColor={colors.textMuted}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <TextInput
              style={{
                backgroundColor: colors.bg, color: colors.text, borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
                borderWidth: 1, borderColor: colors.border, marginBottom: 12,
              }}
              placeholder="Шинэ нууц үг (6+ тэмдэгт)"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={{
                backgroundColor: colors.bg, color: colors.text, borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
                borderWidth: 1, borderColor: colors.border, marginBottom: 16,
              }}
              placeholder="Шинэ нууц үг давтах"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#00C853", paddingVertical: 12, borderRadius: 10, alignItems: "center",
              }}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator color="#0D0D0D" />
              ) : (
                <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 15 }}>Нууц үг солих</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Biometric */}
        {biometricAvailable && (
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="finger-print-outline" size={20} color="#00C853" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>Face ID / Touch ID</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Биометрик нэвтрэлт</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: colors.border, true: "#00C853" }}
              thumbColor="#fff"
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
