import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatHeaderArt } from "../../components/art/ChatHeaderArt";
import { BackButton } from "../../components/CircleButton";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon } from "../../components/Icon";
import { Mascot } from "../../components/Mascot";
import { T } from "../../components/T";
import { fontFamily, shadows, theme } from "../../constants/theme";
import { useSources } from "../../hooks/useHeritage";
import { useLanguages } from "../../hooks/useLanguages";
import { useVocabulary } from "../../hooks/useVocabulary";

const followUps = ["¿Cómo se pronuncia?", "Dime más sobre su uso", "Ver en el mapa"];
const defaultQuestion = "¿Qué significa una palabra en una lengua?";

/**
 * Conversation PREVIEW. It shows how an answer with sources will look, but no
 * AI is involved: nothing the learner reads here was generated, and no
 * question is sent anywhere (see the notice in the screen).
 */
export default function ConversationPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerTop = useHeaderTop();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const question = typeof q === "string" && q.trim() ? q : defaultQuestion;

  const sources = useSources();
  const languages = useLanguages();
  const vocabulary = useVocabulary(languages.data?.[0]?.id ?? 0);
  const sampleWord = vocabulary.data?.[0];
  const inputHeight = 84 + Math.max(insets.bottom, 12) - 12;

  return (
    <View style={{ backgroundColor: theme.colors.canvas, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: inputHeight + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Hero height={104} art={<ChatHeaderArt preserveAspectRatio="xMidYMin slice" />}>
          <View style={{ left: 12, position: "absolute", top: headerTop - 4 }}>
            <BackButton
              fallback="/explorador"
              color="#FFFFFF"
              background="transparent"
            />
          </View>
          <View style={{ left: 58, position: "absolute", top: headerTop - 6 }}>
            <Mascot size={46} halo />
          </View>
          <View style={{ left: 114, position: "absolute", right: 56, top: headerTop - 4 }}>
            <T accessibilityRole="header" f="display" w={800} s={20} lh={24} c="#FFFFFF">
              Ñawi Explora
            </T>
            <View style={{ alignItems: "center", flexDirection: "row", gap: 6, marginTop: 2 }}>
              <View style={{ backgroundColor: "#F3C46B", borderRadius: 4, height: 8, width: 8 }} />
              <T s={12.5} lh={16} c="#FFFFFF" numberOfLines={1}>
                Vista previa · aún sin IA
              </T>
            </View>
          </View>
        </Hero>

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                backgroundColor: theme.colors.purpleSoft,
                borderRadius: 11,
                height: 22,
                justifyContent: "center",
                paddingHorizontal: 12,
              }}
            >
              <T f="display" w={600} s={11.5} c={theme.colors.purpleDeep}>
                Ejemplo ilustrativo
              </T>
            </View>
          </View>

          {/* Learner question */}
          <View style={{ alignItems: "flex-end", marginTop: 14 }}>
            <View
              style={[
                {
                  backgroundColor: theme.colors.purple,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 4,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  maxWidth: 270,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                },
                { shadowColor: "#6B4A9E", shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.3, shadowRadius: 8 },
              ]}
            >
              <T w={600} s={14.5} c="#FFFFFF">
                {question}
              </T>
            </View>
          </View>

          {/* Preview answer */}
          <View style={{ alignItems: "flex-start", flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Mascot size={34} />
            <View
              style={[
                {
                  backgroundColor: "#FFFFFF",
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  borderColor: "#E3D8EE",
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 20,
                  borderWidth: 1,
                  flex: 1,
                  minWidth: 0,
                  padding: 14,
                },
                shadows.soft,
              ]}
            >
              <T s={14} lh={21.5} c="#2B2A33">
                Así se verá una respuesta de Ñawi: una explicación breve, la
                palabra destacada y, debajo, las fuentes consultadas. En esta
                versión no se genera ninguna respuesta; este texto es solo una
                muestra del diseño.
              </T>

              <View
                style={{
                  alignItems: "center",
                  backgroundColor: theme.colors.purpleTint,
                  borderRadius: 14,
                  flexDirection: "row",
                  gap: 12,
                  marginTop: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <View
                  accessibilityLabel="Pronunciación no disponible en la vista previa"
                  style={{
                    alignItems: "center",
                    backgroundColor: theme.colors.purple,
                    borderRadius: 19,
                    height: 38,
                    justifyContent: "center",
                    width: 38,
                  }}
                >
                  <Icon name="speaker" size={19} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <T f="display" w={800} s={18} lh={21} c={theme.colors.purpleDark} numberOfLines={1}>
                    {sampleWord ? sampleWord.word : "Palabra de ejemplo"}
                  </T>
                  <T s={12.5} c="#5A4D78" numberOfLines={1}>
                    {sampleWord ? sampleWord.translation : "Traducción pendiente de validación"}
                  </T>
                </View>
              </View>

              <View style={{ alignItems: "center", flexDirection: "row", gap: 6, marginTop: 14 }}>
                <Icon name="library" size={16} color={theme.colors.purple} strokeWidth={2} />
                <T f="display" w={700} s={13} c={theme.colors.purpleDeep}>
                  Fuentes utilizadas
                </T>
              </View>
              <View style={{ gap: 6, marginTop: 8 }}>
                {sources.data && sources.data.length > 0 ? (
                  sources.data.slice(0, 2).map((source, index) => (
                    <View
                      key={source.id}
                      style={{
                        alignItems: "flex-start",
                        backgroundColor: "#F8F4FC",
                        borderColor: "#E3D8EE",
                        borderRadius: 10,
                        borderWidth: 1,
                        flexDirection: "row",
                        gap: 9,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          backgroundColor: theme.colors.purple,
                          borderRadius: 6,
                          height: 20,
                          justifyContent: "center",
                          width: 20,
                        }}
                      >
                        <T f="display" w={700} s={11.5} c="#FFFFFF">
                          {index + 1}
                        </T>
                      </View>
                      <View style={{ flex: 1 }}>
                        <T w={700} s={12} lh={15}>
                          {source.title}
                        </T>
                        <T s={11.5} lh={14} c="#5E5A6B">
                          {source.author}
                          {source.isMock ? " · Fuente de demostración" : ""}
                        </T>
                      </View>
                    </View>
                  ))
                ) : (
                  <T s={12} c="#5E5A6B">
                    {sources.isPending ? "Cargando fuentes…" : "Aún no hay fuentes disponibles."}
                  </T>
                )}
              </View>

              <View
                style={{
                  alignItems: "flex-start",
                  backgroundColor: theme.colors.mockBackground,
                  borderRadius: 10,
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 12,
                  padding: 10,
                }}
              >
                <Icon name="warning" size={18} color="#B9701A" />
                <T s={11.5} lh={16} c={theme.colors.mockText} style={{ flex: 1 }}>
                  Vista previa informativa: no se usa IA ni se envía ninguna
                  pregunta a un servicio. La información puede tener
                  limitaciones; consulta siempre las fuentes originales.
                </T>
              </View>
            </View>
          </View>

          {/* Suggestions */}
          <T w={700} s={12} c="#6A6477" style={{ marginBottom: 8, marginTop: 18 }}>
            Sugerencias
          </T>
          <ScrollView
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginRight: -16 }}
          >
            {followUps.map((text) => (
              <Pressable
                key={text}
                accessibilityRole="button"
                onPress={() => router.setParams({ q: text })}
                style={{
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderColor: theme.colors.purpleBorder,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  height: 40,
                  justifyContent: "center",
                  paddingHorizontal: 14,
                }}
              >
                <T f="body" w={700} s={13} c={theme.colors.purpleDeep}>
                  {text}
                </T>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Input (disabled in the preview) */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderTopColor: "#E3D8EE",
          borderTopWidth: 1,
          bottom: 0,
          left: 0,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
          paddingHorizontal: 16,
          paddingTop: 10,
          position: "absolute",
          right: 0,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderColor: theme.colors.purpleBorder,
            borderRadius: 27,
            borderWidth: 2,
            flexDirection: "row",
            gap: 8,
            height: 54,
            opacity: 0.75,
            paddingLeft: 10,
            paddingRight: 6,
          }}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.purpleTint,
              borderRadius: 20,
              height: 40,
              justifyContent: "center",
              width: 40,
            }}
          >
            <Icon name="mic" size={20} color={theme.colors.purple} />
          </View>
          <TextInput
            accessibilityHint="Disponible cuando Ñawi esté activo"
            accessibilityLabel="Escribe otra pregunta"
            editable={false}
            placeholder="Escribe otra pregunta… (próximamente)"
            placeholderTextColor="#8A8472"
            style={{
              color: theme.colors.ink,
              flex: 1,
              fontFamily: fontFamily("body", 400),
              fontSize: 14.5,
              minWidth: 0,
            }}
          />
          <View
            accessibilityLabel="Enviar (próximamente)"
            accessibilityState={{ disabled: true }}
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.purple,
              borderRadius: 22,
              height: 44,
              justifyContent: "center",
              width: 44,
            }}
          >
            <Icon name="send" size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </View>
      </View>
    </View>
  );
}
