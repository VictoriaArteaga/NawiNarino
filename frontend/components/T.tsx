import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

import { fontFamily, theme, type FontKind } from "../constants/theme";

interface TProps extends TextProps {
  /** "display" = Outfit (titles, labels), "body" = Nunito Sans (paragraphs). */
  f?: FontKind;
  w?: 400 | 500 | 600 | 700 | 800;
  s?: number;
  c?: string;
  lh?: number;
  ls?: number;
  italic?: boolean;
  align?: TextStyle["textAlign"];
  style?: StyleProp<TextStyle>;
}

/** Text with the Ñawi-Nariño type system (Outfit for display, Nunito Sans for body). */
export function T({
  f = "body",
  w = 400,
  s = 14,
  c = theme.colors.ink,
  lh,
  ls,
  italic = false,
  align,
  style,
  ...rest
}: TProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          color: c,
          fontFamily: fontFamily(f, w, italic),
          fontSize: s,
          letterSpacing: ls,
          lineHeight: lh,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
