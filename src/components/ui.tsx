import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

import { Colors, Fonts, Radius } from "@/constants/theme";
import { Icon, type IconName } from "./Icon";

export function IconButton({
  onPress,
  children,
  accessibilityLabel,
}: {
  onPress: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [ui.iconButton, pressed && ui.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        ui.primaryButton,
        (pressed || disabled || loading) && ui.primaryButtonDimmed,
        disabled && ui.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          {icon ? <Icon name={icon} size={22} color="#ffffff" /> : null}
          <Text style={ui.primaryButtonText}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [ui.secondaryButton, pressed && ui.pressed, style]}
    >
      {icon ? <Icon name={icon} size={20} color={Colors.ink} /> : null}
      <Text style={ui.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function PendingButton({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [ui.pendingButton, pressed && ui.pressed]}
    >
      {icon ? <Icon name={icon} size={22} color={Colors.muted} /> : null}
      <Text style={ui.pendingButtonText}>{title}</Text>
    </Pressable>
  );
}

export function WaitlistButton({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [ui.waitlistButton, pressed && ui.pressed]}
    >
      {icon ? <Icon name={icon} size={22} color={Colors.brand} /> : null}
      <Text style={ui.waitlistButtonText}>{title}</Text>
    </Pressable>
  );
}

export function TextButton({
  title,
  onPress,
}: {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={ui.textButton}>
      <Text style={ui.textButtonLabel}>{title}</Text>
    </Pressable>
  );
}

export function Toggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[ui.toggleTrack, { backgroundColor: value ? Colors.brand : Colors.border }]}
    >
      <View style={[ui.toggleThumb, { left: value ? 21 : 3 }]} />
    </Pressable>
  );
}

export function SafeNote({ icon = "shield", text }: { icon?: IconName; text: ReactNode }) {
  return (
    <View style={ui.safeNote}>
      <Icon name={icon} size={18} color={Colors.brand} />
      <Text style={ui.safeNoteText}>{text}</Text>
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={ui.eyebrow}>{children}</Text>;
}

const ui = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.42 },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.canvas,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: Radius.lg,
    width: "100%",
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  primaryButtonDimmed: { opacity: 0.92 },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    lineHeight: 20,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: Radius.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.canvas,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
  },
  secondaryButtonText: { color: Colors.ink, fontFamily: Fonts.bodyBold, fontSize: 16 },
  pendingButton: {
    width: "100%",
    minHeight: 58,
    borderRadius: Radius.lg,
    backgroundColor: Colors.graySoft,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
  },
  pendingButtonText: { color: Colors.muted, fontFamily: Fonts.bodyBold, fontSize: 16 },
  waitlistButton: {
    width: "100%",
    minHeight: 58,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
  },
  waitlistButtonText: { color: Colors.brand, fontFamily: Fonts.bodyBold, fontSize: 16 },
  textButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  textButtonLabel: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 15 },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 20,
    justifyContent: "center",
  },
  toggleThumb: {
    position: "absolute",
    top: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },
  safeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.blueSoft,
    borderRadius: Radius.md,
    padding: 12,
  },
  safeNoteText: {
    flex: 1,
    color: Colors.ink,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 19,
  },
  eyebrow: {
    color: Colors.muted,
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.6,
  },
});

