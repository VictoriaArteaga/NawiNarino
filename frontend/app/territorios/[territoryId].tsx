import { useLocalSearchParams } from "expo-router";

import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Field } from "../../components/Field";
import { Loading } from "../../components/Loading";
import { MockBadge } from "../../components/MockBadge";
import { InvalidIdScreen, PlainScreen } from "../../components/PlainScreen";
import { T } from "../../components/T";
import { theme } from "../../constants/theme";
import { useTerritory } from "../../hooks/useTerritories";

export default function TerritoryDetailScreen() {
  const { territoryId: rawId } = useLocalSearchParams<{ territoryId: string }>();
  const territoryId = Number(rawId);
  const validId = Number.isInteger(territoryId) && territoryId > 0;
  const query = useTerritory(territoryId);

  if (!validId) {
    return <InvalidIdScreen message="El identificador del territorio no es válido." />;
  }

  return (
    <PlainScreen
      title={query.data?.name ?? "Territorio"}
      subtitle="Detalles de un territorio de demostración."
      backHref="/mapa"
      backLabel="Mapa"
    >
      {query.isPending ? (
        <Loading label="Cargando territorio..." />
      ) : query.isError ? (
        <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
      ) : (
        <Card>
          <Field first label="Región" value={query.data.region} />
          <T s={14} lh={22} c={theme.colors.muted} style={{ marginTop: theme.spacing.lg - 4 }}>
            {query.data.description}
          </T>
          <T s={14} c={theme.colors.muted} style={{ marginTop: theme.spacing.lg - 4 }}>
            Coordenadas:{" "}
            {query.data.latitude === null || query.data.longitude === null
              ? "pendientes de validación"
              : `${query.data.latitude}, ${query.data.longitude}`}
          </T>
          {query.data.isMock ? <MockBadge /> : null}
        </Card>
      )}
    </PlainScreen>
  );
}
