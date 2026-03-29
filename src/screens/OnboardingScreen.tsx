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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const slides = [
  {
    id: "1",
    title: "Санхүүгээ хянаарай",
    description:
      "Таны хувийн санхүүгийн хамтрагч. Мөнгөө хялбархан хянаж, AI зөвлөгч тусална.",
    colors: ["#FF6B35", "#FF8F65"] as const,
  },
  {
    id: "2",
    title: "Ухаалаг төсөвлөлт",
    description:
      "Сарын төсвөө тогтоож, зарлагаа хянаж, илүү ихийг хэмнээрэй.",
    colors: ["#7C4DFF", "#448AFF"] as const,
  },
  {
    id: "3",
    title: "Санхүүгаа нэгтгэ",
    description:
      "Банкны данс, кредит карт холбож, бодит цагийн мэдээлэл аваарай.",
    colors: ["#FF6B35", "#7C4DFF"] as const,
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

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={{ width, flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
      {/* Logo */}
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 48 }}>
        <Text style={{ color: "#00C853" }}>✦ </Text>fintrack
      </Text>

      {/* Gradient Circle */}
      <View style={{ marginBottom: 48 }}>
        <LinearGradient
          colors={[item.colors[0], item.colors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 160, height: 160, borderRadius: 80,
            opacity: 0.8,
          }}
        />
      </View>

      {/* Title */}
      <Text style={{
        color: "#00C853", fontSize: 24, fontWeight: "800",
        textAlign: "center", marginBottom: 16, fontStyle: "italic",
      }}>
        {item.title}
      </Text>

      {/* Description */}
      <Text style={{
        color: colors.textSecondary, fontSize: 14, textAlign: "center",
        lineHeight: 22, paddingHorizontal: 8,
      }}>
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
