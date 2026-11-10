import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { fontFamily, theme } from "../constants/theme";
import { T } from "./T";

interface TextFieldProps
  extends Pick<
    TextInputProps,
    | "autoCapitalize"
    | "autoComplete"
    | "autoCorrect"
    | "keyboardType"
    | "onSubmitEditing"
    | "returnKeyType"
    | "textContentType"
  > {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  /** Campo de contraseña: oculta el texto y agrega el botón mostrar/ocultar. */
  secure?: boolean;
  editable?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  secure = false,
  editable = true,
  ...inputProps
}: TextFieldProps) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={{ marginTop: theme.spacing.md + 2 }}>
      <T f="display" w={700} s={12} ls={0.6} c={theme.colors.primaryDark}>
        {label.toUpperCase()}
      </T>
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.colors.surfaceWhite,
          borderColor,
          borderRadius: 14,
          borderWidth: focused || error ? 2 : 1,
          flexDirection: "row",
          marginTop: 6,
          minHeight: 52,
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          editable={editable}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholderTextColor={theme.colors.muted}
          secureTextEntry={secure && hidden}
          style={{
            color: theme.colors.ink,
            flex: 1,
            fontFamily: fontFamily("body", 400, false),
            fontSize: 16,
            minHeight: 48,
            // react-native-web dibuja su propio contorno al enfocar; el borde ya lo indica.
            ...({ outlineStyle: "none" } as object),
          }}
          value={value}
        />
        {secure ? (
          <Pressable
            accessibilityLabel={hidden ? "Mostrar contraseña" : "Ocultar contraseña"}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setHidden((h) => !h)}
          >
            <T w={700} s={13} c={theme.colors.accent}>
              {hidden ? "Mostrar" : "Ocultar"}
            </T>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <T accessibilityRole="alert" w={600} s={12.5} c={theme.colors.danger} style={{ marginTop: 5 }}>
          {error}
        </T>
      ) : hint ? (
        <T s={12.5} c={theme.colors.muted} style={{ marginTop: 5 }}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}
