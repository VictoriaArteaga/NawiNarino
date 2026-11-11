import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState, type PropsWithChildren } from "react";
import { Switch, View } from "react-native";
import { Pressable } from "../components/Pressable";

import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon, type IconName } from "../components/Icon";
import { PlainScreen } from "../components/PlainScreen";
import { T } from "../components/T";
import { TextField } from "../components/TextField";
import { theme, tone } from "../constants/theme";
import { useLogout, useUpdateProfile } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";
import { useSettingsStore } from "../store/settingsStore";

import { useAppearance } from "../store/settingsStore";
function SectionCard({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: 18,
        borderWidth: 1,
        marginTop: 14,
        paddingBottom: 16,
        paddingHorizontal: 14,
        paddingTop: 14,
      }}
    >
      <T f="display" w={700} s={16} c={theme.colors.heading}>
        {title}
      </T>
      {children}
    </View>
  );
}

function Message({ kind, text }: { kind: "ok" | "error"; text: string }) {
  const ok = kind === "ok";
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={ok ? "text" : "alert"}
      style={{
        alignItems: "center",
        backgroundColor: ok ? theme.colors.softGreen : theme.colors.softDanger,
        borderRadius: 12,
        flexDirection: "row",
        gap: 8,
        marginTop: theme.spacing.md,
        padding: 12,
      }}
    >
      <Icon name={ok ? "check" : "warning"} size={18} color={ok ? tone("#1F5C3A") : theme.colors.danger} strokeWidth={2.2} />
      <T w={600} s={13.5} c={ok ? tone("#1F5C3A") : theme.colors.danger} style={{ flex: 1 }}>
        {text}
      </T>
    </View>
  );
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function NameCard() {
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [problem, setProblem] = useState<string>();
  const [saved, setSaved] = useState(false);

  const clean = name.replace(/\s+/g, " ").trim();
  const changed = clean !== (user?.name ?? "");

  function submit() {
    if (clean.length < 2) {
      setProblem("Escribe tu nombre (mínimo 2 caracteres)");
      return;
    }
    setProblem(undefined);
    setSaved(false);
    update.mutate(clean, {
      onSuccess: (updated) => {
        setName(updated.name);
        setSaved(true);
      },
    });
  }

  return (
    <SectionCard title="Mi cuenta">
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12, marginTop: 12 }}>
        <Avatar size={56} />
        <View style={{ flex: 1 }}>
          <T f="display" w={700} s={16} lh={20} numberOfLines={1}>
            {user?.name ?? "Explorador/a Ñawi"}
          </T>
          <T s={13} c={theme.colors.muted} numberOfLines={1}>
            {user?.email ?? ""}
          </T>
        </View>
      </View>
      <TextField
        autoCapitalize="words"
        autoComplete="name"
        editable={!update.isPending}
        error={problem}
        label="Nombre"
        onChangeText={(value) => {
          setName(value);
          setSaved(false);
        }}
        onSubmitEditing={submit}
        returnKeyType="done"
        textContentType="name"
        value={name}
      />
      {update.isError ? <Message kind="error" text={errorText(update.error, "No pudimos guardar el nombre.")} /> : null}
      {saved && !changed ? <Message kind="ok" text="Nombre actualizado." /> : null}
      <Button
        disabled={!changed}
        loading={update.isPending}
        onPress={submit}
        style={{ marginTop: theme.spacing.md + 2 }}
        title={update.isPending ? "Guardando…" : "Guardar nombre"}
      />
    </SectionCard>
  );
}

