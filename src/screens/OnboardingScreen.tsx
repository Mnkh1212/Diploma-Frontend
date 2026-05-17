import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

type Slide = {
  id: string;
  title: string;
  description: string;
  colors: readonly [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  // Дотор хөвөгч жижиг icons + position (orb-ийн центрээс offset)
  floats: { icon: keyof typeof Ionicons.glyphMap; x: number; y: number; size: number; color: string }[];
};

const slides: Slide[] = [
  {
    id: "1",
    title: "Санхүүгээ хянаарай",
    description:
      "Таны хувийн санхүүгийн хамтрагч. Мөнгөө хялбархан хянаж, AI зөвлөгч тусална.",
    colors: ["#FF6B35", "#FF8F65"] as const,
    icon: "wallet",
    floats: [
      { icon: "trending-up", x: -120, y: -90, size: 22, color: "#00C853" },
      { icon: "cash-outline", x: 110, y: -60, size: 26, color: "#FFD600" },
      { icon: "pie-chart", x: -100, y: 100, size: 20, color: "#448AFF" },
      { icon: "card-outline", x: 110, y: 90, size: 24, color: "#E056A0" },
    ],
  },
  {
    id: "2",
    title: "Ухаалаг төсөвлөлт",
    description:
      "Сарын төсвөө тогтоож, зарлагаа хянаж, илүү ихийг хэмнээрэй.",
    colors: ["#7C4DFF", "#448AFF"] as const,
    icon: "pie-chart",
    floats: [
      { icon: "stats-chart", x: -110, y: -80, size: 22, color: "#00C853" },
      { icon: "calculator", x: 115, y: -70, size: 24, color: "#FFD600" },
      { icon: "wallet-outline", x: -100, y: 100, size: 22, color: "#FF6B35" },
      { icon: "checkmark-circle", x: 100, y: 90, size: 22, color: "#00C853" },
    ],
  },
  {
    id: "3",
    title: "Санхүүгаа нэгтгэ",
    description:
      "Банкны данс, кредит карт холбож, бодит цагийн мэдээлэл аваарай.",
    colors: ["#E056A0", "#7C4DFF"] as const,
    icon: "link",
    floats: [
      { icon: "card", x: -110, y: -90, size: 22, color: "#00C853" },
      { icon: "business", x: 110, y: -70, size: 24, color: "#FFD600" },
      { icon: "phone-portrait", x: -100, y: 100, size: 22, color: "#448AFF" },
      { icon: "globe", x: 105, y: 95, size: 22, color: "#E056A0" },
    ],
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { isDark, colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate("Register");
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={{ width, flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
      {/* Logo */}
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 32 }}>
        <Text style={{ color: "#00C853" }}>✦ </Text>fintrack
      </Text>

      {/* Hero composition: gradient orb + central icon + floating decorations */}
      <View
        style={{
          width: 280,
          height: 280,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        {/* Glow blur (доод суурь) */}
        <View
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: item.colors[0],
            opacity: 0.18,
            transform: [{ scale: 1.15 }],
          }}
        />

        {/* Floating decorative icons — orb-ийн эргэн тойронд */}
        {item.floats.map((f, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: 140 + f.x - f.size / 2 - 4,
              top: 140 + f.y - f.size / 2 - 4,
              width: f.size + 16,
              height: f.size + 16,
              borderRadius: (f.size + 16) / 2,
              backgroundColor: f.color + "20",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: f.color + "40",
            }}
          >
            <Ionicons name={f.icon} size={f.size - 2} color={f.color} />
          </View>
        ))}

        {/* Main gradient orb */}
        <LinearGradient
          colors={[item.colors[0], item.colors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: item.colors[0],
            shadowOpacity: 0.4,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          {/* Inner highlight (glossy effect) */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 24,
              width: 56,
              height: 32,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.25)",
            }}
          />
          {/* Central icon */}
          <Ionicons name={item.icon} size={72} color="#FFFFFF" />
        </LinearGradient>
      </View>

      {/* Title */}
      <Text
        style={{
          color: "#00C853",
          fontSize: 26,
          fontWeight: "800",
          textAlign: "center",
          marginBottom: 12,
          letterSpacing: 0.3,
        }}
      >
        {item.title}
      </Text>

      {/* Description */}
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: "center",
          lineHeight: 22,
          paddingHorizontal: 8,
        }}
      >
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 48 }}>
        {/* Dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 28 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: currentIndex === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === i ? "#00C853" : colors.border,
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#00C853", paddingVertical: 16,
            borderRadius: 16, alignItems: "center", marginBottom: 16,
          }}
          onPress={handleNext}
        >
          <Text style={{ color: "#0D0D0D", fontWeight: "700", fontSize: 16 }}>
            {currentIndex === slides.length - 1 ? "Эхлэх" : "Дараах"}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Алгасах</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
