import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState, type PropsWithChildren } from "react";
import { Pressable, View } from "react-native";

import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon, type IconName } from "../components/Icon";
import { PasswordStrength } from "../components/PasswordStrength";
import { PlainScreen } from "../components/PlainScreen";
import { T } from "../components/T";
import { TextField } from "../components/TextField";
import { theme } from "../constants/theme";
import { useChangePassword, useLogout, useUpdateProfile } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";
import { passwordProblem } from "../utils/validation";

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
      <T f="display" w={700} s={16} c={theme.colors.primaryDark}>
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
      <Icon name={ok ? "check" : "warning"} size={18} color={ok ? "#1F5C3A" : theme.colors.danger} strokeWidth={2.2} />
      <T w={600} s={13.5} c={ok ? "#1F5C3A" : theme.colors.danger} style={{ flex: 1 }}>
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

function PasswordCard() {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saved, setSaved] = useState(false);

  function submit() {
    const found: typeof errors = {};
    if (!current) found.current = "Escribe tu contraseña actual";
    const problem = passwordProblem(next);
    if (problem) found.next = problem;
    if (confirm !== next) found.confirm = "Las contraseñas no coinciden";
    setErrors(found);
    setSaved(false);
    if (Object.keys(found).length > 0) return;
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
          setConfirm("");
          setSaved(true);
        },
      },
    );
  }

  const busy = change.isPending;
  return (
    <SectionCard title="Contraseña">
      <TextField
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!busy}
        error={errors.current}
        label="Contraseña actual"
        onChangeText={setCurrent}
        returnKeyType="next"
        secure
        textContentType="password"
        value={current}
      />
      <TextField
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!busy}
        error={errors.next}
        hint="Mínimo 8 caracteres, con letras y números."
        label="Contraseña nueva"
        onChangeText={setNext}
        returnKeyType="next"
        secure
        textContentType="newPassword"
        value={next}
      />
      <PasswordStrength password={next} />
      <TextField
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!busy}
        error={errors.confirm}
        label="Confirmar contraseña nueva"
        onChangeText={setConfirm}
        onSubmitEditing={submit}
        returnKeyType="go"
        secure
        textContentType="newPassword"
        value={confirm}
      />
      {change.isError ? <Message kind="error" text={errorText(change.error, "No pudimos cambiar la contraseña.")} /> : null}
      {saved ? <Message kind="ok" text="Contraseña actualizada." /> : null}
      <Button
        loading={busy}
        onPress={submit}
        style={{ marginTop: theme.spacing.md + 2 }}
        title={busy ? "Guardando…" : "Cambiar contraseña"}
      />
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
        borderBottomColor: "#F0E6D3",
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
          backgroundColor: "#E4EFE6",
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
      {onPress ? <Icon name="chevronRight" size={18} color="#8A8472" strokeWidth={2} /> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useLogout();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <PlainScreen backHref="/perfil" title="Ajustes" subtitle="Tu cuenta y la aplicación.">
      <NameCard />
      <PasswordCard />

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
