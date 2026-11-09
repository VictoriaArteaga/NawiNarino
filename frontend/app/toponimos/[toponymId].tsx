import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Field } from "../../components/Field";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { InvalidIdScreen, PlainScreen } from "../../components/PlainScreen";
import { T } from "../../components/T";
import { theme } from "../../constants/theme";
import { useToponym } from "../../hooks/useHeritage";

export default function ToponymDetailScreen() {
  const router = useRouter();
  const { toponymId: rawId } = useLocalSearchParams<{ toponymId: string }>();
  const toponymId = Number(rawId);
  const validId = Number.isInteger(toponymId) && toponymId > 0;
  const query = useToponym(toponymId);

  if (!validId) {
    return <InvalidIdScreen message="El identificador del topónimo no es válido." />;
  }

  return (
    <PlainScreen
      title={query.data?.name ?? "Topónimo"}
      subtitle="El significado no se presenta como un hecho."
      backHref="/toponimos"
      backLabel="Topónimos"
    >
      {query.isPending ? (
        <Loading label="Cargando topónimo..." />
      ) : query.isError ? (
        <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
      ) : (
        <Card>
          <Field first label="Significado" value={query.data.meaning} />
          <Field label="Descripción" value={query.data.description} />
          <Field label="Contexto histórico" value={query.data.historicalContext} />
          {query.data.source ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: "/fuentes/[sourceId]",
                  params: { sourceId: String(query.data.source?.id) },
                })
              }
              style={{ justifyContent: "center", marginTop: theme.spacing.lg - 4, minHeight: 44 }}
            >
              <T f="display" w={700} s={14.5} c={theme.colors.accent}>
                Fuente: {query.data.source.title}
              </T>
            </Pressable>
          ) : null}
          {query.data.isMock ? <MockBadge /> : null}
        </Card>
      )}
    </PlainScreen>
  );
}
