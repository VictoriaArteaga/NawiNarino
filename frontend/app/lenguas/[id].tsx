import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { BackButton, CircleButton } from "../../components/CircleButton";
import { Card } from "../../components/Card";
import { CulturalInfoCard } from "../../components/CulturalInfoCard";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Hero, useHeaderTop, useHeroHeight } from "../../components/Hero";
import { Icon } from "../../components/Icon";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { PatternBand } from "../../components/PatternBand";
import { Portrait } from "../../components/Portrait";
import { ProgressBar } from "../../components/ProgressBar";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { getLanguageTheme } from "../../constants/languages";
import { shadows, theme } from "../../constants/theme";
import { useCulturalContent, useLanguage } from "../../hooks/useLanguage";
import { useLanguageProgress } from "../../hooks/useLearning";
import { useAppStore } from "../../store/appStore";

export default function LanguageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const languageId = Number(id);
  const validLanguageId = Number.isInteger(languageId) && languageId > 0;

  const languageQuery = useLanguage(languageId);
  const cultureQuery = useCulturalContent(languageId);
  const progressQuery = useLanguageProgress(languageId);
  const setSelectedLanguageId = useAppStore((s) => s.setSelectedLanguageId);
  const saved = useAppStore((s) => s.savedLanguageIds.includes(languageId));
  const toggleSaved = useAppStore((s) => s.toggleSavedLanguage);

  const headerTop = useHeaderTop();
  const heroHeight = useHeroHeight(240);
  const language = languageQuery.data;
  const look = getLanguageTheme(language?.name);
  const HeroArt = look.Hero;

  if (!validLanguageId) {
    return (
      <ScreenLayout contentStyle={{ padding: theme.spacing.lg, paddingTop: headerTop }}>
        <ErrorMessage message="El identificador de la lengua no es válido." />
      </ScreenLayout>
    );
  }

  const percentage = progressQuery.data?.percentage ?? 0;

  return (
    <ScreenLayout bottomSpace={0}>
      <View>
        <Hero height={240} art={<HeroArt preserveAspectRatio="xMidYMin slice" />}>
          <View style={{ left: 14, position: "absolute", top: headerTop }}>
            <BackButton fallback="/lenguas" color={theme.colors.primaryDark} />
          </View>
          <View style={{ position: "absolute", right: 14, top: headerTop }}>
            <CircleButton
              icon="heart"
              label={saved ? "Quitar de lenguas guardadas" : "Guardar lengua"}
              onPress={() => toggleSaved(languageId)}
              color={theme.colors.accent}
              fill={saved ? theme.colors.accent : "none"}
            />
          </View>
        </Hero>

        <View
          style={[
            {
              borderRadius: 52,
              left: 20,
              position: "absolute",
              top: heroHeight - 64,
            },
            shadows.float,
          ]}
        >
          <Portrait
            language={look}
            size={104}
            ring={4}
            ringColor={theme.colors.canvas}
            fallbackLabel={language?.name ?? ""}
            accessibilityLabel={
              look.people ? `Retrato del pueblo ${look.people}` : "Retrato"
            }
          />
        </View>

        <View style={{ marginLeft: 138, minHeight: 62, paddingRight: 20, paddingTop: 6 }}>
          <T
            accessibilityRole="header"
            f="display"
            w={800}
            s={33}
            lh={36}
            c={look.title}
            numberOfLines={1}
          >
            {language?.name ?? "Lengua"}
          </T>
          <T f="display" w={600} s={15} lh={20} c={theme.colors.body}>
            {look.people ? `Lengua del pueblo ${look.people}` : "Lengua de demostración"}
          </T>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          {languageQuery.isPending ? (
            <Loading label="Cargando información de la lengua..." />
          ) : languageQuery.isError ? (
            <ErrorMessage
              message={languageQuery.error.message}
              onRetry={() => void languageQuery.refetch()}
            />
          ) : (
            <>
              <T s={14} lh={21} c="#3B4540">
                Aprende palabras, frases y expresiones de esta lengua, y conoce
                un poco más sobre su cultura y territorio.
              </T>
              {languageQuery.data.isMock ? <MockBadge /> : null}

              {/* Progress */}
              <Card style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 14 }}>
                <View
                  style={{
                    alignItems: "baseline",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <T w={600} s={13} c={theme.colors.ink}>
                    <T f="display" w={700} s={15}>
                      {progressQuery.data
                        ? `${progressQuery.data.completedActivities} de ${progressQuery.data.totalActivities}`
                        : "– de –"}
                    </T>
                    {" actividades"}
                  </T>
                  <T w={600} s={13} c={theme.colors.muted}>
                    {Math.round(percentage)}%
                  </T>
                </View>
                <ProgressBar percentage={percentage} />
              </Card>

              {/* Actions */}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setSelectedLanguageId(languageId);
                  router.push({
                    pathname: "/lenguas/[id]/lecciones",
                    params: { id: String(languageId) },
                  });
                }}
                style={({ pressed }) => [
                  {
                    alignItems: "center",
                    backgroundColor: theme.colors.accent,
                    borderRadius: 14,
                    flexDirection: "row",
                    gap: 8,
                    height: 50,
                    justifyContent: "center",
                    marginTop: 14,
                    opacity: pressed ? 0.88 : 1,
                  },
                  shadows.float,
                ]}
              >
                <T f="display" w={600} s={16} c="#FFFFFF">
                  Continuar
                </T>
                <Icon name="arrowRight" size={18} color="#FFFFFF" strokeWidth={2.2} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setSelectedLanguageId(languageId);
                  router.push({
                    pathname: "/vocabulario/[languageId]",
                    params: { languageId: String(languageId) },
                  });
                }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: look.soft,
                  borderRadius: 14,
                  flexDirection: "row",
                  gap: 8,
                  height: 46,
                  justifyContent: "center",
                  marginTop: 10,
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <Icon name="speaker" size={18} color={look.icon} />
                <T f="display" w={600} s={15} c={look.title}>
                  Ver vocabulario
                </T>
              </Pressable>

              {/* About this language (real records only) */}
              <Card style={{ marginTop: 16, paddingVertical: 12 }}>
                <T f="display" w={700} s={16} c={look.title} style={{ marginBottom: 2 }}>
                  Sobre esta lengua
                </T>
                <InfoRow
                  icon="message"
                  title="Descripción"
                  value={languageQuery.data.shortDescription}
                  tint={look.soft}
                  color={look.icon}
                />
                <InfoRow
                  icon="users"
                  title="Información cultural"
                  value={languageQuery.data.culturalDescription}
                  tint={look.soft}
                  color={look.icon}
                />
              </Card>

              {/* Cultural content */}
              <T f="display" w={700} s={18} c={theme.colors.ink} style={{ marginBottom: 12, marginTop: 20 }}>
                Contenido cultural
              </T>
              {cultureQuery.isPending ? (
                <Loading label="Cargando contenido cultural..." />
              ) : cultureQuery.isError ? (
                <ErrorMessage
                  message={cultureQuery.error.message}
                  onRetry={() => void cultureQuery.refetch()}
                />
              ) : cultureQuery.data.length === 0 ? (
                <Card>
                  <T s={15} c={theme.colors.muted}>
                    Todavía no hay contenido cultural disponible.
                  </T>
                </Card>
              ) : (
                cultureQuery.data.map((content) => (
                  <CulturalInfoCard
                    key={content.id}
                    content={content}
                    accent={look.icon}
                    tint={look.soft}
                  />
                ))
              )}
            </>
          )}
        </View>
        <View style={{ marginTop: 16 }}>
          <PatternBand />
        </View>
      </View>
    </ScreenLayout>
  );
}

function InfoRow({
  icon,
  title,
  value,
  tint,
  color,
}: {
  icon: "message" | "users";
  title: string;
  value: string;
  tint: string;
  color: string;
}) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: 12, paddingVertical: 7 }}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: tint,
          borderRadius: 16,
          height: 32,
          justifyContent: "center",
          width: 32,
        }}
      >
        <Icon name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <T f="display" w={600} s={13.5}>
          {title}
        </T>
        <T s={12.5} lh={18} c={theme.colors.muted}>
          {value}
        </T>
      </View>
    </View>
  );
}
