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
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
import { useTheme } from "../context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    return digits.slice(0, 4) + " " + digits.slice(4, 8);
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    setPhone(digits);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Алдаа", "Нэр, имэйл, нууц үг шаардлагатай");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Алдаа", "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error: any) {
      Alert.alert("Алдаа", error?.response?.data?.error || "Бүртгэл амжилтгүй боллоо");
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
          Бүртгүүлэх!
        </Text>

        {/* Full Name */}
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>
          Бүтэн нэр<Text style={{ color: "#FF4444" }}>*</Text>
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.card, color: colors.text, borderRadius: 12,
            paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
            borderWidth: 1, borderColor: colors.border, marginBottom: 16,
          }}
          placeholder="Бүтэн нэрээ оруулна уу"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

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
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Нууц үг</Text>
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: colors.card, borderRadius: 12,
          borderWidth: 1, borderColor: colors.border, marginBottom: 16,
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

        {/* Phone Number */}
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>Утасны дугаар</Text>
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: colors.card, borderRadius: 12,
          borderWidth: 1, borderColor: colors.border, marginBottom: 28,
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

        {/* Register Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853", paddingVertical: 16,
            borderRadius: 16, alignItems: "center", marginBottom: 16,
          }}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D0D" />
          ) : (
            <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>Бүртгүүлэх</Text>
          )}
        </TouchableOpacity>

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
              onPress={() => Alert.alert("Тун удахгүй", "Нийгмийн сүлжээгээр бүртгүүлэх боломж удахгүй нэмэгдэнэ")}
            >
              <Ionicons name={s.icon as any} size={24} color={s.color} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Login Link */}
        <TouchableOpacity
          style={{ alignItems: "center", marginBottom: 32 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Бүртгэлтэй юу? <Text style={{ color: "#00C853", fontWeight: "700" }}>Нэвтрэх</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
