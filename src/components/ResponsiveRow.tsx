import { useWindowDimensions, View } from "react-native";
import type { ReactNode } from "react";

export const NARROW_BREAKPOINT = 380;

/** Lays children out side by side, or stacks them on narrow screens. */
export function ResponsiveRow({
  children,
  gap = 10,
  style,
}: {
  children: ReactNode[];
  gap?: number;
  style?: object;
}) {
  const { width } = useWindowDimensions();
  const narrow = width < NARROW_BREAKPOINT;

  return (
    <View
      style={[
        narrow ? { gap } : { flexDirection: "row", gap },
        style,
      ]}
    >
      {children.map((child, index) => (
        <View key={index} style={narrow ? undefined : { flex: 1 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
