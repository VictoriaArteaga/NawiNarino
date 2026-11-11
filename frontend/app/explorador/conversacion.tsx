import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatHeaderArt } from "../../components/art/ChatHeaderArt";
import { BackButton } from "../../components/CircleButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Hero, useHeaderTop } from "../../components/Hero";
import { Icon } from "../../components/Icon";
import { Mascot } from "../../components/Mascot";
import { T } from "../../components/T";
import { fontFamily, shadows, theme } from "../../constants/theme";
import { useAskExplorer } from "../../hooks/useExplorer";
import { ApiError } from "../../services/api";
import { ApiConfigError } from "../../services/config";
import type { ExplorerCitation } from "../../types/explorer";

// Preguntas sugeridas sobre los documentos del corpus.
const suggestions = [
  "¿Cómo se dice casa en awapit?",
  "¿Qué es el pueblo Quillacinga?",
  "¿Qué es la Unidad Indígena del Pueblo Awá UNIPA?",
  "¿Cómo se transmite el nasa yuwe en las familias?",
];

const MIN_QUESTION_LENGTH = 3; // igual que el backend (min_length=3)

function validationLabel(status: string): string {
  switch (status) {
    case "synthetic":
      return "Fuente del corpus";
    case "project_approved":
      return "Fuente del corpus";
    case "pending_validation":
      return "Fuente del corpus";
    case "specialist_validated":
      return "Validado por especialista";
    case "community_validated":
      return "Validado por la comunidad";
    default:
      return status;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiConfigError) return error.message; // configuración del build: mensaje específico
  if (error instanceof ApiError && error.status === undefined) {
    return "No se pudo conectar con el servicio del Explorador. Revisa tu conexión e inténtalo de nuevo.";
  }
  if (error instanceof ApiError) return error.message;
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

function CitationCard({ citation }: { citation: ExplorerCitation }) {
  const byline = [citation.author, citation.year].filter(Boolean).join(" · ");
  // Contenido sintético o sin validar: se resalta con el color de aviso.
  const unverified =
    citation.isSynthetic || citation.validationStatus === "synthetic";
  return (
    <View
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
          {citation.ref}
        </T>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Extracto literal recuperado: contenido principal de la tarjeta */}
        <T s={13.5} lh={20} c="#2B2A33">
          «{citation.excerpt}»
        </T>
        <View style={{ borderTopColor: "#E3D8EE", borderTopWidth: 1, marginTop: 8, paddingTop: 6 }}>
          <T w={700} s={12} lh={15}>
            {citation.title}
          </T>
          <T s={11.5} lh={15} c="#5E5A6B">
            {citation.isSynthetic ? `Página ${citation.page}` : `p. ${citation.page} del PDF`}
            {byline ? ` · ${byline}` : ""}
          </T>
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: unverified ? theme.colors.mockBackground : theme.colors.purpleTint,
              borderRadius: 8,
              marginTop: 5,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <T s={11} lh={15} w={700} c={unverified ? theme.colors.mockText : theme.colors.purpleDeep}>
              {validationLabel(citation.validationStatus)}
            </T>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Conversation screen connected to `POST /explorer/ask` (RAG). The answer is
 * extractive: text, citations and notices come from the backend, never from
 * the client. When the backend abstains, nothing is made up.
 */
export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const headerTop = useHeaderTop();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const initialQuestion = typeof q === "string" ? q.trim() : "";

  const ask = useAskExplorer();
  const [question, setQuestion] = useState("");
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lastSent = useRef<string | null>(null);

  const canSend = !ask.isPending && draft.trim().length >= MIN_QUESTION_LENGTH;
  const tooShort = draft.trim().length > 0 && draft.trim().length < MIN_QUESTION_LENGTH;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH || ask.isPending) return;
    lastSent.current = trimmed;
    setQuestion(trimmed);
    setDraft("");
    ask.mutate({ question: trimmed });
  };

  // Pregunta recibida desde la pantalla anterior: se envía una sola vez.
  useEffect(() => {
    if (initialQuestion && initialQuestion !== lastSent.current) send(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    if (ask.data || ask.isError) scrollRef.current?.scrollToEnd({ animated: true });
  }, [ask.data, ask.isError]);

  const result = ask.data;
  const inputHeight = 84 + Math.max(insets.bottom, 12) - 12;

  return (
    <View style={{ backgroundColor: theme.colors.canvas, flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: inputHeight + 16 }}
        keyboardShouldPersistTaps="handled"
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
                En línea · responde con fuentes
              </T>
            </View>
          </View>
        </Hero>

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {!question ? (
            <View style={{ marginTop: 14 }}>
              <T s={14} lh={21} c="#5E5A6B">
                Escribe una pregunta y Ñawi te responde mostrando las fuentes de donde
                viene la información.
              </T>
            </View>
          ) : (
            <>
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

              {/* Answer */}
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
                  {ask.isPending ? (
                    <View
                      accessibilityLiveRegion="polite"
                      style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
                    >
                      <ActivityIndicator color={theme.colors.purple} />
                      <T s={14} c="#5E5A6B">
                        Buscando en las fuentes y preparando la respuesta…
                      </T>
                    </View>
                  ) : ask.isError ? (
                    <ErrorMessage
                      message={errorMessage(ask.error)}
                      onRetry={() =>
                        lastSent.current && ask.mutate({ question: lastSent.current })
                      }
                    />
                  ) : result && result.abstained ? (
                    <View accessibilityLiveRegion="polite">
                      <T f="display" w={700} s={14} c={theme.colors.purpleDeep}>
                        Sin evidencia suficiente
                      </T>
                      <T s={14} lh={21.5} c="#2B2A33" style={{ marginTop: 4 }}>
                        {result.answer}
                      </T>
                      <T s={12.5} lh={18} c="#5E5A6B" style={{ marginTop: 8 }}>
                        Intenta con otras palabras o consulta las fuentes originales.
                      </T>
                    </View>
                  ) : result ? (
                    <View accessibilityLiveRegion="polite">
                      {/* El texto de la respuesta repite los extractos; se muestran una sola vez, en las tarjetas. */}
                      {result.explanation ? (
                        <View style={{ marginBottom: 12 }}>
                          <T s={14} lh={21.5} c="#2B2A33">
                            {result.explanation}
                          </T>
                        </View>
                      ) : null}
                      <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
                        <Icon name="library" size={16} color={theme.colors.purple} strokeWidth={2} />
                        <T f="display" w={700} s={13} c={theme.colors.purpleDeep}>
                          {result.evidence === "related"
                            ? "Fragmentos relacionados (no confirman tu pregunta):"
                            : result.explanation
                              ? "Fuentes que respaldan la explicación:"
                              : result.citations.length === 1
                              ? "Encontré esto en las fuentes:"
                              : `Encontré esto en ${result.citations.length} fuentes:`}
                        </T>
                      </View>
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {result.citations.map((citation) => (
                          <CitationCard key={citation.chunkId} citation={citation} />
                        ))}
                      </View>
                    </View>
                  ) : null}

                  {result && !ask.isPending && !ask.isError
                    ? result.notices.map((notice) => (
                        <View
                          key={notice}
                          style={{
                            alignItems: "flex-start",
                            backgroundColor: "#F1EAF8",
                            borderRadius: 10,
                            flexDirection: "row",
                            gap: 8,
                            marginTop: 12,
                            padding: 10,
                          }}
                        >
                          <Icon name="help" size={18} color={theme.colors.purple} />
                          <T s={11.5} lh={16} c="#3F2670" style={{ flex: 1 }}>
                            {notice}
                          </T>
                        </View>
                      ))
                    : null}
                </View>
              </View>
            </>
          )}

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
            {suggestions.map((text) => (
              <Pressable
                key={text}
                accessibilityRole="button"
                disabled={ask.isPending}
                onPress={() => send(text)}
                style={{
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderColor: theme.colors.purpleBorder,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  height: 40,
                  justifyContent: "center",
                  opacity: ask.isPending ? 0.5 : 1,
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

      {/* Input */}
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
        {tooShort ? (
          <T accessibilityRole="alert" s={12} lh={16} c="#6A6477" style={{ marginBottom: 6, paddingLeft: 14 }}>
            Escribe al menos {MIN_QUESTION_LENGTH} caracteres.
          </T>
        ) : null}
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderColor: focused ? theme.colors.purple : theme.colors.purpleBorder,
            borderRadius: 27,
            borderWidth: 2,
            flexDirection: "row",
            gap: 8,
            height: 54,
            paddingLeft: 18,
            paddingRight: 6,
          }}
        >
          <TextInput
            accessibilityLabel="Escribe tu pregunta"
            editable={!ask.isPending}
            maxLength={500}
            onBlur={() => setFocused(false)}
            onChangeText={setDraft}
            onFocus={() => setFocused(true)}
            onSubmitEditing={() => send(draft)}
            placeholder="Escribe una pregunta…"
            placeholderTextColor="#8A8472"
            returnKeyType="send"
            style={{
              color: theme.colors.ink,
              flex: 1,
              fontFamily: fontFamily("body", 400),
              fontSize: 14.5,
              minWidth: 0,
              // Sin contorno nativo del navegador: el foco se ve en el borde del campo.
              ...({ outlineStyle: "none" } as object),
            }}
            value={draft}
          />
          <Pressable
            accessibilityLabel="Enviar pregunta"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={() => send(draft)}
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.purple,
              borderRadius: 22,
              height: 44,
              justifyContent: "center",
              opacity: canSend ? 1 : 0.5,
              width: 44,
            }}
          >
            <Icon name="send" size={20} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
