import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Text } from "react-native";

import { Colors, Fonts } from "@/constants/theme";

export type AvatarPerson = {
  name?: string;
  initials: string;
  color: string;
  photo?: string;
};

const SIZES = { sm: 29, md: 38, lg: 48, xl: 78 } as const;
const FONT_SIZES = { sm: 13, md: 15, lg: 16, xl: 22 } as const;

const BACKGROUNDS: Record<string, [string, string]> = {
  coral: ["#e17055", "#d63031"],
  blue: ["#74b9ff", "#0984e3"],
  green: ["#74b9ff", "#0984e3"],
  violet: ["#a29bfe", "#6c5ce7"],
};

export function Avatar({
  person,
  size = "md",
}: {
  person: AvatarPerson;
  size?: keyof typeof SIZES;
}) {
  const dimension = SIZES[size];
  const [from, to] = BACKGROUNDS[person.color] ?? BACKGROUNDS.blue;
  const borderWidth = size === "xl" ? 4 : 2;

  if (person.photo) {
    return (
      <Image
        source={{ uri: person.photo }}
        accessibilityLabel={person.name ? `Foto de ${person.name}` : "Avatar"}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderWidth,
          borderColor: Colors.surface,
        }}
        contentFit="cover"
        transition={120}
      />
    );
  }

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      accessibilityLabel={person.name ? `Foto de ${person.name}` : "Avatar"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        borderWidth,
        borderColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontFamily: Fonts.displayExtraBold,
          fontSize: FONT_SIZES[size],
          lineHeight: FONT_SIZES[size] + 2,
        }}
      >
        {person.initials}
      </Text>
    </LinearGradient>
  );
}
