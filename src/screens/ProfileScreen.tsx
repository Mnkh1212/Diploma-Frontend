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
import { useLanguage } from "../context/LanguageContext";
import { updateProfile, uploadAvatar } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { buildAssetUrl } from "../config/network";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const { locale, t, changeLanguage } = useLanguage();

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //MediaType ["images"]-ийг стандарт руу шилжүүлэв
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      // @ts-ignore
      formData.append("avatar", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      try {
        const { data } = await uploadAvatar(formData);
        setUser(data);
        Alert.alert("Амжилттай", "Профайл зураг шинэчлэгдлээ");
      } catch (error) {
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>Профайл засах</Text>
        </View>

        {/* Avatar — компакт хэлбэрээр */}
        <TouchableOpacity style={{ alignItems: "center", marginBottom: 20 }} onPress={handlePickAvatar}>
          {user?.avatar && user.avatar.length > 1 ? (
            <Image
              source={{
                uri: buildAssetUrl(user.avatar),
                cache: "reload",
              }}
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
            />
          ) : (
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: "#7C4DFF", alignItems: "center", justifyContent: "center", marginBottom: 8,
            }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 30 }}>
                {user?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Зураг солих</Text>
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

        {/* Currency — 4×2 grid (8 валют) */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>Валют</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { code: "MNT", symbol: "₮", name: "Төгрөг" },
              { code: "USD", symbol: "$", name: "Доллар" },
              { code: "EUR", symbol: "€", name: "Евро" },
              { code: "KRW", symbol: "₩", name: "Вон" },
              { code: "CNY", symbol: "¥", name: "Юань" },
              { code: "JPY", symbol: "¥", name: "Иен" },
              { code: "RUB", symbol: "₽", name: "Рубль" },
              { code: "GBP", symbol: "£", name: "Фунт" },
            ].map((c) => {
              const active = currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={{
                    width: "23.5%",
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? "#00C853" : colors.border,
                    backgroundColor: active ? "rgba(0,200,83,0.1)" : colors.card,
                    alignItems: "center",
                  }}
                  onPress={() => setCurrency(c.code)}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 13,
                      color: active ? "#00C853" : colors.text,
                    }}
                  >
                    {c.symbol} {c.code}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      marginTop: 2,
                      color: active ? "#00C853" : colors.textMuted,
                    }}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

        {/* Language */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="language-outline" size={20} color="#448AFF" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
                {t("appName")} {locale === "mn" ? "Хэл" : "Language"}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {locale === "mn" ? "Монгол" : "English"}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                backgroundColor: locale === "mn" ? "#00C853" : colors.border,
              }}
              onPress={() => changeLanguage("mn")}
            >
              <Text style={{ color: locale === "mn" ? "#0D0D0D" : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>MN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                backgroundColor: locale === "en" ? "#00C853" : colors.border,
              }}
              onPress={() => changeLanguage("en")}
            >
              <Text style={{ color: locale === "en" ? "#0D0D0D" : colors.textSecondary, fontWeight: "600", fontSize: 13 }}>EN</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Fixed Save Button — Гарах товч шиг доош fix байх */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            shadowColor: "#00C853",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D0D" />
          ) : (
            <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>Хадгалах</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