/** Idioma y modo oscuro: se guardan en el dispositivo y se aplican al instante en toda la app. */
function AppearanceCard() {
  const language = useSettingsStore((st) => st.language);
  const dark = useSettingsStore((st) => st.dark);
  const setLanguage = useSettingsStore((st) => st.setLanguage);
  const setDark = useSettingsStore((st) => st.setDark);

  return (
    <SectionCard title="Apariencia e idioma">
      <View style={{ marginTop: 12 }}>
        <T f="display" w={700} s={12} ls={0.6} c={theme.colors.heading}>
          IDIOMA
        </T>
        <View
          style={{
            backgroundColor: theme.colors.track,
            borderRadius: 14,
            flexDirection: "row",
            marginTop: 6,
            padding: 4,
          }}
        >
          {(["es", "en"] as const).map((code, index) => {
            const active = language === code;
            return (
              <Pressable
                key={code}
                accessibilityLabel={code === "es" ? "Español" : "English"}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setLanguage(code)}
                style={{
                  alignItems: "center",
                  backgroundColor: active ? theme.colors.primary : "transparent",
                  borderRadius: 11,
                  flex: 1,
                  justifyContent: "center",
                  marginLeft: index === 0 ? 0 : 4,
                  minHeight: 44,
                }}
              >
                <T f="display" w={700} s={14.5} c={active ? "#FFFFFF" : theme.colors.body}>
                  {code === "es" ? "Español" : "English"}
                </T>
              </Pressable>
            );
          })}
        </View>
        <T s={12.5} lh={17} c={theme.colors.muted} style={{ marginTop: 6 }}>
          Elige el idioma de los menús y los textos.
        </T>
      </View>

      <View
        style={{
          alignItems: "center",
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          flexDirection: "row",
          marginTop: 14,
          paddingTop: 14,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: theme.colors.purpleSoft,
            borderRadius: 13,
            height: 42,
            justifyContent: "center",
            marginRight: 14,
            width: 42,
          }}
        >
          <Icon name="moon" size={22} color={theme.colors.purple} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <T f="display" w={700} s={15.5}>
            Modo oscuro
          </T>
          <T s={12.5} lh={17} c={theme.colors.muted}>
            Cambia los colores de toda la aplicación.
          </T>
        </View>
        <Switch
          accessibilityLabel="Modo oscuro"
          ios_backgroundColor={theme.colors.track}
          onValueChange={setDark}
          thumbColor="#FFFFFF"
          trackColor={{ false: theme.colors.track, true: theme.colors.primary }}
          value={dark}
        />
      </View>
    </SectionCard>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  last = false,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "link" : "text"}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        borderBottomColor: tone("#F0E6D3"),
        borderBottomWidth: last ? 0 : 1,
        flexDirection: "row",
        gap: 12,
        height: 50,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: tone("#E4EFE6"),
          borderRadius: 16,
          height: 32,
          justifyContent: "center",
          width: 32,
        }}
      >
        <Icon name={icon} size={18} color={theme.colors.primary} />
      </View>
      <T w={600} s={14.5} style={{ flex: 1 }}>
        {label}
      </T>
      {value ? (
        <T s={13.5} c={theme.colors.muted}>
          {value}
        </T>
      ) : null}
      {onPress ? <Icon name="chevronRight" size={18} color={tone("#8A8472")} strokeWidth={2} /> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  useAppearance();
  const router = useRouter();
  const logout = useLogout();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <PlainScreen backHref="/perfil" title="Ajustes" subtitle="Tu cuenta y la aplicación.">
      <NameCard />
      <AppearanceCard />

      <SectionCard title="La aplicación">
        <View style={{ marginTop: 4 }}>
          <Row icon="library" label="Fuentes y documentos" onPress={() => router.push("/fuentes")} />
          <Row icon="bulb" label="Versión" value={version} last />
        </View>
      </SectionCard>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          logout();
          router.replace("/");
        }}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: theme.colors.softDanger,
          borderRadius: 15,
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
          marginTop: 18,
          minHeight: 52,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="logout" size={20} color={theme.colors.danger} />
        <T f="display" w={700} s={16} c={theme.colors.danger}>
          Cerrar sesión
        </T>
      </Pressable>
    </PlainScreen>
  );
}
