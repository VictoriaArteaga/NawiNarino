import { useRouter } from "expo-router";
import { useId } from "react";
import { View } from "react-native";
import { Pressable } from "./Pressable";
import Svg, { Defs, LinearGradient, Mask, Rect, Stop } from "react-native-svg";

import { getLanguageTheme } from "../constants/languages";
import { shadows, theme, tone } from "../constants/theme";
import { useLanguageProgress } from "../hooks/useLearning";
import type { Language } from "../types/language";
import { GradientBox } from "./GradientBox";
import { Icon } from "./Icon";
import { useScreenWidth } from "./PhoneFrame";
import { T } from "./T";

interface LanguageCardProps {
  language: Language;
}

export function LanguageCard({ language }: LanguageCardProps) {
  const router = useRouter();
  const look = getLanguageTheme(language.name);
  const progress = useLanguageProgress(language.id);
  const percentage = progress.data?.percentage ?? 0;
  const Portrait = look.Portrait;
  const uid = `lc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const width = useScreenWidth();
  const cardWidth = Math.min(width, 520) - 40;

  const subtitle = look.people
    ? `Lengua del pueblo ${look.people}`
    : "Lengua de Nariño";

  return (
    <Pressable
      accessibilityLabel={`Abrir información de ${language.name}`}
      accessibilityRole="link"
      onPress={() =>
        router.push({
          pathname: "/lenguas/[id]",
          params: { id: String(language.id) },
        })
      }
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <GradientBox
        colors={[look.dark, look.light]}
        direction="tr"
        style={[{ borderRadius: 18, height: 142 }, shadows.card]}
      >
        {/* Portrait fading into the card */}
        <View style={{ height: 142, left: 0, position: "absolute", top: 0, width: 122 }}>
          {Portrait ? (
            <Portrait preserveAspectRatio="xMidYMid slice" />
          ) : (
            <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
              <Icon name="translate" size={40} color="#FFFFFF" />
            </View>
          )}
          {/* Re-draws the card gradient over the portrait's right edge, with a
              mask that fades it in, so the portrait melts into the card. */}
          <Svg
            pointerEvents="none"
            style={{ left: 0, position: "absolute", top: 0 }}
            width={cardWidth}
            height={142}
          >
            <Defs>
              <LinearGradient id={`${uid}cg`} x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor={look.dark} />
                <Stop offset="1" stopColor={look.light} />
              </LinearGradient>
              <LinearGradient
                id={`${uid}mg`}
                gradientUnits="userSpaceOnUse"
                x1="82"
                y1="0"
                x2="122"
                y2="0"
              >
                <Stop offset="0" stopColor="#000000" />
                <Stop offset="1" stopColor="#FFFFFF" />
              </LinearGradient>
              <Mask
                id={`${uid}mk`}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={cardWidth}
                height="142"
              >
                <Rect x="0" y="0" width="122" height="142" fill={`url(#${uid}mg)`} />
              </Mask>
            </Defs>
            <Rect
              width={cardWidth}
              height="142"
              fill={`url(#${uid}cg)`}
              mask={`url(#${uid}mk)`}
            />
          </Svg>
        </View>

        <View style={{ left: 134, position: "absolute", right: 56, top: 22 }}>
          <T
            f="display"
            w={700}
            s={22}
            lh={28}
            c="#FFFFFF"
            numberOfLines={1}
            style={{ textShadowColor: "rgba(0,0,0,0.22)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 3 }}
          >
            {language.name}
          </T>
          <T
            s={13}
            lh={18}
            c="#FFFFFF"
            numberOfLines={1}
            style={{ marginTop: 8, textShadowColor: "rgba(0,0,0,0.25)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 2 }}
          >
            {subtitle}
          </T>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.38)",
              borderRadius: 3,
              height: 6,
              marginTop: 15,
              width: 158,
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 3,
                height: 6,
                width: `${Math.max(0, Math.min(100, percentage))}%`,
              }}
            />
          </View>
          <T
            s={12}
            lh={16}
            c="#FFFFFF"
            numberOfLines={1}
            style={{ marginTop: 6, textShadowColor: "rgba(0,0,0,0.25)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 2 }}
          >
            {progress.data
              ? `${progress.data.completedActivities} / ${progress.data.totalActivities} actividades`
              : "Cargando avance…"}
          </T>
        </View>

        <View style={{ position: "absolute", right: 18, top: 59 }}>
          <Icon name="arrowRight" size={24} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </GradientBox>
    </Pressable>
  );
}
