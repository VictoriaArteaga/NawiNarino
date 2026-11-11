import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { InfoCard } from "../../components/InfoCard";
import { Loading } from "../../components/Loading";
import { PlainScreen } from "../../components/PlainScreen";
import { T } from "../../components/T";
import { theme } from "../../constants/theme";
import { useSources } from "../../hooks/useHeritage";

import { useAppearance } from "../../store/settingsStore";
export default function SourcesScreen() {
  useAppearance();
  const query = useSources();

  return (
    <PlainScreen
      title="Fuentes"
      subtitle="Documentos reales del corpus, con autor, año y enlace."
      backHref="/patrimonio"
      backLabel="Explorar"
    >
      {query.isPending ? (
        <Loading label="Cargando fuentes..." />
      ) : query.isError ? (
        <ErrorMessage message={query.error.message} onRetry={() => void query.refetch()} />
      ) : query.data.length === 0 ? (
        <Card>
          <T c={theme.colors.muted}>No hay registros de fuentes disponibles.</T>
        </Card>
      ) : (
        query.data.map((source) => (
          <InfoCard
            key={source.id}
            title={source.title}
            description={`${source.author} · ${source.year ?? "Sin año"} · ${source.type}`}
            href={{ pathname: "/fuentes/[sourceId]", params: { sourceId: String(source.id) } }}
            mock={source.isMock}
          />
        ))
      )}
    </PlainScreen>
  );
}
