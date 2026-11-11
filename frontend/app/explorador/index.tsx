import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { ExplorerHero } from "../../components/art/ExplorerHero";
import { SceneArt } from "../../components/art/SceneArt";
import type { SceneKey } from "../../components/art/placeScenes";
import { BackButton } from "../../components/CircleButton";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon } from "../../components/Icon";
import { Mascot } from "../../components/Mascot";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { shadows, theme } from "../../constants/theme";

/** Cada pregunta lleva una ilustración que representa su tema. */
const suggestions: { text: string; scene: SceneKey; alt: string }[] = [
  {
    text: "¿Cómo se dice casa en awapit?",
    scene: "selva",
    alt: "Ilustración de la selva del pueblo Awá",
  },
  {
    text: "¿Qué es el pueblo Quillacinga?",
    scene: "encano",
    alt: "Ilustración de un bosque junto a una laguna",
  },
  {
    text: "¿Qué es la Unidad Indígena del Pueblo Awá UNIPA?",
    scene: "tejido",
    alt: "Ilustración de un tejido con rombos de colores",
  },
];

export default function ExplorerScreen() {
  const router = useRouter();
  const headerTop = useHeaderTop();

  const openConversation = (question?: string) =>
    router.push({
      pathname: "/explorador/conversacion",
      params: question ? { q: question } : undefined,
    });

  return (
    <ScreenLayout nav="inicio" navColor={theme.colors.purple} band>
      <Hero height={215} art={<ExplorerHero preserveAspectRatio="xMidYMin slice" />}>
        <View style={{ left: 14, position: "absolute", top: headerTop }}>
          <BackButton
            fallback="/inicio"
            color="#FFFFFF"
            background="rgba(251,243,230,0.18)"
            borderColor="rgba(255,255,255,0.35)"
          />
        </View>
        <View style={{ left: 20, position: "absolute", top: headerTop + 54 }}>
          <T
            accessibilityRole="header"
            f="display"
            w={800}
            s={31}
            lh={35}
            c="#FFFFFF"
            style={{ textShadowColor: "rgba(30,15,60,0.4)", textShadowOffset: { height: 2, width: 0 }, textShadowRadius: 8 }}
          >
            Ñawi Explora
          </T>
          <T
            s={14.5}
            lh={20}
            c="#FFFFFF"
            style={{ marginTop: 4, textShadowColor: "rgba(30,15,60,0.4)", textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 4 }}
          >
            Pregunta, descubre, aprende.
          </T>
        </View>
      </Hero>

      <View style={{ marginTop: -7, paddingHorizontal: 20 }}>
        {/* Presentación de Ñawi */}
        <View
          style={[
            {
              alignItems: "flex-start",
              backgroundColor: theme.colors.surface,
              borderColor: "#E3D8EE",
              borderRadius: 18,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              padding: 14,
            },
            shadows.card,
          ]}
        >
          <Mascot size={44} />
          <T s={13.5} lh={20} c="#33323A" style={{ flex: 1 }}>
            Hola, soy{" "}
            <T f="display" w={700} s={13.5} c={theme.colors.purpleDeep}>
              Ñawi
            </T>
            , tu asistente virtual. Puedo ayudarte a resolver dudas sobre las
            lenguas, el territorio y la cultura. Uso información confiable y
            siempre te muestro las fuentes.
          </T>
        </View>

        {/* Caja de pregunta */}
        <Pressable
          accessibilityHint="Abre la conversación con Ñawi"
          accessibilityLabel="¿Qué te gustaría saber?"
          accessibilityRole="button"
          onPress={() => openConversation()}
          style={[
            {
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderColor: theme.colors.purpleBorder,
              borderRadius: 28,
              borderWidth: 2,
              flexDirection: "row",
              gap: 10,
              height: 56,
              marginTop: 16,
              paddingLeft: 16,
              paddingRight: 8,
            },
            shadows.soft,
          ]}
        >
          <Icon name="search" size={20} color={theme.colors.purple} strokeWidth={2} />
          <T s={14.5} c="#6A6477" style={{ flex: 1 }}>
            ¿Qué te gustaría saber?
          </T>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.purple,
              borderRadius: 21,
              height: 42,
              justifyContent: "center",
              width: 42,
            }}
          >
            <Icon name="send" size={19} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </Pressable>

        <T f="display" w={700} s={16} lh={20} c={theme.colors.purpleDeep} style={{ marginBottom: 10, marginTop: 18 }}>
          Puedes preguntar
        </T>
        <View style={{ gap: 8 }}>
          {suggestions.map((item) => (
            <Pressable
              key={item.text}
              accessibilityRole="link"
              onPress={() => openConversation(item.text)}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderColor: "#E3D8EE",
                borderRadius: 16,
                borderWidth: 1,
                flexDirection: "row",
                gap: 12,
                minHeight: 56,
                opacity: pressed ? 0.9 : 1,
                paddingLeft: 8,
                paddingRight: 12,
                paddingVertical: 8,
              })}
            >
              <View style={{ borderRadius: 12, height: 40, overflow: "hidden", width: 40 }}>
                <SceneArt scene={item.scene} accessibilityLabel={item.alt} />
              </View>
              <T f="display" w={600} s={14.5} c="#2D1B52" style={{ flex: 1 }}>
                {item.text}
              </T>
              <Icon name="chevronRight" size={18} color="#8A7BA8" strokeWidth={2} />
            </Pressable>
          ))}
        </View>

        {/* Promesa de fuentes */}
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#EFE8F8",
            borderRadius: 16,
            flexDirection: "row",
            gap: 12,
            marginTop: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <Icon name="shield" size={26} color={theme.colors.purple} />
          <T s={12.5} lh={17} c="#3F2670" style={{ flex: 1 }}>
            <T f="display" w={700} s={12.5} c="#3F2670">
              Siempre con fuentes.
            </T>{" "}
            Cada respuesta indica de dónde viene la información para que puedas
            consultarla.
          </T>
        </View>
      </View>
    </ScreenLayout>
  );
}
