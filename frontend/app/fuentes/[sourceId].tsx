import { useLocalSearchParams } from "expo-router";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Field } from "../../components/Field";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { InvalidIdScreen, PlainScreen } from "../../components/PlainScreen";
import { T } from "../../components/T";
import { theme } from "../../constants/theme";
import { useSource } from "../../hooks/useHeritage";

import { useAppearance } from "../../store/settingsStore";
export default function SourceDetailScreen() {
  useAppearance();
  const { sourceId: rawId } = useLocalSearchParams<{ sourceId: string }>();
  const sourceId = Number(rawId);
  const validId = Number.isInteger(sourceId) && sourceId > 0;
  const query = useSource(sourceId);

  if (!validId) {
    return <InvalidIdScreen message="El identificador de la fuente no es válido." />;
  }

  return (
    <PlainScreen
      title={query.data?.title ?? "Fuente"}
      subtitle="Documento del corpus."
      backHref="/fuentes"
      backLabel="Fuentes"
    >
      {query.isPending ? (
        <Loading label="Cargando fuente..." />
      ) : query.isError ? (
        <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
      ) : (
        <Card>
          <T f="display" w={700} s={16}>
            {query.data.author} · {query.data.year ?? "Sin año"}
          </T>
          <Field label="Tipo" value={query.data.type} />
          <Field label="Referencia" value={query.data.reference} />
          <T s={14} lh={22} c={theme.colors.muted} style={{ marginTop: theme.spacing.lg - 4 }}>
            {query.data.description}
          </T>
          {query.data.isMock ? <MockBadge /> : null}
        </Card>
      )}
    </PlainScreen>
  );
}
