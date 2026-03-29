import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updateProfile, uploadAvatar } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

const API_BASE = "http://192.168.1.130:8080";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currency, setCurrency] = useState(user?.currency || "MNT");
  const [loading, setLoading] = useState(false);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Алдаа", "Зургийн сан руу хандах зөвшөөрөл шаардлагатай");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("avatar", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);
      try {
        const { data } = await uploadAvatar(formData);
        setUser(data);
        Alert.alert("Амжилттай", "Профайл зураг шинэчлэгдлээ");
      } catch {
        Alert.alert("Алдаа", "Зураг оруулж чадсангүй");
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Алдаа", "Нэр болон имэйл шаардлагатай");
      return;
    }
    setLoading(true);
    try {
      const { data } = await updateProfile({ name, email, currency });
      setUser(data);
      Alert.alert("Амжилттай", "Профайл амжилттай шинэчлэгдлээ");
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Профайл шинэчлэж чадсангүй";
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
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>Профайл засах</Text>
        </View>

        {/* Avatar */}
        <TouchableOpacity style={{ alignItems: "center", marginBottom: 32 }} onPress={handlePickAvatar}>
          {user?.avatar && user.avatar.length > 1 ? (
            <Image
              source={{
                uri: user.avatar.startsWith("http") ? user.avatar : API_BASE + user.avatar,
                cache: "reload",
              }}
              style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }}
            />
          ) : (
            <View style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: "#7C4DFF", alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 36 }}>
                {user?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Зураг солихын тулд дарна уу</Text>
        </TouchableOpacity>

        {/* Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>Нэр</Text>
          <TextInput
            style={{
              backgroundColor: colors.card, color: colors.text, borderRadius: 12,
              paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
              borderWidth: 1, borderColor: colors.border,
            }}
            placeholder="Нэрээ оруулна уу"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>Имэйл</Text>
          <TextInput
            style={{
              backgroundColor: colors.card, color: colors.text, borderRadius: 12,
              paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
              borderWidth: 1, borderColor: colors.border,
            }}
            placeholder="Имэйл хаягаа оруулна уу"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Currency */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>Валют</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { code: "MNT", label: "₮ MNT", name: "Төгрөг" },
              { code: "USD", label: "$ USD", name: "Доллар" },
              { code: "EUR", label: "€ EUR", name: "Евро" },
              { code: "KRW", label: "₩ KRW", name: "Вон" },
              { code: "CNY", label: "¥ CNY", name: "Юань" },
            ].map((c) => (
              <TouchableOpacity
                key={c.code}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                  borderWidth: 1,
                  borderColor: currency === c.code ? "#00C853" : colors.border,
                  backgroundColor: currency === c.code ? "rgba(0,200,83,0.1)" : colors.card,
                  minWidth: 90, alignItems: "center",
                }}
                onPress={() => setCurrency(c.code)}
              >
                <Text style={{
                  fontWeight: "600", fontSize: 14,
                  color: currency === c.code ? "#00C853" : colors.text,
                }}>
                  {c.label}
                </Text>
                <Text style={{
                  fontSize: 11, marginTop: 2,
                  color: currency === c.code ? "#00C853" : colors.textMuted,
                }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Member Since */}
        <View style={{
          backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 20,
        }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Бүртгүүлсэн</Text>
          <Text style={{ color: colors.text, fontWeight: "500", fontSize: 15, marginTop: 4 }}>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("mn-MN", { month: "long", year: "numeric" })
              : "N/A"}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 20 }} />

        {/* Dark/Light Mode */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={20} color="#FFD600" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
                {isDark ? "Харанхуй горим" : "Гэрэлтэй горим"}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {isDark ? "Гэрэлтэй горим руу солих" : "Харанхуй горим руу солих"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: "#7C4DFF" }}
            thumbColor="#fff"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853", paddingVertical: 16, borderRadius: 16,
            alignItems: "center", marginBottom: 40,
          }}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D0D" />
          ) : (
            <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 17 }}>Хадгалах</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
