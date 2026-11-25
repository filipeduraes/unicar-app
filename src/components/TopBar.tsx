import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts } from "@/constants/theme";
import { Icon } from "./Icon";
import { IconButton } from "./ui";

const logoTransparent = require("@/assets/images/unicar-logo-transparent.png");

export function TopBar({
  title,
  subtitle,
  onBack,
  onBell,
  unread = true,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onBell?: () => void;
  unread?: boolean;
  action?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.surface,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
        {onBack ? (
          <IconButton onPress={onBack} accessibilityLabel="Voltar">
            <Icon name="back" size={22} />
          </IconButton>
        ) : (
          <Image
            source={logoTransparent}
            accessibilityLabel="Unicar"
            style={{ width: 44, height: 44 }}
            contentFit="contain"
          />
        )}
        <View style={{ flexShrink: 1 }}>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={{
                color: Colors.muted,
                fontFamily: Fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 1.4,
                lineHeight: 16,
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </Text>
          ) : null}
          <Text
            numberOfLines={1}
            style={{
              color: Colors.ink,
              fontFamily: Fonts.displayExtraBold,
              fontSize: 24,
              lineHeight: 27,
              letterSpacing: -0.8,
            }}
          >
            {title}
          </Text>
        </View>
      </View>
      {action ??
        (onBell ? (
          <IconButton onPress={onBell} accessibilityLabel="Notificações">
            <View>
              <Icon name="bell" size={22} />
              {unread ? (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: Colors.error,
                    borderWidth: 1.5,
                    borderColor: Colors.surface,
                  }}
                />
              ) : null}
            </View>
          </IconButton>
        ) : null)}
    </View>
  );
}
