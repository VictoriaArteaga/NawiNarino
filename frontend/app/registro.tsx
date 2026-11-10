import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { PasswordStrength } from "../components/PasswordStrength";
import { T } from "../components/T";
import { TextField } from "../components/TextField";
import { theme } from "../constants/theme";
import { useRegister } from "../hooks/useAuth";
import { isValidEmail, passwordProblem } from "../utils/validation";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function submit() {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Escribe tu nombre (mínimo 2 caracteres)";
    if (!isValidEmail(email)) next.email = "Escribe un correo válido";
    const problem = passwordProblem(password);
    if (problem) next.password = problem;
    if (confirm !== password) next.confirm = "Las contraseñas no coinciden";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // Al crear la cuenta se inicia sesión y el layout raíz lleva a /inicio.
    register.mutate({ name: name.trim(), email: email.trim(), password });
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Guarda tu progreso y sigue aprendiendo las lenguas de Nariño.">
      <TextField
        autoCapitalize="words"
        autoComplete="name"
        editable={!register.isPending}
        error={errors.name}
        label="Nombre"
        onChangeText={setName}
        returnKeyType="next"
        textContentType="name"
        value={name}
      />
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!register.isPending}
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
        autoComplete="new-password"
        editable={!register.isPending}
        error={errors.password}
        hint="Mínimo 8 caracteres, con letras y números."
        label="Contraseña"
        onChangeText={setPassword}
        returnKeyType="next"
        secure
        textContentType="newPassword"
        value={password}
      />
      <PasswordStrength password={password} />
      <TextField
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!register.isPending}
        error={errors.confirm}
        label="Confirmar contraseña"
        onChangeText={setConfirm}
        onSubmitEditing={submit}
        returnKeyType="go"
        secure
        textContentType="newPassword"
        value={confirm}
      />

      {register.isError ? (
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
            {register.error instanceof Error
              ? register.error.message
              : "No pudimos crear la cuenta."}
          </T>
        </View>
      ) : null}

      <Button
        loading={register.isPending}
        onPress={submit}
        style={{ marginTop: theme.spacing.lg }}
        title={register.isPending ? "Creando cuenta…" : "Crear cuenta"}
      />

      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 18 }}>
        <T s={14} c={theme.colors.body}>
          ¿Ya tienes cuenta?{" "}
        </T>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.replace("/login")}>
          <T w={700} s={14} c={theme.colors.accent}>
            Inicia sesión
          </T>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
