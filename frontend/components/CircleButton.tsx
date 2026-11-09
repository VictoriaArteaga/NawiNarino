import { useRouter, type Href } from "expo-router";
import { Pressable, type ViewStyle } from "react-native";

import { shadows, theme } from "../constants/theme";
import { Icon, type IconName } from "./Icon";

interface CircleButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  background?: string;
  borderColor?: string;
  size?: number;
  iconSize?: number;
  fill?: string;
  style?: ViewStyle;
}

/** Round icon button (back, save, settings…) used over illustrated headers. */
export function CircleButton({
  icon,
  label,
  onPress,
  color = theme.colors.primaryDark,
  background = "rgba(251,243,230,0.9)",
  borderColor,
  size = 44,
  iconSize = 22,
  fill,
  style,
}: CircleButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: background,
          borderColor,
          borderRadius: size / 2,
          borderWidth: borderColor ? 1 : 0,
          height: size,
          justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
          width: size,
        },
        borderColor ? undefined : shadows.soft,
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={color}
        fill={fill}
        strokeWidth={2.2}
      />
    </Pressable>
  );
}

interface BackButtonProps
  extends Omit<CircleButtonProps, "icon" | "label" | "onPress"> {
  /** Where to go when there is no history (e.g. a deep link). */
  fallback: Href;
  label?: string;
}

export function BackButton({
  fallback,
  label = "Volver",
  ...rest
}: BackButtonProps) {
  const router = useRouter();
  return (
    <CircleButton
      icon="arrowLeft"
      label={label}
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace(fallback);
      }}
      {...rest}
    />
  );
}
