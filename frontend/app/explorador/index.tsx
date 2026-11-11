import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { ExplorerHero } from "../../components/art/ExplorerHero";
import { BackButton } from "../../components/CircleButton";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon, type IconName } from "../../components/Icon";
import { Mascot } from "../../components/Mascot";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { shadows, theme } from "../../constants/theme";

const suggestions: { text: string; icon: IconName }[] = [
  { text: "¿Qué es el pueblo Quillacinga?", icon: "pin" },
  { text: "¿Qué es la Unidad Indígena del Pueblo Awá UNIPA?", icon: "translate" },
  { text: "¿Cómo se transmite el nasa yuwe en las familias?", icon: "waves" },
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
        {/* Introduction */}
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
            . Busco en los documentos disponibles y te muestro los fragmentos
            encontrados con su fuente y página. Si no hay evidencia suficiente,
            te lo digo.
          </T>
        </View>

        {/* Honest notice: demo corpus is synthetic */}
        <View
          accessibilityRole="alert"
          style={{
            alignItems: "flex-start",
            backgroundColor: theme.colors.mockBackground,
            borderRadius: 14,
            flexDirection: "row",
            gap: 10,
            marginTop: 12,
            padding: 12,
          }}
        >
          <Icon name="warning" size={18} color="#B9701A" />
          <T w={600} s={12.5} lh={18} c={theme.colors.mockText} style={{ flex: 1 }}>
            Ñawi busca solo en los documentos cargados y explica con un modelo
            de lenguaje a partir de sus fragmentos.
          </T>
        </View>

        {/* Question box */}
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
          Prueba preguntando
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
                minHeight: 52,
                opacity: pressed ? 0.9 : 1,
                paddingLeft: 10,
                paddingRight: 12,
                paddingVertical: 8,
              })}
            >
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: theme.colors.purpleSoft,
                  borderRadius: 17,
                  height: 34,
                  justifyContent: "center",
                  width: 34,
                }}
              >
                <Icon name={item.icon} size={19} color={theme.colors.purple} />
              </View>
              <T f="display" w={600} s={14.5} c="#2D1B52" style={{ flex: 1 }}>
                {item.text}
              </T>
              <Icon name="chevronRight" size={18} color="#8A7BA8" strokeWidth={2} />
            </Pressable>
          ))}
        </View>

        {/* Sources promise */}
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
              Pensado para citar fuentes.
            </T>{" "}
            Cuando esté disponible, cada respuesta indicará de dónde viene la
            información para que puedas consultarla.
          </T>
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/fuentes")}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: theme.colors.purpleSoft,
            borderRadius: 14,
            flexDirection: "row",
            gap: 8,
            height: 46,
            justifyContent: "center",
            marginTop: 12,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Icon name="library" size={18} color={theme.colors.purple} />
          <T f="display" w={600} s={14.5} c={theme.colors.purpleDeep}>
            Revisar las fuentes
          </T>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}
