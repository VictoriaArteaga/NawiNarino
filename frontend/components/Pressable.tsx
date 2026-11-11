import { useState } from "react";
import {
  Pressable as NativePressable,
  type GestureResponderEvent,
  type PressableProps,
  type PressableStateCallbackType,
} from "react-native";

/**
 * Pressable que resuelve `style` y `children` en función del estado ANTES de dárselos al componente nativo.
 *
 * Por qué: con NativeWind (jsxImportSource) los estilos escritos como función
 * (`style={({ pressed }) => ({ ... })}`) no llegan al Pressable nativo en el celular: la tarjeta pierde su
 * tamaño y su disposición (las ilustraciones se quedan con altura cero y "no se ve nada"). En el navegador
 * sí funcionan, por eso el fallo solo se nota en el APK. Con este wrapper el estilo siempre es un objeto fijo.
 */
export function Pressable({ style, children, onPressIn, onPressOut, ...rest }: PressableProps) {
  const [pressed, setPressed] = useState(false);
  const state = { pressed } as PressableStateCallbackType;
  const resolvedStyle = typeof style === "function" ? style(state) : style;
  const resolvedChildren = typeof children === "function" ? children(state) : children;

  return (
    <NativePressable
      {...rest}
      onPressIn={(event: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={resolvedStyle}
    >
      {resolvedChildren}
    </NativePressable>
  );
}
