import { View } from "react-native";

import { ProgressHero } from "../components/art/ProgressHero";
import { Avatar } from "../components/Avatar";
import { BackButton } from "../components/CircleButton";
import { Card } from "../components/Card";
import { ErrorMessage } from "../components/ErrorMessage";
import { Hero, useHeaderTop } from "../components/Hero";
import { Icon, type IconName } from "../components/Icon";
import { Loading } from "../components/Loading";
import { MockBadge } from "../components/MockBadge";
import { ScreenLayout } from "../components/ScreenLayout";
import { T } from "../components/T";
import { getLanguageTheme, sortLanguages } from "../constants/languages";
import { theme } from "../constants/theme";
import { useLanguages } from "../hooks/useLanguages";
import { useLanguageProgress, useProgress } from "../hooks/useLearning";
import type { Language } from "../types/language";
import type { ProgressSummary } from "../types/learning";

const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

/** Monday-based index (0–6) of a date. */
function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

/** Which days of the current week (Mon–Sun) have a completed activity. */
function activeDays(summary: ProgressSummary) {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - weekdayIndex(now));
  const next = new Date(monday);
  next.setDate(monday.getDate() + 7);

  const days = new Set<number>();
  for (const record of summary.activities) {
    if (!record.completedAt) continue;
    const date = new Date(record.completedAt);
    if (date >= monday && date < next) days.add(weekdayIndex(date));
  }
  return days;
}

export default function ProgressScreen() {
  const query = useProgress();
  const languages = useLanguages();
  const headerTop = useHeaderTop();

  return (
    <ScreenLayout nav="aprender">
      <Hero height={200} art={<ProgressHero preserveAspectRatio="xMidYMin slice" />}>
        <View style={{ left: 14, position: "absolute", top: headerTop }}>
          <BackButton fallback="/inicio" />
        </View>
        <View style={{ left: 68, position: "absolute", top: headerTop + 4 }}>
          <T accessibilityRole="header" f="display" w={800} s={23} lh={28} c={theme.colors.primaryDark}>
            Tu progreso
          </T>
        </View>
        {query.data ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.gold,
              borderRadius: 16,
              flexDirection: "row",
              gap: 5,
              height: 32,
              paddingLeft: 9,
              paddingRight: 12,
              position: "absolute",
              right: 20,
              top: headerTop + 6,
            }}
          >
            <Icon name="star" size={15} color="#2B1D05" fill="#2B1D05" strokeWidth={1} />
            <T f="display" w={800} s={14} c="#2B1D05">
              {Math.round(query.data.percentage)}% total
            </T>
          </View>
        ) : null}
      </Hero>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Profile (overlaps the illustration, as in the design) */}
        <View style={{ alignItems: "center", flexDirection: "row", gap: 14, marginTop: -50 }}>
          <Avatar size={92} ring progress={query.data?.percentage ?? 0} />
          <View style={{ flex: 1, paddingTop: 28 }}>
            <T f="display" w={800} s={20} lh={24} c={theme.colors.ink} numberOfLines={1}>
              Explorador/a Ñawi
            </T>
            <T s={13.5} c={theme.colors.muted} style={{ marginTop: 2 }}>
              Sigues aprendiendo.
            </T>
          </View>
        </View>

        {query.isPending ? (
          <Loading label="Cargando progreso..." />
        ) : query.isError ? (
          <View style={{ marginTop: 14 }}>
            <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Stat
                icon="tasks"
                bg="#E4EFE6"
                stroke="#2F6F4E"
                value={`${query.data.completedActivities}/${query.data.totalActivities}`}
                valueColor="#1F5C3A"
                label="actividades completadas"
              />
              <Stat
                icon="star"
                bg="#F8E4C0"
                stroke="#B9701A"
                fill="#E8A33D"
                value={`${Math.round(query.data.averageScore)}`}
                valueColor="#8A5200"
                label="puntaje promedio"
              />
              <Stat
                icon="flame"
                bg="#FBE3D6"
                stroke={theme.colors.accent}
                fill={theme.colors.accent}
                value={`${Math.max(0, query.data.totalActivities - query.data.completedActivities)}`}
                valueColor={theme.colors.accent}
                label="por completar"
              />
            </View>

            {/* Week */}
            <WeekCard summary={query.data} />

            {/* Per-language progress */}
            <View style={{ marginTop: 14 }}>
              <T f="display" w={700} s={16} c={theme.colors.primaryDark} style={{ marginBottom: 8 }}>
                Tus avances
              </T>
              <Card style={{ gap: 14, paddingVertical: 14 }}>
                {languages.isPending ? (
                  <Loading label="Cargando lenguas..." />
                ) : languages.isError ? (
                  <ErrorMessage message={languages.error.message} onRetry={() => void languages.refetch()} />
                ) : languages.data.length === 0 ? (
                  <T s={14} c={theme.colors.muted}>
                    Completa una actividad de demostración para ver tu avance aquí.
                  </T>
                ) : (
                  sortLanguages(languages.data).map((language) => <LanguageBar key={language.id} language={language} />)
                )}
              </Card>
              <MockBadge />
            </View>

            {/* Tip */}
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.colors.mockBackground,
                borderRadius: 16,
                flexDirection: "row",
                gap: 12,
                marginTop: 14,
                minHeight: 56,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Icon name="flame" size={28} color="#B9701A" fill={theme.colors.gold} strokeWidth={1.2} />
              <View style={{ flex: 1 }}>
                <T f="display" w={700} s={14} c={theme.colors.mockText}>
                  ¡Sigue explorando!
                </T>
                <T s={12.5} lh={16} c={theme.colors.mockText}>
                  Cada palabra te acerca más al territorio.
                </T>
              </View>
            </View>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}

function Stat({
  icon,
  bg,
  stroke,
  fill = "none",
  value,
  valueColor,
  label,
}: {
  icon: IconName;
  bg: string;
  stroke: string;
  fill?: string;
  value: string;
  valueColor: string;
  label: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: 16,
        borderWidth: 1,
        flex: 1,
        gap: 2,
        paddingHorizontal: 8,
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: 17,
          height: 34,
          justifyContent: "center",
          width: 34,
        }}
      >
        <Icon name={icon} size={20} color={stroke} fill={fill} strokeWidth={1.8} />
      </View>
      <T f="display" w={800} s={19} lh={24} c={valueColor}>
        {value}
      </T>
      <T s={11.5} lh={14} align="center" c={theme.colors.muted}>
        {label}
      </T>
    </View>
  );
}

