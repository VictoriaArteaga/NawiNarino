import { View } from "react-native";

import { BackButton } from "../../components/CircleButton";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { LanguageCard } from "../../components/LanguageCard";
import { Loading } from "../../components/Loading";
import { ScreenLayout } from "../../components/ScreenLayout";
import { T } from "../../components/T";
import { useHeaderTop } from "../../components/Hero";
import { useLanguages } from "../../hooks/useLanguages";
import { sortLanguages } from "../../constants/languages";
import { theme } from "../../constants/theme";

export default function LanguagesScreen() {
  const languagesQuery = useLanguages();
  const headerTop = useHeaderTop();

  return (
    <ScreenLayout nav="aprender" navColor={theme.colors.primary}>
      <View style={{ paddingHorizontal: 14, paddingTop: headerTop + 4 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
          <BackButton
            fallback="/inicio"
            color="#25674F"
            background="transparent"
          />
          <T
            accessibilityRole="header"
            f="display"
            w={600}
            s={20}
            lh={28}
            c={theme.colors.ink}
          >
            Lenguas indígenas
          </T>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <T s={15.5} lh={20} c="#6A6A62" style={{ marginBottom: 16, marginTop: 4 }}>
          Cuatro lenguas, un mismo territorio.
        </T>

        {languagesQuery.isPending ? (
          <Loading label="Cargando lenguas..." />
        ) : languagesQuery.isError ? (
          <ErrorMessage
            message={languagesQuery.error.message}
            onRetry={() => void languagesQuery.refetch()}
          />
        ) : languagesQuery.data.length === 0 ? (
          <Card>
            <T f="display" w={800} s={18}>
              Aún no hay lenguas disponibles
            </T>
            <T s={15} lh={22} c={theme.colors.muted} style={{ marginTop: theme.spacing.sm }}>
              Vuelve a revisar cuando se hayan agregado registros de lenguas.
            </T>
          </Card>
        ) : (
          <>
            <View
              style={{
                backgroundColor: theme.colors.mockBackground,
                borderRadius: 14,
                marginBottom: 14,
                padding: 12,
              }}
            >
              <T w={700} s={12.5} lh={18} c={theme.colors.mockText}>
                Son registros de demostración. Los nombres y cualquier contenido
                futuro deben confirmarse antes de presentarse como verificados.
              </T>
            </View>
            <View style={{ gap: 14 }}>
              {sortLanguages(languagesQuery.data).map((language) => (
                <LanguageCard key={language.id} language={language} />
              ))}
            </View>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
