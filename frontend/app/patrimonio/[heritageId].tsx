import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "../../components/Pressable";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { InvalidIdScreen, PlainScreen } from "../../components/PlainScreen";
import { T } from "../../components/T";
import { theme } from "../../constants/theme";
import { useHeritageItem } from "../../hooks/useHeritage";
import type { HeritageCategory } from "../../types/heritage";

import { useAppearance } from "../../store/settingsStore";
const categoryLabels: Record<HeritageCategory, string> = {
  historical: "Histórico",
  linguistic: "Lingüístico",
  cultural: "Cultural",
  toponymy: "Toponimia",
};

export default function HeritageDetailScreen() {
  useAppearance();
  const router = useRouter();
  const { heritageId: rawId } = useLocalSearchParams<{ heritageId: string }>();
  const heritageId = Number(rawId);
  const validId = Number.isInteger(heritageId) && heritageId > 0;
  const query = useHeritageItem(heritageId);

  if (!validId) {
    return <InvalidIdScreen message="El identificador del registro patrimonial no es válido." />;
  }

  return (
    <PlainScreen
      title={query.data?.title ?? "Detalle del patrimonio"}
      subtitle="Registro del patrimonio."
      backHref="/patrimonio"
      backLabel="Explorar"
    >
      {query.isPending ? (
        <Loading label="Cargando registro patrimonial..." />
      ) : query.isError ? (
        <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
      ) : (
        <Card>
          <T f="display" w={700} s={12} ls={0.8} c={theme.colors.primary}>
            {categoryLabels[query.data.category].toUpperCase()}
          </T>
          <T s={14} c={theme.colors.muted} style={{ marginTop: theme.spacing.md }}>
            {query.data.dateLabel ?? "Sin fecha"}
          </T>
          <T s={15} lh={23} c={theme.colors.ink} style={{ marginTop: theme.spacing.lg - 4 }}>
            {query.data.description}
          </T>
          {query.data.sourceId ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: "/fuentes/[sourceId]",
                  params: { sourceId: String(query.data.sourceId) },
                })
              }
              style={{ marginTop: theme.spacing.lg - 4, minHeight: 44, justifyContent: "center" }}
            >
              <T f="display" w={700} s={14.5} c={theme.colors.accent}>
                Abrir la fuente asociada
              </T>
            </Pressable>
          ) : null}
          {query.data.isMock ? <MockBadge /> : null}
        </Card>
      )}
    </PlainScreen>
  );
}
