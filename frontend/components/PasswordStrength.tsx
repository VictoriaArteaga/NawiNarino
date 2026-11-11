import { View } from "react-native";

import { theme } from "../constants/theme";
import { T } from "./T";

/** Niveles del medidor (se calculan al dibujar para seguir el modo claro/oscuro). */
const levels = () =>
  [
    { label: "Débil", color: theme.colors.danger },
    { label: "Aceptable", color: theme.colors.gold },
    { label: "Buena", color: theme.colors.primary },
    { label: "Fuerte", color: theme.colors.heading },
  ] as const;

/** 0 = vacía; 1–4 según longitud y variedad de caracteres. */
export function passwordScore(password: string): number {
  if (!password) return 0;
  let score = 1;
  if (password.length >= 8 && /[A-Za-zÀ-ɏ]/.test(password) && /\d/.test(password)) score++;
  if (password.length >= 12) score++;
  if (/[^A-Za-z0-9]/.test(password) && /[A-ZÀ-Þ]/.test(password)) score++;
  return Math.min(score, 4);
}

/** Medidor de cuatro tramos bajo el campo de contraseña. */
export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  if (score === 0) return null;
  const all = levels();
  const level = all[score - 1];

  return (
    <View
      accessibilityLabel={`Fuerza de la contraseña: ${level.label}`}
      accessibilityLiveRegion="polite"
      style={{ alignItems: "center", flexDirection: "row", gap: 6, marginTop: 8 }}
    >
      {all.map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: index < score ? level.color : theme.colors.track,
            borderRadius: 3,
            flex: 1,
            height: 5,
          }}
        />
      ))}
      <T f="display" w={700} s={12} c={level.color} style={{ minWidth: 64, textAlign: "right" }}>
        {level.label}
      </T>
    </View>
  );
}
