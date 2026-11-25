import { usePathname, useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts } from "@/constants/theme";
import { Icon, type IconName } from "./Icon";

type Tab = {
  id: string;
  href: Href;
  label: string;
  icon: IconName;
};

const TABS: Tab[] = [
  { id: "inicio", href: "/", label: "Início", icon: "home" },
  { id: "viagens", href: "/viagens", label: "Caronas", icon: "car" },
  { id: "oferecer", href: "/oferecer", label: "Oferecer", icon: "plus" },
  { id: "mensagens", href: "/mensagens", label: "Chat", icon: "chat" },
  { id: "perfil", href: "/perfil", label: "Perfil", icon: "user" },
];

function activeTabId(pathname: string): string {
  if (pathname.startsWith("/viagens")) return "viagens";
  if (pathname.startsWith("/oferecer")) return "oferecer";
  if (pathname.startsWith("/mensagens")) return "mensagens";
  if (pathname.startsWith("/perfil")) return "perfil";
  return "inicio";
}

export function UnicarTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const active = activeTabId(pathname);

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(10, insets.bottom), height: 78 + Math.max(0, insets.bottom - 10) },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const color = isActive ? Colors.brand : Colors.muted;
        const isOffer = tab.id === "oferecer";

        return (
          <Pressable
            key={tab.id}
            onPress={() => router.navigate(tab.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={styles.tabButton}
          >
            {isOffer ? (
              <View style={styles.offerIcon}>
                <Icon name="plus" size={24} color="#ffffff" />
              </View>
            ) : (
              <View style={styles.iconSlot}>
                <Icon name={tab.icon} size={24} color={color} />
                {tab.id === "mensagens" && <View style={styles.navDot} />}
              </View>
            )}
            <Text style={[styles.label, { color }, isOffer && styles.offerLabel]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.canvas,
    paddingTop: 7,
    paddingHorizontal: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 12,
    overflow: "visible",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 2,
  },
  iconSlot: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  offerIcon: {
    width: 44,
    height: 44,
    marginTop: -24,
    borderRadius: 15,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  offerLabel: { marginTop: 3 },
  navDot: {
    position: "absolute",
    top: 3,
    right: -10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
});