function WeekCard({ summary }: { summary: ProgressSummary }) {
  const days = activeDays(summary);
  const today = weekdayIndex(new Date());

  return (
    <Card style={{ marginTop: 14, paddingBottom: 14, paddingTop: 12 }}>
      <View style={{ alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" }}>
        <T f="display" w={700} s={16} c={theme.colors.primaryDark}>
          Esta semana
        </T>
        <T w={700} s={12} c={theme.colors.accent}>
          {days.size} de 7 días
        </T>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        {weekdays.map((name, index) => {
          const done = days.has(index);
          const isToday = index === today;
          return (
            <View key={name} style={{ alignItems: "center", gap: 5 }}>
              <View
                accessibilityLabel={`${name}: ${done ? "actividad completada" : "sin actividad"}`}
                style={{
                  alignItems: "center",
                  backgroundColor: done ? theme.colors.accent : theme.colors.track,
                  borderColor: isToday ? theme.colors.accent : "transparent",
                  borderRadius: 19,
                  borderWidth: isToday ? 2 : 0,
                  height: 38,
                  justifyContent: "center",
                  width: 38,
                }}
              >
                {done ? <Icon name="flame" size={20} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1} /> : null}
              </View>
              <T f="display" w={isToday ? 800 : 600} s={12} c={theme.colors.muted}>
                {name}
              </T>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function LanguageBar({ language }: { language: Language }) {
  const progress = useLanguageProgress(language.id);
  const look = getLanguageTheme(language.name);
  const percentage = Math.round(progress.data?.percentage ?? 0);

  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 7 }}>
          <View style={{ backgroundColor: look.ring, borderRadius: 3, height: 10, width: 10 }} />
          <T w={700} s={13.5}>
            {language.name}
          </T>
        </View>
        <T w={700} s={13.5} c={theme.colors.muted}>
          {progress.data ? `${percentage}%` : "–"}
        </T>
      </View>
      <View style={{ backgroundColor: theme.colors.track, borderRadius: 5, height: 9 }}>
        <View style={{ backgroundColor: look.ring, borderRadius: 5, height: 9, width: `${percentage}%` }} />
      </View>
    </View>
  );
}
