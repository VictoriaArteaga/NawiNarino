import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "../components/Pressable";

import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { T } from "../components/T";
import { TextField } from "../components/TextField";
import { theme } from "../constants/theme";
import { useLogin } from "../hooks/useAuth";
import { isValidEmail } from "../utils/validation";

import { useAppearance } from "../store/settingsStore";
export default function LoginScreen() {
  useAppearance();
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function submit() {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = "Escribe un correo válido";
    if (!password) next.password = "Escribe tu contraseña";
    setErrors(next);
    if (next.email || next.password) return;
    // Al iniciar sesión, la puerta de acceso del layout raíz lleva a /inicio.
    login.mutate({ email: email.trim(), password });
  }

  return (
    <AuthLayout tab="login" title="Bienvenido/a de nuevo" subtitle="Inicia sesión para continuar con tu aprendizaje.">
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!login.isPending}
        error={errors.email}
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={setEmail}
        returnKeyType="next"
        textContentType="emailAddress"
        value={email}
      />
      <TextField
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!login.isPending}
        error={errors.password}
        label="Contraseña"
        onChangeText={setPassword}
        onSubmitEditing={submit}
        returnKeyType="go"
        secure
        textContentType="password"
        value={password}
      />

      {login.isError ? (
        <View
          accessibilityRole="alert"
          style={{
            backgroundColor: theme.colors.softDanger,
            borderRadius: 12,
            marginTop: theme.spacing.md,
            padding: 12,
          }}
        >
          <T w={600} s={13.5} c={theme.colors.danger}>
            {login.error instanceof Error ? login.error.message : "No pudimos iniciar sesión."}
          </T>
        </View>
      ) : null}

      <Button
        loading={login.isPending}
        onPress={submit}
        style={{ marginTop: theme.spacing.lg }}
        title={login.isPending ? "Entrando…" : "Iniciar sesión"}
      />

      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 18 }}>
        <T s={14} c={theme.colors.body}>
          ¿Aún no tienes cuenta?{" "}
        </T>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.replace("/registro")}>
          <T w={700} s={14} c={theme.colors.accent}>
            Regístrate
          </T>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
